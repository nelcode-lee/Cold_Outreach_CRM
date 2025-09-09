const express = require('express');
const Business = require('../models/Business');
const OutreachLog = require('../models/OutreachLog');
const emailService = require('../services/emailService');

const router = express.Router();

// Get all businesses with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      location: req.query.location,
      status: req.query.status,
      search: req.query.search,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const businesses = await Business.findAll(filters);
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get business by ID
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Get outreach history
    const outreachHistory = await OutreachLog.findByBusinessId(req.params.id);
    business.outreach_history = outreachHistory;

    res.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Create new business
router.post('/', async (req, res) => {
  try {
    const businessData = req.body;
    
    // Validate required fields
    if (!businessData.name) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    // Validate email if provided
    if (businessData.email && !emailService.validateEmail(businessData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const business = await Business.create(businessData);
    res.status(201).json(business);
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

// Update business
router.put('/:id', async (req, res) => {
  try {
    const businessData = req.body;
    
    // Validate email if provided
    if (businessData.email && !emailService.validateEmail(businessData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const business = await Business.update(req.params.id, businessData);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Delete business
router.delete('/:id', async (req, res) => {
  try {
    const business = await Business.delete(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

// Send cold outreach email
router.post('/:id/outreach', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (!business.email) {
      return res.status(400).json({ error: 'Business has no email address' });
    }

    // Send email
    const emailResult = await emailService.sendColdOutreach(business);
    
    // Log outreach
    const outreachLog = await OutreachLog.create({
      business_id: business.id,
      email_sent: true,
      template_used: 'cold_outreach',
      notes: req.body.notes || 'Cold outreach email sent'
    });

    // Update business last contacted
    await Business.updateLastContacted(business.id);

    res.json({
      message: 'Outreach email sent successfully',
      outreach_log: outreachLog,
      email_result: emailResult
    });
  } catch (error) {
    console.error('Error sending outreach:', error);
    res.status(500).json({ error: 'Failed to send outreach email' });
  }
});

// Get business statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Business.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching business stats:', error);
    res.status(500).json({ error: 'Failed to fetch business statistics' });
  }
});

module.exports = router;
