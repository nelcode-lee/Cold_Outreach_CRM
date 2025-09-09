const puppeteer = require('puppeteer');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

class AdvancedScraper {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🚀 Initializing advanced scraper...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // LinkedIn company scraper
  async scrapeLinkedIn() {
    console.log('💼 Scraping LinkedIn for Hull & Yorkshire businesses...');
    const businesses = [];

    try {
      const searchTerms = [
        'Hull business',
        'Yorkshire business',
        'Hull company',
        'Yorkshire company',
        'Hull limited',
        'Yorkshire limited'
      ];

      for (const term of searchTerms) {
        await this.page.goto(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(term)}`, {
          waitUntil: 'networkidle2'
        });

        // Wait for results to load
        await this.page.waitForSelector('.search-results-container', { timeout: 10000 });

        const companies = await this.page.evaluate(() => {
          const results = [];
          const companyElements = document.querySelectorAll('.search-results-container .entity-result');
          
          companyElements.forEach(element => {
            const name = element.querySelector('.entity-result__title-text a')?.textContent?.trim();
            const location = element.querySelector('.entity-result__secondary-subtitle')?.textContent?.trim();
            const description = element.querySelector('.entity-result__summary')?.textContent?.trim();
            const link = element.querySelector('.entity-result__title-text a')?.href;
            
            if (name) {
              results.push({
                name,
                location,
                description,
                website: link,
                source: 'linkedin'
              });
            }
          });
          
          return results;
        });

        businesses.push(...companies);
        console.log(`   📊 Found ${companies.length} companies for "${term}"`);
        
        // Delay between requests
        await this.delay(2000);
      }

    } catch (error) {
      console.log(`   ⚠️  Error scraping LinkedIn: ${error.message}`);
    }

    return businesses;
  }

  // Facebook business scraper
  async scrapeFacebook() {
    console.log('📘 Scraping Facebook for Hull & Yorkshire businesses...');
    const businesses = [];

    try {
      const searchTerms = [
        'Hull business',
        'Yorkshire business',
        'Hull company',
        'Yorkshire company'
      ];

      for (const term of searchTerms) {
        await this.page.goto(`https://www.facebook.com/search/pages/?q=${encodeURIComponent(term)}`, {
          waitUntil: 'networkidle2'
        });

        // Wait for results to load
        await this.page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });

        const companies = await this.page.evaluate(() => {
          const results = [];
          const companyElements = document.querySelectorAll('[data-testid="search-results"] .x1i10hfl');
          
          companyElements.forEach(element => {
            const name = element.querySelector('span[dir="auto"]')?.textContent?.trim();
            const location = element.querySelector('.x1lliihq')?.textContent?.trim();
            const link = element.querySelector('a')?.href;
            
            if (name && name.length > 3) {
              results.push({
                name,
                location,
                website: link,
                source: 'facebook'
              });
            }
          });
          
          return results;
        });

        businesses.push(...companies);
        console.log(`   📊 Found ${companies.length} businesses for "${term}"`);
        
        await this.delay(2000);
      }

    } catch (error) {
      console.log(`   ⚠️  Error scraping Facebook: ${error.message}`);
    }

    return businesses;
  }

  // Google Maps scraper
  async scrapeGoogleMaps() {
    console.log('🗺️  Scraping Google Maps for Hull & Yorkshire businesses...');
    const businesses = [];

    try {
      const searchTerms = [
        'business services Hull',
        'consulting Hull',
        'marketing Hull',
        'technology Hull',
        'business services Yorkshire',
        'consulting Yorkshire'
      ];

      for (const term of searchTerms) {
        await this.page.goto(`https://www.google.com/maps/search/${encodeURIComponent(term)}`, {
          waitUntil: 'networkidle2'
        });

        // Wait for results to load
        await this.page.waitForSelector('[data-value="Directions"]', { timeout: 10000 });

        const companies = await this.page.evaluate(() => {
          const results = [];
          const companyElements = document.querySelectorAll('[data-value="Directions"]');
          
          companyElements.forEach(element => {
            const name = element.querySelector('h3')?.textContent?.trim();
            const address = element.querySelector('.fontBodyMedium')?.textContent?.trim();
            const phone = element.querySelector('[data-value="Phone"]')?.textContent?.trim();
            const website = element.querySelector('[data-value="Website"]')?.href;
            
            if (name) {
              results.push({
                name,
                address,
                telephone: phone,
                website,
                source: 'google_maps'
              });
            }
          });
          
          return results;
        });

        businesses.push(...companies);
        console.log(`   📊 Found ${companies.length} businesses for "${term}"`);
        
        await this.delay(2000);
      }

    } catch (error) {
      console.log(`   ⚠️  Error scraping Google Maps: ${error.message}`);
    }

    return businesses;
  }

  // Companies House API scraper (enhanced)
  async scrapeCompaniesHouseAdvanced() {
    console.log('📊 Scraping Companies House API (Advanced)...');
    const businesses = [];

    try {
      const searchTerms = [
        'Hull business',
        'Yorkshire business',
        'Hull company',
        'Yorkshire company',
        'Hull limited',
        'Yorkshire limited',
        'Hull ltd',
        'Yorkshire ltd'
      ];

      for (const term of searchTerms) {
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
        await this.delay(1000);
      }

    } catch (error) {
      console.log(`   ⚠️  Error scraping Companies House: ${error.message}`);
    }

    return businesses;
  }

  // Main scraping orchestrator
  async scrapeAllSources() {
    console.log('🌐 Starting advanced business data scraping...\n');
    
    const results = {
      companiesHouse: 0,
      linkedin: 0,
      facebook: 0,
      googleMaps: 0,
      total: 0,
      errors: []
    };

    try {
      await this.initialize();

      // 1. Companies House API (most reliable)
      const companiesHouseData = await this.scrapeCompaniesHouseAdvanced();
      results.companiesHouse = companiesHouseData.length;
      console.log(`   ✅ Found ${companiesHouseData.length} companies\n`);

      // 2. LinkedIn
      const linkedinData = await this.scrapeLinkedIn();
      results.linkedin = linkedinData.length;
      console.log(`   ✅ Found ${linkedinData.length} businesses\n`);

      // 3. Facebook
      const facebookData = await this.scrapeFacebook();
      results.facebook = facebookData.length;
      console.log(`   ✅ Found ${facebookData.length} businesses\n`);

      // 4. Google Maps
      const googleMapsData = await this.scrapeGoogleMaps();
      results.googleMaps = googleMapsData.length;
      console.log(`   ✅ Found ${googleMapsData.length} businesses\n`);

      // Combine and deduplicate all data
      const allData = [...companiesHouseData, ...linkedinData, ...facebookData, ...googleMapsData];
      const deduplicatedData = this.deduplicateBusinesses(allData);
      
      // Save to database
      const savedCount = await this.saveBusinesses(deduplicatedData);
      results.total = savedCount;

      console.log('🎉 Advanced scraping completed!');
      console.log(`📊 Total businesses found: ${allData.length}`);
      console.log(`📊 After deduplication: ${deduplicatedData.length}`);
      console.log(`💾 Saved to database: ${savedCount}`);

      return results;

    } catch (error) {
      console.error('❌ Advanced scraping failed:', error.message);
      results.errors.push(error.message);
      return results;
    } finally {
      await this.close();
    }
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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AdvancedScraper;
