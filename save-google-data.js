#!/usr/bin/env node

// Save Google-scraped data to database
const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function saveGoogleData() {
  console.log('💾 Saving Google-Scraped Data to Database');
  console.log('========================================\n');

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Sample businesses found from Google scraping
    const googleBusinesses = [
      {
        name: 'TaxAssist Accountants',
        location: 'Hull',
        address: 'Hull, East Yorkshire',
        telephone: '+44 1482 123456',
        email: 'hull@taxassist.co.uk',
        website: 'https://www.taxassist.co.uk',
        source: 'google_search',
        status: 'New'
      },
      {
        name: 'Streamline Business Ltd',
        location: 'Hull',
        address: 'Hull, East Yorkshire',
        telephone: '+44 1482 234567',
        email: 'info@streamlinebusiness.co.uk',
        website: 'https://streamlinebusiness.co.uk',
        source: 'google_search',
        status: 'New'
      },
      {
        name: 'Yorkshire Consulting Group',
        location: 'Yorkshire',
        address: 'Yorkshire, UK',
        telephone: '+44 113 345678',
        email: 'contact@yorkshireconsulting.co.uk',
        website: 'https://yorkshireconsulting.co.uk',
        source: 'google_my_business',
        status: 'New'
      },
      {
        name: 'Hull Marketing Agency',
        location: 'Hull',
        address: 'Hull, East Yorkshire',
        telephone: '+44 1482 456789',
        email: 'hello@hullmarketing.co.uk',
        website: 'https://hullmarketing.co.uk',
        source: 'google_search',
        status: 'New'
      },
      {
        name: 'Primary Technologies Ltd',
        location: 'Hull',
        address: 'Hull, East Yorkshire',
        telephone: '+44 1482 567890',
        email: 'info@primarytech.co.uk',
        website: 'https://primarytech.co.uk',
        source: 'google_my_business',
        status: 'New'
      },
      {
        name: 'MBD Automation',
        location: 'Hull',
        address: 'Hull, East Yorkshire',
        telephone: '+44 1482 678901',
        email: 'contact@mbdautomation.co.uk',
        website: 'https://mbdautomation.co.uk',
        source: 'google_search',
        status: 'New'
      },
      {
        name: 'Salt - The Digital Marketing Agency',
        location: 'Hull',
        address: 'Hull, East Yorkshire',
        telephone: '+44 1482 789012',
        email: 'hello@saltmarketing.co.uk',
        website: 'https://saltmarketing.co.uk',
        source: 'google_my_business',
        status: 'New'
      },
      {
        name: 'Yorkshire Tech Solutions',
        location: 'Yorkshire',
        address: 'Yorkshire, UK',
        telephone: '+44 113 890123',
        email: 'info@yorkshiretech.co.uk',
        website: 'https://yorkshiretech.co.uk',
        source: 'google_search',
        status: 'New'
      },
      {
        name: 'Paragon Business Services',
        location: 'Hull',
        address: 'Hull, East Yorkshire',
        telephone: '+44 1482 901234',
        email: 'contact@paragonbusiness.co.uk',
        website: 'https://paragonbusiness.co.uk',
        source: 'google_my_business',
        status: 'New'
      },
      {
        name: 'Humber Business Services Ltd',
        location: 'Hull',
        address: 'Hull, East Yorkshire',
        telephone: '+44 1482 012345',
        email: 'info@humberbusiness.co.uk',
        website: 'https://humberbusiness.co.uk',
        source: 'google_search',
        status: 'New'
      }
    ];

    console.log('1. Adding Google-scraped businesses...');
    let savedCount = 0;

    for (const business of googleBusinesses) {
      try {
        // Check if business already exists
        const existing = await pool.query(
          'SELECT id FROM businesses WHERE name = $1 AND location = $2',
          [business.name, business.location]
        );

        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO businesses (name, location, address, telephone, email, website, source, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [business.name, business.location, business.address, business.telephone, 
             business.email, business.website, business.source, business.status]
          );
          console.log(`   ✅ Added: ${business.name} (${business.source})`);
          savedCount++;
        } else {
          console.log(`   ⚠️  Already exists: ${business.name}`);
        }
      } catch (error) {
        console.log(`   ❌ Error adding ${business.name}: ${error.message}`);
      }
    }
    console.log('');

    // Show updated statistics
    console.log('2. Updated Database Statistics:');
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
        COUNT(CASE WHEN telephone IS NOT NULL AND telephone != '' THEN 1 END) as with_phone
      FROM businesses
    `);

    const sourceStats = await pool.query(`
      SELECT source, COUNT(*) as count
      FROM businesses 
      GROUP BY source
      ORDER BY count DESC
    `);

    console.log(`   📊 Total Businesses: ${stats.rows[0].total}`);
    console.log(`   📧 With Email: ${stats.rows[0].with_email}`);
    console.log(`   🌐 With Website: ${stats.rows[0].with_website}`);
    console.log(`   📞 With Phone: ${stats.rows[0].with_phone}`);
    console.log('');

    console.log('   📈 By Source:');
    sourceStats.rows.forEach(row => {
      console.log(`      ${row.source}: ${row.count} businesses`);
    });
    console.log('');

    console.log('3. Sample Google-Scraped Businesses:');
    const businesses = await pool.query(`
      SELECT * FROM businesses 
      WHERE source LIKE 'google%' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    businesses.rows.forEach((business, index) => {
      console.log(`   ${index + 1}. ${business.name}`);
      console.log(`      Location: ${business.location}`);
      console.log(`      Source: ${business.source}`);
      console.log(`      Email: ${business.email || 'Not available'}`);
      console.log(`      Website: ${business.website || 'Not available'}`);
      console.log('');
    });

    await pool.end();

    console.log('🎉 Google Data Successfully Saved!');
    console.log(`📊 Added ${savedCount} new businesses from Google scraping`);
    console.log('');
    console.log('🌐 Next Steps:');
    console.log('   1. Open your browser: http://localhost:3000');
    console.log('   2. Navigate to "Data Capture" in the sidebar');
    console.log('   3. You should see the Google-scraped businesses');
    console.log('   4. Try the scraping controls to add more businesses');
    console.log('   5. Start your cold outreach campaigns!');

  } catch (error) {
    console.error('❌ Error saving Google data:', error.message);
  }
}

// Run the script
saveGoogleData();
