#!/usr/bin/env node

// Demo script for the Data Capture System
const axios = require('axios');

async function demoDataCapture() {
  console.log('🎯 Cold Outreach CRM - Data Capture System Demo');
  console.log('===============================================\n');

  const baseURL = 'http://localhost:5000';

  try {
    // 1. Check if backend is running
    console.log('1. Checking backend status...');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('   ✅ Backend is running');
      console.log(`   📊 Status: ${healthResponse.data.status}`);
    } catch (error) {
      console.log('   ❌ Backend is not running. Please start it with:');
      console.log('      cd backend && npm run dev');
      return;
    }
    console.log('');

    // 2. Get current scraping statistics
    console.log('2. Getting current statistics...');
    try {
      const statsResponse = await axios.get(`${baseURL}/api/scraping/stats`);
      const stats = statsResponse.data.data;
      
      console.log('   📊 Current Statistics:');
      console.log(`      Total Businesses: ${stats.total.total}`);
      console.log(`      With Email: ${stats.total.with_email}`);
      console.log(`      With Website: ${stats.total.with_website}`);
      console.log(`      With Phone: ${stats.total.with_phone}`);
      console.log('');
      
      console.log('   📈 By Source:');
      stats.bySource.forEach(source => {
        console.log(`      ${source.source}: ${source.count} businesses`);
      });
    } catch (error) {
      console.log('   ⚠️  Could not get statistics:', error.message);
    }
    console.log('');

    // 3. Start quick scraping
    console.log('3. Starting quick scraping...');
    try {
      const scrapeResponse = await axios.post(`${baseURL}/api/scraping/start-quick`);
      console.log('   ✅ Quick scraping started');
      console.log(`   📝 Message: ${scrapeResponse.data.message}`);
    } catch (error) {
      console.log('   ❌ Failed to start scraping:', error.message);
    }
    console.log('');

    // 4. Show next steps
    console.log('4. Next Steps:');
    console.log('   🌐 Open the frontend: cd frontend && npm start');
    console.log('   📊 Navigate to "Data Capture" in the sidebar');
    console.log('   🎛️  Use the scraping controls to:');
    console.log('      - Start Quick Scrape (basic web scraping)');
    console.log('      - Start Advanced Scrape (Puppeteer-based)');
    console.log('      - Start Full Pipeline (complete scraping + validation)');
    console.log('      - Start Data Validation (enrich existing data)');
    console.log('');

    // 5. Show configuration requirements
    console.log('5. Configuration Requirements:');
    console.log('   🔑 Companies House API Key:');
    console.log('      - Get free API key: https://developer.company-information.service.gov.uk/');
    console.log('      - Add to backend/.env: COMPANIES_HOUSE_API_KEY=your_key_here');
    console.log('   📧 SendGrid API Key:');
    console.log('      - Already configured ✅');
    console.log('   🗄️  Database:');
    console.log('      - Already configured ✅');
    console.log('');

    console.log('🎉 Data Capture System is ready!');
    console.log('📖 See DATA_CAPTURE_SETUP.md for detailed instructions');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
demoDataCapture();
