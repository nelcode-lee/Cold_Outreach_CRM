#!/usr/bin/env node

// Test script for the scraping system
const ScraperOrchestrator = require('./backend/scrapers/scraperOrchestrator');

async function testScraping() {
  console.log('🧪 Testing Business Data Scraping System');
  console.log('========================================\n');

  const scraper = new ScraperOrchestrator();

  try {
    // Test 1: Quick scraping
    console.log('⚡ Test 1: Quick Scraping');
    console.log('-------------------------');
    const quickResults = await scraper.runQuickScraping();
    console.log('Quick scraping results:', quickResults);
    console.log('');

    // Test 2: Get statistics
    console.log('📊 Test 2: Scraping Statistics');
    console.log('------------------------------');
    const stats = await scraper.getScrapingStats();
    console.log('Scraping statistics:', JSON.stringify(stats, null, 2));
    console.log('');

    // Test 3: Data validation
    console.log('🔍 Test 3: Data Validation');
    console.log('--------------------------');
    const validationResults = await scraper.runDataValidation();
    console.log('Validation results:', validationResults);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testScraping();
