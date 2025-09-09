#!/usr/bin/env node

// Test aggressive Hull business scraping
const AggressiveHullScraper = require('./backend/scrapers/aggressiveHullScraper');

async function testAggressiveScraping() {
  console.log('🚀 Testing Aggressive Hull Business Scraping');
  console.log('============================================\n');

  const scraper = new AggressiveHullScraper();

  try {
    console.log('This will search for Hull businesses using 20 different search terms...');
    console.log('Expected result: 100+ businesses found\n');

    const businesses = await scraper.scrapeHullBusinesses();

    console.log('\n🎉 Aggressive Scraping Completed!');
    console.log(`📊 Total businesses found: ${businesses.length}`);
    
    if (businesses.length > 0) {
      console.log('\n📋 Sample businesses found:');
      businesses.slice(0, 10).forEach((business, index) => {
        console.log(`   ${index + 1}. ${business.name}`);
        console.log(`      Address: ${business.address || 'Not available'}`);
        console.log(`      Phone: ${business.telephone || 'Not available'}`);
        console.log(`      Website: ${business.website || 'Not available'}`);
        console.log('');
      });
    }

    console.log('🌐 Next Steps:');
    console.log('   1. Check your database for the new businesses');
    console.log('   2. Refresh your frontend to see the data');
    console.log('   3. Start your cold outreach campaigns!');

  } catch (error) {
    console.error('❌ Aggressive scraping failed:', error.message);
  }
}

// Run the test
testAggressiveScraping();
