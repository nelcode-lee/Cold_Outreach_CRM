#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

async function setupDatabase() {
  console.log('🚀 Setting up Cold Outreach CRM Database...\n');

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('Please update backend/.env with your Neon DB connection string');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to database successfully\n');

    // Read and execute schema
    console.log('📋 Reading database schema...');
    const schemaPath = path.join(__dirname, 'backend', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🏗️  Creating tables and indexes...');
    await client.query(schema);
    console.log('✅ Database schema created successfully\n');

    // Test the tables
    console.log('🧪 Testing table creation...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Test data insertion
    console.log('\n🧪 Testing data insertion...');
    const testBusiness = await client.query(`
      INSERT INTO businesses (name, location, email, source, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name
    `, ['Test Business', 'Hull', 'test@example.com', 'manual', 'New']);
    
    console.log(`✅ Test business created: ${testBusiness.rows[0].name} (ID: ${testBusiness.rows[0].id})`);

    // Clean up test data
    await client.query('DELETE FROM businesses WHERE name = $1', ['Test Business']);
    console.log('🧹 Test data cleaned up');

    client.release();
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: cd frontend && npm start');
    console.log('3. Visit http://localhost:3000 to use the CRM');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your DATABASE_URL in backend/.env');
    console.log('2. Ensure your Neon DB is active');
    console.log('3. Verify your connection string format');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();
