const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
require('dotenv').config();

class GoogleScraper {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.delay = 2000; // 2 second delay between requests
  }

  // Main Google scraping orchestrator
  async scrapeAllGoogleSources() {
    console.log('🔍 Starting Google Business Data Scraping');
    console.log('========================================\n');

    const results = {
      googleSearch: 0,
      googleMaps: 0,
      googleMyBusiness: 0,
      total: 0,
      errors: []
    };

    try {
      // 1. Google Search Results
      console.log('📊 Scraping Google Search Results...');
      const searchResults = await this.scrapeGoogleSearch();
      results.googleSearch = searchResults.length;
      console.log(`   ✅ Found ${searchResults.length} businesses from Google Search\n`);

      // 2. Google Maps
      console.log('🗺️  Scraping Google Maps...');
      const mapsResults = await this.scrapeGoogleMaps();
      results.googleMaps = mapsResults.length;
      console.log(`   ✅ Found ${mapsResults.length} businesses from Google Maps\n`);

      // 3. Google My Business
      console.log('🏢 Scraping Google My Business...');
      const myBusinessResults = await this.scrapeGoogleMyBusiness();
      results.googleMyBusiness = myBusinessResults.length;
      console.log(`   ✅ Found ${myBusinessResults.length} businesses from Google My Business\n`);

      // Combine and deduplicate all data
      const allData = [...searchResults, ...mapsResults, ...myBusinessResults];
      const deduplicatedData = this.deduplicateBusinesses(allData);
      
      // Save to database
      const savedCount = await this.saveBusinesses(deduplicatedData);
      results.total = savedCount;

      console.log('🎉 Google Scraping Completed!');
      console.log(`📊 Total businesses found: ${allData.length}`);
      console.log(`📊 After deduplication: ${deduplicatedData.length}`);
      console.log(`💾 Saved to database: ${savedCount}`);

      return results;

    } catch (error) {
      console.error('❌ Google scraping failed:', error.message);
      results.errors.push(error.message);
      return results;
    }
  }

  // Scrape Google Search Results
  async scrapeGoogleSearch() {
    const businesses = [];
    const searchTerms = [
      'business services Hull',
      'consulting Hull',
      'marketing Hull',
      'technology Hull',
      'automation Hull',
      'business services Yorkshire',
      'consulting Yorkshire',
      'marketing Yorkshire',
      'technology Yorkshire',
      'automation Yorkshire'
    ];

    for (const term of searchTerms) {
      try {
        await this.delayRequest();
        
        const url = `https://www.google.com/search?q=${encodeURIComponent(term)}&tbm=lcl`;
        
        const response = await axios.get(url, {
          headers: { 'User-Agent': this.userAgent },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const listings = $('.VkpGBb, .rllt__details, .dbg0pd');

        listings.each((index, element) => {
          const business = this.extractGoogleSearchBusiness($(element), term);
          if (business) {
            businesses.push(business);
          }
        });

        console.log(`   📊 Found ${listings.length} results for "${term}"`);

      } catch (error) {
        console.log(`   ⚠️  Error scraping Google Search "${term}": ${error.message}`);
      }
    }

    return businesses;
  }

  // Scrape Google Maps
  async scrapeGoogleMaps() {
    const businesses = [];
    const searchTerms = [
      'business services near Hull',
      'consulting near Hull',
      'marketing near Hull',
      'technology near Hull',
      'business services near Yorkshire',
      'consulting near Yorkshire'
    ];

    for (const term of searchTerms) {
      try {
        await this.delayRequest();
        
        const url = `https://www.google.com/maps/search/${encodeURIComponent(term)}`;
        
        const response = await axios.get(url, {
          headers: { 'User-Agent': this.userAgent },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const listings = $('[data-value="Directions"], .Nv2PK, .THOPZb');

        listings.each((index, element) => {
          const business = this.extractGoogleMapsBusiness($(element), term);
          if (business) {
            businesses.push(business);
          }
        });

        console.log(`   📊 Found ${listings.length} results for "${term}"`);

      } catch (error) {
        console.log(`   ⚠️  Error scraping Google Maps "${term}": ${error.message}`);
      }
    }

    return businesses;
  }

  // Scrape Google My Business
  async scrapeGoogleMyBusiness() {
    const businesses = [];
    const searchTerms = [
      'business services Hull UK',
      'consulting Hull UK',
      'marketing Hull UK',
      'technology Hull UK',
      'business services Yorkshire UK',
      'consulting Yorkshire UK'
    ];

    for (const term of searchTerms) {
      try {
        await this.delayRequest();
        
        const url = `https://www.google.com/search?q=${encodeURIComponent(term)}&tbm=lcl`;
        
        const response = await axios.get(url, {
          headers: { 'User-Agent': this.userAgent },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const listings = $('.VkpGBb, .rllt__details');

        listings.each((index, element) => {
          const business = this.extractGoogleMyBusinessData($(element), term);
          if (business) {
            businesses.push(business);
          }
        });

        console.log(`   📊 Found ${listings.length} results for "${term}"`);

      } catch (error) {
        console.log(`   ⚠️  Error scraping Google My Business "${term}": ${error.message}`);
      }
    }

    return businesses;
  }

  // Extract business data from Google Search results
  extractGoogleSearchBusiness(element, searchTerm) {
    const name = element.find('h3, .dbg0pd').text().trim();
    const address = element.find('.rllt__details, .VkpGBb').text().trim();
    const phone = element.find('[data-value="Phone"]').text().trim();
    const website = element.find('a[href*="http"]').attr('href');

    if (!name || name.length < 3) return null;

    return {
      name,
      location: this.extractLocationFromSearchTerm(searchTerm),
      address,
      telephone: phone,
      website,
      source: 'google_search',
      status: 'New'
    };
  }

  // Extract business data from Google Maps
  extractGoogleMapsBusiness(element, searchTerm) {
    const name = element.find('h3, .fontHeadlineSmall').text().trim();
    const address = element.find('.fontBodyMedium, .W4Efsd').text().trim();
    const phone = element.find('[data-value="Phone"]').text().trim();
    const website = element.find('a[href*="http"]').attr('href');

    if (!name || name.length < 3) return null;

    return {
      name,
      location: this.extractLocationFromSearchTerm(searchTerm),
      address,
      telephone: phone,
      website,
      source: 'google_maps',
      status: 'New'
    };
  }

  // Extract business data from Google My Business
  extractGoogleMyBusinessData(element, searchTerm) {
    const name = element.find('h3, .dbg0pd').text().trim();
    const address = element.find('.rllt__details').text().trim();
    const phone = element.find('[data-value="Phone"]').text().trim();
    const website = element.find('a[href*="http"]').attr('href');

    if (!name || name.length < 3) return null;

    return {
      name,
      location: this.extractLocationFromSearchTerm(searchTerm),
      address,
      telephone: phone,
      website,
      source: 'google_my_business',
      status: 'New'
    };
  }

  // Extract location from search term
  extractLocationFromSearchTerm(searchTerm) {
    if (searchTerm.toLowerCase().includes('hull')) return 'Hull';
    if (searchTerm.toLowerCase().includes('yorkshire')) return 'Yorkshire';
    return 'Hull'; // Default
  }

  // Deduplicate businesses
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

  // Save businesses to database
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

module.exports = GoogleScraper;
