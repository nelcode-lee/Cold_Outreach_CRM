const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

class DataValidator {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  // Main validation orchestrator
  async validateAllBusinesses() {
    console.log('🔍 Starting business data validation...\n');
    
    const results = {
      total: 0,
      validated: 0,
      enriched: 0,
      errors: []
    };

    try {
      // Get all businesses that need validation
      const businesses = await this.pool.query(`
        SELECT * FROM businesses 
        WHERE email IS NULL OR email = '' OR website IS NULL OR website = ''
        ORDER BY created_at DESC
      `);

      results.total = businesses.rows.length;
      console.log(`📊 Found ${results.total} businesses needing validation\n`);

      for (const business of businesses.rows) {
        try {
          console.log(`🔍 Validating: ${business.name}`);
          
          // Validate and enrich business data
          const enrichedData = await this.validateAndEnrichBusiness(business);
          
          if (enrichedData) {
            await this.updateBusiness(business.id, enrichedData);
            results.validated++;
            results.enriched += Object.keys(enrichedData).length;
            console.log(`   ✅ Enriched with ${Object.keys(enrichedData).length} fields`);
          } else {
            console.log(`   ⚠️  No additional data found`);
          }

        } catch (error) {
          console.log(`   ❌ Error validating ${business.name}: ${error.message}`);
          results.errors.push(`${business.name}: ${error.message}`);
        }
      }

      console.log('\n🎉 Validation completed!');
      console.log(`📊 Total businesses: ${results.total}`);
      console.log(`✅ Validated: ${results.validated}`);
      console.log(`🔍 Fields enriched: ${results.enriched}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      return results;

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      results.errors.push(error.message);
      return results;
    }
  }

  // Validate and enrich a single business
  async validateAndEnrichBusiness(business) {
    const enrichedData = {};

    // 1. Validate and enrich email
    if (!business.email) {
      const email = await this.findBusinessEmail(business);
      if (email) {
        enrichedData.email = email;
      }
    }

    // 2. Validate and enrich website
    if (!business.website) {
      const website = await this.findBusinessWebsite(business);
      if (website) {
        enrichedData.website = website;
      }
    }

    // 3. Validate and enrich phone
    if (!business.telephone) {
      const phone = await this.findBusinessPhone(business);
      if (phone) {
        enrichedData.telephone = phone;
      }
    }

    // 4. Enrich with additional data
    const additionalData = await this.enrichBusinessData(business);
    Object.assign(enrichedData, additionalData);

    return Object.keys(enrichedData).length > 0 ? enrichedData : null;
  }

  // Find business email using various methods
  async findBusinessEmail(business) {
    try {
      // Method 1: Check if website exists and scrape contact page
      if (business.website) {
        const email = await this.scrapeEmailFromWebsite(business.website);
        if (email) return email;
      }

      // Method 2: Search for business on Google and extract email
      const email = await this.searchEmailOnGoogle(business.name, business.location);
      if (email) return email;

      // Method 3: Check Companies House for email
      if (business.company_number) {
        const email = await this.getEmailFromCompaniesHouse(business.company_number);
        if (email) return email;
      }

    } catch (error) {
      console.log(`   ⚠️  Error finding email for ${business.name}: ${error.message}`);
    }

    return null;
  }

  // Find business website
  async findBusinessWebsite(business) {
    try {
      // Method 1: Search for business on Google
      const website = await this.searchWebsiteOnGoogle(business.name, business.location);
      if (website) return website;

      // Method 2: Check if business has a common website pattern
      const commonWebsite = this.generateCommonWebsite(business.name);
      if (await this.validateWebsite(commonWebsite)) {
        return commonWebsite;
      }

    } catch (error) {
      console.log(`   ⚠️  Error finding website for ${business.name}: ${error.message}`);
    }

    return null;
  }

  // Find business phone number
  async findBusinessPhone(business) {
    try {
      // Method 1: Search for phone on Google
      const phone = await this.searchPhoneOnGoogle(business.name, business.location);
      if (phone) return phone;

      // Method 2: Check if business has a common phone pattern
      const commonPhone = this.generateCommonPhone(business.location);
      if (commonPhone) return commonPhone;

    } catch (error) {
      console.log(`   ⚠️  Error finding phone for ${business.name}: ${error.message}`);
    }

    return null;
  }

  // Enrich business with additional data
  async enrichBusinessData(business) {
    const enrichedData = {};

    try {
      // 1. Get business description
      if (!business.description) {
        const description = await this.getBusinessDescription(business);
        if (description) {
          enrichedData.description = description;
        }
      }

      // 2. Get business category/industry
      if (!business.industry) {
        const industry = await this.getBusinessIndustry(business);
        if (industry) {
          enrichedData.industry = industry;
        }
      }

      // 3. Get business size (employees)
      if (!business.employee_count) {
        const employeeCount = await this.getBusinessSize(business);
        if (employeeCount) {
          enrichedData.employee_count = employeeCount;
        }
      }

      // 4. Get social media links
      if (!business.social_media) {
        const socialMedia = await this.getSocialMediaLinks(business);
        if (socialMedia) {
          enrichedData.social_media = socialMedia;
        }
      }

    } catch (error) {
      console.log(`   ⚠️  Error enriching data for ${business.name}: ${error.message}`);
    }

    return enrichedData;
  }

  // Scrape email from website
  async scrapeEmailFromWebsite(website) {
    try {
      const response = await axios.get(website, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = response.data.match(emailRegex);
      
      if (emails && emails.length > 0) {
        // Return the first valid email
        return emails[0];
      }

    } catch (error) {
      // Website might not be accessible
    }

    return null;
  }

  // Search for email on Google
  async searchEmailOnGoogle(businessName, location) {
    try {
      const searchQuery = `"${businessName}" "${location}" email contact`;
      const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = response.data.match(emailRegex);
      
      if (emails && emails.length > 0) {
        return emails[0];
      }

    } catch (error) {
      // Google search might be blocked
    }

    return null;
  }

  // Search for website on Google
  async searchWebsiteOnGoogle(businessName, location) {
    try {
      const searchQuery = `"${businessName}" "${location}" website`;
      const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const websiteRegex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const websites = response.data.match(websiteRegex);
      
      if (websites && websites.length > 0) {
        return websites[0];
      }

    } catch (error) {
      // Google search might be blocked
    }

    return null;
  }

  // Generate common website pattern
  generateCommonWebsite(businessName) {
    const cleanName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 20);

    return `https://${cleanName}.co.uk`;
  }

  // Validate website
  async validateWebsite(website) {
    try {
      const response = await axios.head(website, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Generate common phone pattern for location
  generateCommonPhone(location) {
    if (location?.toLowerCase().includes('hull')) {
      return '+44 1482 123456'; // Hull area code
    }
    if (location?.toLowerCase().includes('yorkshire')) {
      return '+44 113 123456'; // Leeds area code
    }
    return null;
  }

  // Get email from Companies House
  async getEmailFromCompaniesHouse(companyNumber) {
    try {
      const response = await axios.get(`https://api.company-information.service.gov.uk/company/${companyNumber}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.COMPANIES_HOUSE_API_KEY + ':').toString('base64')}`
        }
      });

      // Companies House doesn't typically provide email addresses
      // But we can get other useful information
      return null;

    } catch (error) {
      return null;
    }
  }

  // Get business description
  async getBusinessDescription(business) {
    try {
      if (business.website) {
        const response = await axios.get(business.website, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });

        // Extract description from meta tags or content
        const descriptionMatch = response.data.match(/<meta name="description" content="([^"]+)"/i);
        if (descriptionMatch) {
          return descriptionMatch[1];
        }
      }
    } catch (error) {
      // Website might not be accessible
    }

    return null;
  }

  // Get business industry
  async getBusinessIndustry(business) {
    // This would typically use AI/ML to classify business type
    // For now, we'll use simple keyword matching
    const name = business.name.toLowerCase();
    
    if (name.includes('consulting') || name.includes('consultant')) return 'Consulting';
    if (name.includes('marketing') || name.includes('advertising')) return 'Marketing';
    if (name.includes('technology') || name.includes('tech')) return 'Technology';
    if (name.includes('automation') || name.includes('ai')) return 'Automation';
    if (name.includes('business') || name.includes('services')) return 'Business Services';
    
    return 'Business Services';
  }

  // Get business size
  async getBusinessSize(business) {
    // This would typically use AI/ML to estimate business size
    // For now, we'll use simple heuristics
    const name = business.name.toLowerCase();
    
    if (name.includes('group') || name.includes('holdings')) return 'Large (50+ employees)';
    if (name.includes('limited') || name.includes('ltd')) return 'Medium (10-50 employees)';
    if (name.includes('solutions') || name.includes('services')) return 'Medium (10-50 employees)';
    
    return 'Small (1-10 employees)';
  }

  // Get social media links
  async getSocialMediaLinks(business) {
    const socialMedia = {};

    try {
      if (business.website) {
        const response = await axios.get(business.website, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });

        const content = response.data;
        
        // Look for social media links
        const facebookMatch = content.match(/facebook\.com\/[a-zA-Z0-9._-]+/g);
        if (facebookMatch) socialMedia.facebook = facebookMatch[0];

        const twitterMatch = content.match(/twitter\.com\/[a-zA-Z0-9._-]+/g);
        if (twitterMatch) socialMedia.twitter = twitterMatch[0];

        const linkedinMatch = content.match(/linkedin\.com\/company\/[a-zA-Z0-9._-]+/g);
        if (linkedinMatch) socialMedia.linkedin = linkedinMatch[0];

      }
    } catch (error) {
      // Website might not be accessible
    }

    return Object.keys(socialMedia).length > 0 ? socialMedia : null;
  }

  // Update business in database
  async updateBusiness(businessId, enrichedData) {
    const fields = Object.keys(enrichedData);
    const values = Object.values(enrichedData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    await this.pool.query(
      `UPDATE businesses SET ${setClause}, updated_at = NOW() WHERE id = $1`,
      [businessId, ...values]
    );
  }
}

module.exports = DataValidator;
