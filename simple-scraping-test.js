#!/usr/bin/env node

// Simple test for the scraping system (without Puppeteer)
const WebScraper = require('./backend/scrapers/webScraper');

async function testSimpleScraping() {
  console.log('🧪 Testing Simple Business Data Scraping');
  console.log('=======================================\n');

  const scraper = new WebScraper();

  try {
    // Test Companies House API scraping
    console.log('📊 Testing Companies House API...');
    const companiesHouseData = await scraper.scrapeCompaniesHouse();
    console.log(`✅ Found ${companiesHouseData.length} companies from Companies House`);
    
    if (companiesHouseData.length > 0) {
      console.log('Sample company:', companiesHouseData[0]);
    }
    console.log('');

    // Test data validation
    console.log('🔍 Testing data validation...');
    const DataValidator = require('./backend/scrapers/dataValidator');
    const validator = new DataValidator();
    
    // Get a sample business to validate
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const businesses = await pool.query('SELECT * FROM businesses LIMIT 1');
    if (businesses.rows.length > 0) {
      const business = businesses.rows[0];
      console.log(`Validating business: ${business.name}`);
      
      const enrichedData = await validator.validateAndEnrichBusiness(business);
      if (enrichedData) {
        console.log('✅ Enriched data:', enrichedData);
      } else {
        console.log('⚠️  No additional data found');
      }
    } else {
      console.log('⚠️  No businesses found in database to validate');
    }

    await pool.end();
    console.log('');

    console.log('🎉 Simple scraping test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

// Run the test
testSimpleScraping();
