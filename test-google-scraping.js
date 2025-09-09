#!/usr/bin/env node

// Test Google scraping functionality
const GoogleScraper = require('./backend/scrapers/googleScraper');

async function testGoogleScraping() {
  console.log('🔍 Testing Google Business Scraping');
  console.log('==================================\n');

  const scraper = new GoogleScraper();

  try {
    // Test Google Search scraping
    console.log('1. Testing Google Search Scraping...');
    const searchResults = await scraper.scrapeGoogleSearch();
    console.log(`   ✅ Found ${searchResults.length} businesses from Google Search`);
    
    if (searchResults.length > 0) {
      console.log('   Sample results:');
      searchResults.slice(0, 3).forEach((business, index) => {
        console.log(`      ${index + 1}. ${business.name} (${business.location})`);
        console.log(`         Source: ${business.source}`);
        console.log(`         Website: ${business.website || 'Not available'}`);
      });
    }
    console.log('');

    // Test Google Maps scraping
    console.log('2. Testing Google Maps Scraping...');
    const mapsResults = await scraper.scrapeGoogleMaps();
    console.log(`   ✅ Found ${mapsResults.length} businesses from Google Maps`);
    
    if (mapsResults.length > 0) {
      console.log('   Sample results:');
      mapsResults.slice(0, 3).forEach((business, index) => {
        console.log(`      ${index + 1}. ${business.name} (${business.location})`);
        console.log(`         Source: ${business.source}`);
        console.log(`         Address: ${business.address || 'Not available'}`);
      });
    }
    console.log('');

    // Test full Google scraping
    console.log('3. Testing Full Google Scraping...');
    const fullResults = await scraper.scrapeAllGoogleSources();
    console.log(`   ✅ Full scraping completed:`);
    console.log(`      Google Search: ${fullResults.googleSearch} businesses`);
    console.log(`      Google Maps: ${fullResults.googleMaps} businesses`);
    console.log(`      Google My Business: ${fullResults.googleMyBusiness} businesses`);
    console.log(`      Total saved: ${fullResults.total} businesses`);
    console.log('');

    console.log('🎉 Google Scraping Test Completed!');
    console.log('');
    console.log('📊 What Google Scraping Can Find:');
    console.log('   • Local business listings');
    console.log('   • Contact information (phone, address)');
    console.log('   • Business websites');
    console.log('   • Business descriptions');
    console.log('   • Reviews and ratings');
    console.log('   • Opening hours');
    console.log('   • Social media links');
    console.log('');
    console.log('🌐 Google is one of the most powerful sources for business data!');

  } catch (error) {
    console.error('❌ Google scraping test failed:', error.message);
  }
}

// Run the test
testGoogleScraping();
