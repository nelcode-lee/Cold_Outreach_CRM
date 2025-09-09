#!/usr/bin/env node

// Simple working backend to serve the data
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Cold Outreach CRM API'
  });
});

// Get all businesses
app.get('/api/businesses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, location, address, telephone, email, website, source, status, created_at, updated_at
      FROM businesses 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get business by ID
app.get('/api/businesses/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM businesses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Get scraping statistics
app.get('/api/scraping/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        source,
        COUNT(*) as count,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
        COUNT(CASE WHEN telephone IS NOT NULL AND telephone != '' THEN 1 END) as with_phone
      FROM businesses 
      GROUP BY source
      ORDER BY count DESC
    `);

    const totalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
        COUNT(CASE WHEN telephone IS NOT NULL AND telephone != '' THEN 1 END) as with_phone,
        COUNT(CASE WHEN status = 'New' THEN 1 END) as new,
        COUNT(CASE WHEN status = 'Contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'Interested' THEN 1 END) as interested,
        COUNT(CASE WHEN status = 'Not Interested' THEN 1 END) as not_interested
      FROM businesses
    `);

    res.json({
      success: true,
      data: {
        bySource: stats.rows,
        total: totalStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching scraping stats:', error);
    res.status(500).json({ error: 'Failed to fetch scraping statistics' });
  }
});

// Start scraping
app.post('/api/scraping/start-quick', (req, res) => {
  res.json({
    success: true,
    message: 'Quick scraping started (mock)',
    status: 'running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Cold Outreach CRM API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Businesses: http://localhost:${PORT}/api/businesses`);
  console.log(`📈 Stats: http://localhost:${PORT}/api/scraping/stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
