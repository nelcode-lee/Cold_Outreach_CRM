const express = require('express');
const router = express.Router();
const ScraperOrchestrator = require('../scrapers/scraperOrchestrator');

const scraperOrchestrator = new ScraperOrchestrator();

// Start full scraping pipeline
router.post('/start-full', async (req, res) => {
  try {
    console.log('🚀 Starting full scraping pipeline...');
    
    // Run scraping in background
    scraperOrchestrator.runFullScraping()
      .then(results => {
        console.log('✅ Full scraping completed:', results);
      })
      .catch(error => {
        console.error('❌ Full scraping failed:', error);
      });

    res.json({
      success: true,
      message: 'Full scraping pipeline started',
      status: 'running'
    });

  } catch (error) {
    console.error('Error starting full scraping:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start quick scraping
router.post('/start-quick', async (req, res) => {
  try {
    console.log('⚡ Starting quick scraping...');
    
    // Run scraping in background
    scraperOrchestrator.runQuickScraping()
      .then(results => {
        console.log('✅ Quick scraping completed:', results);
      })
      .catch(error => {
        console.error('❌ Quick scraping failed:', error);
      });

    res.json({
      success: true,
      message: 'Quick scraping started',
      status: 'running'
    });

  } catch (error) {
    console.error('Error starting quick scraping:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start advanced scraping
router.post('/start-advanced', async (req, res) => {
  try {
    console.log('🔍 Starting advanced scraping...');
    
    // Run scraping in background
    scraperOrchestrator.runAdvancedScraping()
      .then(results => {
        console.log('✅ Advanced scraping completed:', results);
      })
      .catch(error => {
        console.error('❌ Advanced scraping failed:', error);
      });

    res.json({
      success: true,
      message: 'Advanced scraping started',
      status: 'running'
    });

  } catch (error) {
    console.error('Error starting advanced scraping:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start data validation
router.post('/start-validation', async (req, res) => {
  try {
    console.log('🔍 Starting data validation...');
    
    // Run validation in background
    scraperOrchestrator.runDataValidation()
      .then(results => {
        console.log('✅ Data validation completed:', results);
      })
      .catch(error => {
        console.error('❌ Data validation failed:', error);
      });

    res.json({
      success: true,
      message: 'Data validation started',
      status: 'running'
    });

  } catch (error) {
    console.error('Error starting data validation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get scraping statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await scraperOrchestrator.getScrapingStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting scraping stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clean up old data
router.post('/cleanup', async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const cleanedCount = await scraperOrchestrator.cleanupOldData(daysOld);
    
    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} old businesses`,
      cleanedCount
    });

  } catch (error) {
    console.error('Error cleaning up data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get scraping status
router.get('/status', async (req, res) => {
  try {
    // This is a simple status check
    // In production, you'd want to track actual scraping progress
    res.json({
      success: true,
      status: 'ready',
      message: 'Scraping system is ready'
    });

  } catch (error) {
    console.error('Error getting scraping status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
