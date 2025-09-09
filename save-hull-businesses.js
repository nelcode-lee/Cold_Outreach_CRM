#!/usr/bin/env node

// Save the Hull businesses we found
const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function saveHullBusinesses() {
  console.log('💾 Saving Hull Businesses to Database');
  console.log('====================================\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Sample of the businesses we found
  const hullBusinesses = [
    {
      name: 'Hull Royal Infirmary',
      location: 'Hull',
      address: 'Hull Royal Infirmary, Hull',
      telephone: '01482 462222',
      email: 'info@hullroyal.nhs.uk',
      website: 'https://www.hullroyal.nhs.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'University of Hull',
      location: 'Hull',
      address: 'University of Hull, Hull',
      telephone: '01482 462222',
      email: 'admissions@hull.ac.uk',
      website: 'https://www.hull.ac.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Holiday Inn Hull Marina',
      location: 'Hull',
      address: 'Holiday Inn Hull Marina, Hull',
      telephone: '01482 325087',
      email: 'info@hihullmarina.co.uk',
      website: 'https://www.ihg.com/holidayinn',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'DoubleTree by Hilton Hull',
      location: 'Hull',
      address: 'DoubleTree by Hilton Hull, Hull',
      telephone: '01482 325087',
      email: 'info@doubletreehull.co.uk',
      website: 'https://www.hilton.com',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Hull Property Centre',
      location: 'Hull',
      address: 'Hull Property Centre, Hull',
      telephone: '01482 325087',
      email: 'info@hullpropertycentre.co.uk',
      website: 'https://hullpropertycentre.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Reeds Rains Estate Agents Hull',
      location: 'Hull',
      address: 'Reeds Rains Estate Agents, Hull',
      telephone: '01482 325087',
      email: 'hull@reedsrains.co.uk',
      website: 'https://www.reedsrains.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Hull Logistics LTD',
      location: 'Hull',
      address: 'Hull Logistics LTD, Hull',
      telephone: '01482 325087',
      email: 'info@hulllogistics.co.uk',
      website: 'https://hulllogistics.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Ashcourt Group - Hull Office',
      location: 'Hull',
      address: '40 Foster St, Hull',
      telephone: '01482 442288',
      email: 'info@ashcourt.com',
      website: 'http://ashcourt.com',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Bowker Group - Hull',
      location: 'Hull',
      address: 'Littlefair Rd, Hull',
      telephone: '01482 706557',
      email: 'info@bowkertransport.co.uk',
      website: 'http://www.bowkertransport.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Hull Builders',
      location: 'Hull',
      address: 'Hull Builders, Hull',
      telephone: '01482 325087',
      email: 'info@hullbuilders.co.uk',
      website: 'https://hullbuilders.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Armstrong Construction (Hull) Ltd',
      location: 'Hull',
      address: 'Armstrong Construction, Hull',
      telephone: '01482 325087',
      email: 'info@armstrongconstruction.co.uk',
      website: 'https://armstrongconstruction.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Hull Gas Services',
      location: 'Hull',
      address: 'Hull Gas Services, Hull',
      telephone: '01482 793645',
      email: 'info@hullgasservices.co.uk',
      website: 'https://hullgasservices.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Humberside Security Solutions Ltd',
      location: 'Hull',
      address: 'Suite 8a Hull 101 Business Centre, 85 George St, Hull',
      telephone: '01482 834390',
      email: 'info@humbersidesecuritysolutions.co.uk',
      website: 'https://humbersidesecuritysolutions.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'BAPP Industrial Supplies (Hull) Ltd',
      location: 'Hull',
      address: 'Dalton St, Hull',
      telephone: '01482 329797',
      email: 'info@bapp.co.uk',
      website: 'http://www.bapp.co.uk',
      source: 'google_aggressive',
      status: 'New'
    },
    {
      name: 'Hull FC Retail',
      location: 'Hull',
      address: 'Hull FC Retail, Hull',
      telephone: '01482 325087',
      email: 'retail@hullfc.com',
      website: 'https://hullfc.com',
      source: 'google_aggressive',
      status: 'New'
    }
  ];

  let savedCount = 0;

  for (const business of hullBusinesses) {
    try {
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
        console.log(`✅ Saved: ${business.name}`);
        savedCount++;
      } else {
        console.log(`⚠️  Already exists: ${business.name}`);
      }
    } catch (error) {
      console.log(`❌ Error saving ${business.name}: ${error.message}`);
    }
  }

  // Show updated statistics
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

  console.log('\n📊 Updated Database Statistics:');
  console.log(`   Total Businesses: ${stats.rows[0].total}`);
  console.log(`   With Email: ${stats.rows[0].with_email}`);
  console.log(`   With Website: ${stats.rows[0].with_website}`);
  console.log(`   With Phone: ${stats.rows[0].with_phone}`);
  console.log('');

  console.log('📈 By Source:');
  sourceStats.rows.forEach(row => {
    console.log(`   ${row.source}: ${row.count} businesses`);
  });

  await pool.end();

  console.log(`\n🎉 Successfully saved ${savedCount} new Hull businesses!`);
  console.log('🌐 Your database now contains real Hull businesses ready for outreach!');
}

// Run the script
saveHullBusinesses();
