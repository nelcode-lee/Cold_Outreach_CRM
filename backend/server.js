const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const businessRoutes = require('./routes/businesses');
const outreachRoutes = require('./routes/outreach');
const dataEnrichmentRoutes = require('./routes/dataEnrichment');
const scrapingRoutes = require('./routes/scraping');
const automationService = require('./services/automationService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/businesses', businessRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/api/data-enrichment', dataEnrichmentRoutes);
app.use('/api/scraping', scrapingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Cold Outreach CRM API'
  });
});

// Automation endpoints
app.post('/api/automation/queue-cold-outreach', async (req, res) => {
  try {
    const { businessId, delay = 0 } = req.body;
    
    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const job = await automationService.queueColdOutreach(businessId, delay);
    res.json({ 
      message: 'Cold outreach queued successfully',
      jobId: job.id,
      businessId,
      delay
    });
  } catch (error) {
    console.error('Error queuing cold outreach:', error);
    res.status(500).json({ error: 'Failed to queue cold outreach' });
  }
});

app.post('/api/automation/queue-bulk-outreach', async (req, res) => {
  try {
    const { limit = 10, delayBetweenEmails = 60 } = req.body;
    
    const jobs = await automationService.queueBulkColdOutreach(limit, delayBetweenEmails);
    res.json({ 
      message: 'Bulk cold outreach queued successfully',
      jobsQueued: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Error queuing bulk outreach:', error);
    res.status(500).json({ error: 'Failed to queue bulk outreach' });
  }
});

app.get('/api/automation/queue-stats', async (req, res) => {
  try {
    const stats = await automationService.getQueueStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({ error: 'Failed to fetch queue statistics' });
  }
});

app.post('/api/automation/pause-queue', async (req, res) => {
  try {
    await automationService.pauseQueue();
    res.json({ message: 'Queue paused successfully' });
  } catch (error) {
    console.error('Error pausing queue:', error);
    res.status(500).json({ error: 'Failed to pause queue' });
  }
});

app.post('/api/automation/resume-queue', async (req, res) => {
  try {
    await automationService.resumeQueue();
    res.json({ message: 'Queue resumed successfully' });
  } catch (error) {
    console.error('Error resuming queue:', error);
    res.status(500).json({ error: 'Failed to resume queue' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Cold Outreach CRM API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
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

module.exports = app;
