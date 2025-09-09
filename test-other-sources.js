#!/usr/bin/env node

// Test other data sources while Companies House API activates
const axios = require('axios');

async function testOtherSources() {
  console.log('🧪 Testing Other Data Sources');
  console.log('=============================\n');

  // Test 1: Yell.com scraping
  console.log('1. Testing Yell.com scraping...');
  try {
    const response = await axios.get('https://www.yell.com/ucs/UcsSearchAction.do?keywords=business&location=Hull&scrambleSeed=123456789', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    if (response.data.includes('listing')) {
      console.log('   ✅ Yell.com is accessible and has business listings');
    } else {
      console.log('   ⚠️  Yell.com accessible but no listings found');
    }
  } catch (error) {
    console.log(`   ❌ Yell.com error: ${error.message}`);
  }
  console.log('');

  // Test 2: Yelp scraping
  console.log('2. Testing Yelp scraping...');
  try {
    const response = await axios.get('https://www.yelp.co.uk/search?find_desc=business&find_loc=Hull', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    if (response.data.includes('business')) {
      console.log('   ✅ Yelp is accessible and has business listings');
    } else {
      console.log('   ⚠️  Yelp accessible but no business listings found');
    }
  } catch (error) {
    console.log(`   ❌ Yelp error: ${error.message}`);
  }
  console.log('');

  // Test 3: Google search
  console.log('3. Testing Google search...');
  try {
    const response = await axios.get('https://www.google.com/search?q=business+Hull', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    if (response.data.includes('business')) {
      console.log('   ✅ Google search is accessible');
    } else {
      console.log('   ⚠️  Google search accessible but limited results');
    }
  } catch (error) {
    console.log(`   ❌ Google search error: ${error.message}`);
  }
  console.log('');

  // Test 4: Database connection
  console.log('4. Testing database connection...');
  try {
    const { Pool } = require('pg');
    require('dotenv').config({ path: './backend/.env' });
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const result = await pool.query('SELECT COUNT(*) as count FROM businesses');
    console.log(`   ✅ Database connected - ${result.rows[0].count} businesses in database`);
    
    await pool.end();
  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}`);
  }
  console.log('');

  console.log('🎉 Other sources test completed!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Wait 5-10 minutes for Companies House API to activate');
  console.log('   2. Test Companies House API again: node simple-scraping-test.js');
  console.log('   3. Start the full scraping system: cd frontend && npm start');
  console.log('   4. Navigate to "Data Capture" in the sidebar');
}

// Run the test
testOtherSources();
