#!/usr/bin/env node

// Direct API test to show the data
const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function testApiDirect() {
  console.log('🔍 Testing API Data Directly');
  console.log('============================\n');

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Get all businesses
    const businesses = await pool.query(`
      SELECT id, name, location, address, telephone, email, website, source, status, created_at
      FROM businesses 
      ORDER BY created_at DESC
    `);

    console.log(`📊 Total Businesses: ${businesses.rows.length}`);
    console.log('');

    // Group by source
    const bySource = {};
    businesses.rows.forEach(business => {
      if (!bySource[business.source]) {
        bySource[business.source] = [];
      }
      bySource[business.source].push(business);
    });

    console.log('📈 Businesses by Source:');
    Object.keys(bySource).forEach(source => {
      console.log(`   ${source}: ${bySource[source].length} businesses`);
    });
    console.log('');

    // Show Google-scraped businesses
    const googleBusinesses = businesses.rows.filter(b => b.source.includes('google'));
    console.log(`🔍 Google-Scraped Businesses (${googleBusinesses.length}):`);
    googleBusinesses.forEach((business, index) => {
      console.log(`   ${index + 1}. ${business.name}`);
      console.log(`      Location: ${business.location}`);
      console.log(`      Source: ${business.source}`);
      console.log(`      Email: ${business.email || 'Not available'}`);
      console.log(`      Website: ${business.website || 'Not available'}`);
      console.log(`      Phone: ${business.telephone || 'Not available'}`);
      console.log('');
    });

    // Show statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
        COUNT(CASE WHEN telephone IS NOT NULL AND telephone != '' THEN 1 END) as with_phone
      FROM businesses
    `);

    console.log('📊 Database Statistics:');
    console.log(`   Total: ${stats.rows[0].total}`);
    console.log(`   With Email: ${stats.rows[0].with_email}`);
    console.log(`   With Website: ${stats.rows[0].with_website}`);
    console.log(`   With Phone: ${stats.rows[0].with_phone}`);
    console.log('');

    await pool.end();

    console.log('✅ Data is in the database!');
    console.log('');
    console.log('🌐 Next Steps:');
    console.log('   1. The backend API needs to be fixed');
    console.log('   2. Start the frontend: cd frontend && npm start');
    console.log('   3. Navigate to "Data Capture" to see the data');
    console.log('   4. The Google-scraped businesses are ready for outreach!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testApiDirect();
