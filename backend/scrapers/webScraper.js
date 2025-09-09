const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
require('dotenv').config();

class WebScraper {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.delay = 1000; // 1 second delay between requests
  }

  // Main scraping orchestrator
  async scrapeAllSources() {
    console.log('🌐 Starting comprehensive business data scraping...\n');
    
    const results = {
      companiesHouse: 0,
      yell: 0,
      yelp: 0,
      google: 0,
      total: 0,
      errors: []
    };

    try {
      // 1. Companies House API (most reliable)
      console.log('📊 Scraping Companies House...');
      const companiesHouseData = await this.scrapeCompaniesHouse();
      results.companiesHouse = companiesHouseData.length;
      console.log(`   ✅ Found ${companiesHouseData.length} companies\n`);

      // 2. Yell.com (UK business directory)
      console.log('📞 Scraping Yell.com...');
      const yellData = await this.scrapeYell();
      results.yell = yellData.length;
      console.log(`   ✅ Found ${yellData.length} businesses\n`);

      // 3. Yelp (business reviews)
      console.log('⭐ Scraping Yelp...');
      const yelpData = await this.scrapeYelp();
      results.yelp = yelpData.length;
      console.log(`   ✅ Found ${yelpData.length} businesses\n`);

      // 4. Google My Business (local businesses)
      console.log('🔍 Scraping Google My Business...');
      const googleData = await this.scrapeGoogleMyBusiness();
      results.google = googleData.length;
      console.log(`   ✅ Found ${googleData.length} businesses\n`);

      // Combine and deduplicate all data
      const allData = [...companiesHouseData, ...yellData, ...yelpData, ...googleData];
      const deduplicatedData = this.deduplicateBusinesses(allData);
      
      // Save to database
      const savedCount = await this.saveBusinesses(deduplicatedData);
      results.total = savedCount;

      console.log('🎉 Scraping completed!');
      console.log(`📊 Total businesses found: ${allData.length}`);
      console.log(`📊 After deduplication: ${deduplicatedData.length}`);
      console.log(`💾 Saved to database: ${savedCount}`);

      return results;

    } catch (error) {
      console.error('❌ Scraping failed:', error.message);
      results.errors.push(error.message);
      return results;
    }
  }

  // Companies House API scraper
  async scrapeCompaniesHouse() {
    const businesses = [];
    const searchTerms = [
      'Hull business',
      'Yorkshire business',
      'Hull company',
      'Yorkshire company',
      'Hull limited',
      'Yorkshire limited'
    ];

    for (const term of searchTerms) {
      try {
        await this.delayRequest();
        
        const response = await axios.get('https://api.company-information.service.gov.uk/search/companies', {
          params: {
            q: term,
            items_per_page: 100,
            start_index: 0
          },
          headers: {
            'Authorization': `Basic ${Buffer.from(process.env.COMPANIES_HOUSE_API_KEY + ':').toString('base64')}`
          }
        });

        const companies = response.data.items || [];
        
        for (const company of companies) {
          const business = this.transformCompaniesHouseData(company);
          if (this.isHullOrYorkshire(business)) {
            businesses.push(business);
          }
        }

        console.log(`   📊 Found ${companies.length} companies for "${term}"`);

      } catch (error) {
        console.log(`   ⚠️  Error scraping "${term}": ${error.message}`);
      }
    }

    return businesses;
  }

  // Yell.com scraper
  async scrapeYell() {
    const businesses = [];
    const locations = ['Hull', 'Leeds', 'Sheffield', 'Bradford', 'York'];
    const categories = ['business-services', 'consultants', 'marketing', 'technology', 'automation'];

    for (const location of locations) {
      for (const category of categories) {
        try {
          await this.delayRequest();
          
          const url = `https://www.yell.com/ucs/UcsSearchAction.do?keywords=${category}&location=${location}&scrambleSeed=123456789`;
          
          const response = await axios.get(url, {
            headers: { 'User-Agent': this.userAgent }
          });

          const $ = cheerio.load(response.data);
          const listings = $('.listing');

          listings.each((index, element) => {
            const business = this.extractYellBusiness($(element), location);
            if (business) {
              businesses.push(business);
            }
          });

          console.log(`   📊 Found ${listings.length} businesses in ${location} for ${category}`);

        } catch (error) {
          console.log(`   ⚠️  Error scraping Yell ${location}/${category}: ${error.message}`);
        }
      }
    }

    return businesses;
  }

  // Yelp scraper
  async scrapeYelp() {
    const businesses = [];
    const locations = ['Hull', 'Leeds', 'Sheffield', 'Bradford', 'York'];
    const categories = ['business-services', 'consulting', 'marketing', 'technology'];

    for (const location of locations) {
      for (const category of categories) {
        try {
          await this.delayRequest();
          
          const url = `https://www.yelp.co.uk/search?find_desc=${category}&find_loc=${location}`;
          
          const response = await axios.get(url, {
            headers: { 'User-Agent': this.userAgent }
          });

          const $ = cheerio.load(response.data);
          const listings = $('[data-testid="serp-ia-card"]');

          listings.each((index, element) => {
            const business = this.extractYelpBusiness($(element), location);
            if (business) {
              businesses.push(business);
            }
          });

          console.log(`   📊 Found ${listings.length} businesses in ${location} for ${category}`);

        } catch (error) {
          console.log(`   ⚠️  Error scraping Yelp ${location}/${category}: ${error.message}`);
        }
      }
    }

    return businesses;
  }

  // Google My Business scraper (simplified)
  async scrapeGoogleMyBusiness() {
    const businesses = [];
    const searchTerms = [
      'business services Hull',
      'consulting Hull',
      'marketing Hull',
      'technology Hull',
      'business services Yorkshire',
      'consulting Yorkshire'
    ];

    for (const term of searchTerms) {
      try {
        await this.delayRequest();
        
        // Note: This is a simplified version. In production, you'd use Google My Business API
        const url = `https://www.google.com/search?q=${encodeURIComponent(term)}&tbm=lcl`;
        
        const response = await axios.get(url, {
          headers: { 'User-Agent': this.userAgent }
        });

        const $ = cheerio.load(response.data);
        const listings = $('.VkpGBb');

        listings.each((index, element) => {
          const business = this.extractGoogleBusiness($(element));
          if (business) {
            businesses.push(business);
          }
        });

        console.log(`   📊 Found ${listings.length} businesses for "${term}"`);

      } catch (error) {
        console.log(`   ⚠️  Error scraping Google "${term}": ${error.message}`);
      }
    }

    return businesses;
  }

  // Data transformation methods
  transformCompaniesHouseData(company) {
    return {
      name: company.title,
      location: this.extractLocation(company.address_snippet),
      address: company.address_snippet,
      website: company.links?.self ? `https://find-and-update.company-information.service.gov.uk${company.links.self}` : null,
      source: 'companies_house',
      status: 'New',
      company_number: company.company_number,
      company_status: company.company_status,
      company_type: company.company_type,
      date_of_creation: company.date_of_creation
    };
  }

  extractYellBusiness(element, location) {
    const name = element.find('.listing-name').text().trim();
    const address = element.find('.listing-address').text().trim();
    const phone = element.find('.listing-phone').text().trim();
    const website = element.find('.listing-website a').attr('href');

    if (!name) return null;

    return {
      name,
      location,
      address,
      telephone: phone,
      website,
      source: 'yell',
      status: 'New'
    };
  }

  extractYelpBusiness(element, location) {
    const name = element.find('h3').text().trim();
    const address = element.find('[data-testid="address"]').text().trim();
    const phone = element.find('[data-testid="phone"]').text().trim();
    const website = element.find('a[href*="biz"]').attr('href');

    if (!name) return null;

    return {
      name,
      location,
      address,
      telephone: phone,
      website,
      source: 'yelp',
      status: 'New'
    };
  }

  extractGoogleBusiness(element) {
    const name = element.find('.dbg0pd').text().trim();
    const address = element.find('.rllt__details').text().trim();
    const phone = element.find('.rllt__details span').text().trim();

    if (!name) return null;

    return {
      name,
      location: 'Hull', // Default to Hull for Google results
      address,
      telephone: phone,
      source: 'google',
      status: 'New'
    };
  }

  // Utility methods
  extractLocation(addressSnippet) {
    if (!addressSnippet) return 'Hull';
    
    const addressParts = addressSnippet.split(',');
    for (const part of addressParts) {
      const trimmed = part.trim().toLowerCase();
      if (trimmed.includes('hull')) return 'Hull';
      if (trimmed.includes('yorkshire')) return 'Yorkshire';
    }
    
    return addressParts[addressParts.length - 1]?.trim() || 'Hull';
  }

  isHullOrYorkshire(business) {
    const location = business.location?.toLowerCase() || '';
    const address = business.address?.toLowerCase() || '';
    
    return location.includes('hull') || 
           location.includes('yorkshire') ||
           address.includes('hull') || 
           address.includes('yorkshire');
  }

  deduplicateBusinesses(businesses) {
    const seen = new Set();
    const deduplicated = [];

    for (const business of businesses) {
      const key = `${business.name.toLowerCase()}-${business.location?.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(business);
      }
    }

    return deduplicated;
  }

  async saveBusinesses(businesses) {
    let savedCount = 0;

    for (const business of businesses) {
      try {
        // Check if business already exists
        const existing = await this.pool.query(
          'SELECT id FROM businesses WHERE name = $1 AND location = $2',
          [business.name, business.location]
        );

        if (existing.rows.length === 0) {
          await this.pool.query(
            `INSERT INTO businesses (name, location, address, telephone, email, website, source, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              business.name,
              business.location,
              business.address,
              business.telephone,
              business.email,
              business.website,
              business.source,
              business.status
            ]
          );
          savedCount++;
        }
      } catch (error) {
        console.log(`   ⚠️  Error saving business "${business.name}": ${error.message}`);
      }
    }

    return savedCount;
  }

  delayRequest() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }
}

module.exports = WebScraper;
