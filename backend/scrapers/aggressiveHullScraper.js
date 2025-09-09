const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
require('dotenv').config();

class AggressiveHullScraper {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.delay = 1000; // 1 second delay
  }

  async scrapeHullBusinesses() {
    console.log('🏢 Aggressive Hull Business Scraping');
    console.log('====================================\n');

    const businesses = [];
    const searchTerms = [
      'Hull business directory',
      'Hull companies',
      'Hull services',
      'Hull professional services',
      'Hull accounting',
      'Hull marketing',
      'Hull consulting',
      'Hull technology',
      'Hull automation',
      'Hull engineering',
      'Hull construction',
      'Hull retail',
      'Hull hospitality',
      'Hull healthcare',
      'Hull legal services',
      'Hull financial services',
      'Hull real estate',
      'Hull logistics',
      'Hull manufacturing',
      'Hull wholesale'
    ];

    for (const term of searchTerms) {
      try {
        console.log(`🔍 Searching: "${term}"`);
        await this.delayRequest();
        
        const url = `https://www.google.com/search?q=${encodeURIComponent(term)}&tbm=lcl`;
        
        const response = await axios.get(url, {
          headers: { 'User-Agent': this.userAgent },
          timeout: 15000
        });

        const $ = cheerio.load(response.data);
        
        // Multiple selectors to catch different Google result formats
        const selectors = [
          '.VkpGBb',
          '.rllt__details',
          '.dbg0pd',
          '.Nv2PK',
          '.THOPZb',
          '[data-value="Directions"]',
          '.fontHeadlineSmall',
          '.fontBodyMedium'
        ];

        let foundCount = 0;
        selectors.forEach(selector => {
          $(selector).each((index, element) => {
            const business = this.extractBusinessData($(element), term);
            if (business && this.isValidHullBusiness(business)) {
              businesses.push(business);
              foundCount++;
            }
          });
        });

        console.log(`   ✅ Found ${foundCount} businesses for "${term}"`);

      } catch (error) {
        console.log(`   ⚠️  Error searching "${term}": ${error.message}`);
      }
    }

    // Deduplicate
    const uniqueBusinesses = this.deduplicateBusinesses(businesses);
    
    console.log(`\n📊 Total businesses found: ${businesses.length}`);
    console.log(`📊 After deduplication: ${uniqueBusinesses.length}`);

    // Save to database
    const savedCount = await this.saveBusinesses(uniqueBusinesses);
    console.log(`💾 Saved to database: ${savedCount}`);

    return uniqueBusinesses;
  }

  extractBusinessData(element, searchTerm) {
    const name = this.extractName(element);
    const address = this.extractAddress(element);
    const phone = this.extractPhone(element);
    const website = this.extractWebsite(element);

    if (!name || name.length < 3) return null;

    return {
      name: name.trim(),
      location: 'Hull',
      address: address?.trim() || '',
      telephone: phone?.trim() || '',
      website: website?.trim() || '',
      source: 'google_aggressive',
      status: 'New'
    };
  }

  extractName(element) {
    const nameSelectors = [
      'h3',
      '.dbg0pd',
      '.fontHeadlineSmall',
      '.Nv2PK h3',
      '.THOPZb h3',
      '[data-value="Directions"] h3'
    ];

    for (const selector of nameSelectors) {
      const name = element.find(selector).text().trim();
      if (name && name.length > 2) return name;
    }

    // Fallback: get any text that looks like a business name
    const text = element.text().trim();
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.length > 3 && line.length < 100 && 
          !line.includes('Directions') && 
          !line.includes('Website') &&
          !line.includes('Phone') &&
          !line.includes('Address')) {
        return line;
      }
    }

    return null;
  }

  extractAddress(element) {
    const addressSelectors = [
      '.rllt__details',
      '.fontBodyMedium',
      '.W4Efsd',
      '[data-value="Address"]'
    ];

    for (const selector of addressSelectors) {
      const address = element.find(selector).text().trim();
      if (address && address.includes('Hull')) return address;
    }

    return '';
  }

  extractPhone(element) {
    const phoneRegex = /(\+44|0)[0-9\s\-\(\)]{10,}/g;
    const text = element.text();
    const phoneMatch = text.match(phoneRegex);
    return phoneMatch ? phoneMatch[0] : '';
  }

  extractWebsite(element) {
    const websiteLink = element.find('a[href*="http"]').attr('href');
    return websiteLink || '';
  }

  isValidHullBusiness(business) {
    const name = business.name.toLowerCase();
    const address = business.address.toLowerCase();
    
    // Must contain Hull or be in Hull area
    const isHull = name.includes('hull') || 
                   address.includes('hull') || 
                   address.includes('hu1') ||
                   address.includes('hu2') ||
                   address.includes('hu3') ||
                   address.includes('hu4') ||
                   address.includes('hu5') ||
                   address.includes('hu6') ||
                   address.includes('hu7') ||
                   address.includes('hu8') ||
                   address.includes('hu9');

    // Must not be a generic result
    const notGeneric = !name.includes('google') && 
                       !name.includes('search') && 
                       !name.includes('directions') &&
                       !name.includes('website') &&
                       !name.includes('phone') &&
                       name.length > 3;

    return isHull && notGeneric;
  }

  deduplicateBusinesses(businesses) {
    const seen = new Set();
    const unique = [];

    for (const business of businesses) {
      const key = business.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(business);
      }
    }

    return unique;
  }

  async saveBusinesses(businesses) {
    let savedCount = 0;

    for (const business of businesses) {
      try {
        const existing = await this.pool.query(
          'SELECT id FROM businesses WHERE name = $1 AND location = $2',
          [business.name, business.location]
        );

        if (existing.rows.length === 0) {
          await this.pool.query(
            `INSERT INTO businesses (name, location, address, telephone, email, website, source, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [business.name, business.location, business.address, business.telephone, 
             business.email, business.website, business.source, business.status]
          );
          savedCount++;
        }
      } catch (error) {
        console.log(`   ⚠️  Error saving "${business.name}": ${error.message}`);
      }
    }

    return savedCount;
  }

  delayRequest() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }
}

module.exports = AggressiveHullScraper;
