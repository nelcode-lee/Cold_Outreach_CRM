const WebScraper = require('./webScraper');
const AdvancedScraper = require('./advancedScraper');
const DataValidator = require('./dataValidator');

class ScraperOrchestrator {
  constructor() {
    this.webScraper = new WebScraper();
    this.advancedScraper = new AdvancedScraper();
    this.dataValidator = new DataValidator();
  }

  // Main scraping orchestrator
  async runFullScraping() {
    console.log('🚀 Starting Full Business Data Scraping Pipeline');
    console.log('================================================\n');

    const results = {
      scraping: null,
      validation: null,
      total: 0,
      errors: []
    };

    try {
      // Step 1: Basic web scraping
      console.log('📊 Phase 1: Basic Web Scraping');
      console.log('==============================');
      results.scraping = await this.webScraper.scrapeAllSources();
      console.log('');

      // Step 2: Advanced scraping with Puppeteer
      console.log('🔍 Phase 2: Advanced Scraping');
      console.log('=============================');
      const advancedResults = await this.advancedScraper.scrapeAllSources();
      
      // Merge results
      results.scraping.companiesHouse += advancedResults.companiesHouse;
      results.scraping.linkedin = advancedResults.linkedin;
      results.scraping.facebook = advancedResults.facebook;
      results.scraping.googleMaps = advancedResults.googleMaps;
      results.scraping.total += advancedResults.total;
      results.scraping.errors.push(...advancedResults.errors);
      console.log('');

      // Step 3: Data validation and enrichment
      console.log('🔍 Phase 3: Data Validation & Enrichment');
      console.log('=========================================');
      results.validation = await this.dataValidator.validateAllBusinesses();
      console.log('');

      // Calculate totals
      results.total = results.scraping.total + results.validation.validated;

      console.log('🎉 Full Scraping Pipeline Completed!');
      console.log('====================================');
      console.log(`📊 Total businesses scraped: ${results.scraping.total}`);
      console.log(`🔍 Total businesses validated: ${results.validation.validated}`);
      console.log(`📈 Total businesses processed: ${results.total}`);
      console.log(`❌ Total errors: ${results.scraping.errors.length + results.validation.errors.length}`);

      return results;

    } catch (error) {
      console.error('❌ Full scraping pipeline failed:', error.message);
      results.errors.push(error.message);
      return results;
    }
  }

  // Quick scraping (basic sources only)
  async runQuickScraping() {
    console.log('⚡ Starting Quick Business Data Scraping');
    console.log('========================================\n');

    try {
      const results = await this.webScraper.scrapeAllSources();
      
      console.log('🎉 Quick Scraping Completed!');
      console.log(`📊 Total businesses found: ${results.total}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      return results;

    } catch (error) {
      console.error('❌ Quick scraping failed:', error.message);
      return { total: 0, errors: [error.message] };
    }
  }

  // Advanced scraping only
  async runAdvancedScraping() {
    console.log('🔍 Starting Advanced Business Data Scraping');
    console.log('===========================================\n');

    try {
      const results = await this.advancedScraper.scrapeAllSources();
      
      console.log('🎉 Advanced Scraping Completed!');
      console.log(`📊 Total businesses found: ${results.total}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      return results;

    } catch (error) {
      console.error('❌ Advanced scraping failed:', error.message);
      return { total: 0, errors: [error.message] };
    }
  }

  // Data validation only
  async runDataValidation() {
    console.log('🔍 Starting Data Validation & Enrichment');
    console.log('=========================================\n');

    try {
      const results = await this.dataValidator.validateAllBusinesses();
      
      console.log('🎉 Data Validation Completed!');
      console.log(`📊 Total businesses validated: ${results.validated}`);
      console.log(`🔍 Fields enriched: ${results.enriched}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      return results;

    } catch (error) {
      console.error('❌ Data validation failed:', error.message);
      return { validated: 0, enriched: 0, errors: [error.message] };
    }
  }

  // Get scraping statistics
  async getScrapingStats() {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

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

      await pool.end();

      return {
        bySource: stats.rows,
        total: totalStats.rows[0]
      };

    } catch (error) {
      console.error('❌ Error getting scraping stats:', error.message);
      return { bySource: [], total: {} };
    }
  }

  // Clean up old data
  async cleanupOldData(daysOld = 30) {
    console.log(`🧹 Cleaning up data older than ${daysOld} days...`);

    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      const result = await pool.query(
        'DELETE FROM businesses WHERE created_at < NOW() - INTERVAL $1 DAY',
        [daysOld]
      );

      await pool.end();

      console.log(`✅ Cleaned up ${result.rowCount} old businesses`);
      return result.rowCount;

    } catch (error) {
      console.error('❌ Error cleaning up data:', error.message);
      return 0;
    }
  }
}

module.exports = ScraperOrchestrator;
