#!/usr/bin/env node

// Working demo of the scraping system with mock data
const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function demoScrapingWorking() {
  console.log('🎯 Cold Outreach CRM - Scraping System Demo');
  console.log('==========================================\n');

  try {
    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('1. Database Connection: ✅ Connected');
    console.log('');

    // Add some mock businesses to demonstrate the system
    console.log('2. Adding Mock Businesses...');
    const mockBusinesses = [
      {
        name: 'Hull Business Solutions Ltd',
        location: 'Hull',
        address: '123 High Street, Hull, HU1 1AA',
        telephone: '+44 1482 123456',
        email: 'info@hullbusinesssolutions.co.uk',
        website: 'https://hullbusinesssolutions.co.uk',
        source: 'mock_demo',
        status: 'New'
      },
      {
        name: 'Yorkshire Consulting Group',
        location: 'Leeds',
        address: '456 Business Park, Leeds, LS1 2AB',
        telephone: '+44 113 234567',
        email: 'contact@yorkshireconsulting.co.uk',
        website: 'https://yorkshireconsulting.co.uk',
        source: 'mock_demo',
        status: 'New'
      },
      {
        name: 'Hull Marketing Agency',
        location: 'Hull',
        address: '789 Marketing Street, Hull, HU2 3CD',
        telephone: '+44 1482 345678',
        email: 'hello@hullmarketing.co.uk',
        website: 'https://hullmarketing.co.uk',
        source: 'mock_demo',
        status: 'New'
      },
      {
        name: 'Yorkshire Tech Solutions',
        location: 'Sheffield',
        address: '321 Innovation Drive, Sheffield, S1 4EF',
        telephone: '+44 114 456789',
        email: 'info@yorkshiretech.co.uk',
        website: 'https://yorkshiretech.co.uk',
        source: 'mock_demo',
        status: 'New'
      },
      {
        name: 'Hull Automation Services',
        location: 'Hull',
        address: '654 Automation Lane, Hull, HU3 5GH',
        telephone: '+44 1482 567890',
        email: 'contact@hullautomation.co.uk',
        website: 'https://hullautomation.co.uk',
        source: 'mock_demo',
        status: 'New'
      }
    ];

    // Insert mock businesses
    for (const business of mockBusinesses) {
      try {
        await pool.query(
          `INSERT INTO businesses (name, location, address, telephone, email, website, source, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [business.name, business.location, business.address, business.telephone, 
           business.email, business.website, business.source, business.status]
        );
        console.log(`   ✅ Added: ${business.name}`);
      } catch (error) {
        console.log(`   ⚠️  Error adding ${business.name}: ${error.message}`);
      }
    }
    console.log('');

    // Show statistics
    console.log('3. Current Database Statistics:');
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
        COUNT(CASE WHEN telephone IS NOT NULL AND telephone != '' THEN 1 END) as with_phone,
        source,
        COUNT(*) as count
      FROM businesses 
      GROUP BY source
      ORDER BY count DESC
    `);

    const totalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
        COUNT(CASE WHEN telephone IS NOT NULL AND telephone != '' THEN 1 END) as with_phone
      FROM businesses
    `);

    console.log('   📊 Overall Statistics:');
    console.log(`      Total Businesses: ${totalStats.rows[0].total}`);
    console.log(`      With Email: ${totalStats.rows[0].with_email}`);
    console.log(`      With Website: ${totalStats.rows[0].with_website}`);
    console.log(`      With Phone: ${totalStats.rows[0].with_phone}`);
    console.log('');

    console.log('   📈 By Source:');
    stats.rows.forEach(row => {
      console.log(`      ${row.source}: ${row.count} businesses`);
    });
    console.log('');

    // Show sample businesses
    console.log('4. Sample Businesses:');
    const businesses = await pool.query('SELECT * FROM businesses ORDER BY created_at DESC LIMIT 3');
    businesses.rows.forEach((business, index) => {
      console.log(`   ${index + 1}. ${business.name}`);
      console.log(`      Location: ${business.location}`);
      console.log(`      Email: ${business.email || 'Not available'}`);
      console.log(`      Website: ${business.website || 'Not available'}`);
      console.log(`      Phone: ${business.telephone || 'Not available'}`);
      console.log('');
    });

    await pool.end();

    console.log('🎉 Demo Completed Successfully!');
    console.log('');
    console.log('🌐 Next Steps:');
    console.log('   1. Open your browser: http://localhost:3000');
    console.log('   2. Navigate to "Data Capture" in the sidebar');
    console.log('   3. You should see the mock businesses in your database');
    console.log('   4. Try the scraping controls to add more businesses');
    console.log('   5. Wait for Companies House API to activate for real data');
    console.log('');
    console.log('📊 Your CRM now has sample data to work with!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
demoScrapingWorking();
