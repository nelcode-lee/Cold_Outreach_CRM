const express = require('express');
const OutreachLog = require('../models/OutreachLog');

const router = express.Router();

// Get all outreach logs with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      email_sent: req.query.email_sent === 'true' ? true : req.query.email_sent === 'false' ? false : undefined,
      phone_called: req.query.phone_called === 'true' ? true : req.query.phone_called === 'false' ? false : undefined,
      business_id: req.query.business_id ? parseInt(req.query.business_id) : undefined
    };

    const outreachLogs = await OutreachLog.findAll(filters);
    res.json(outreachLogs);
  } catch (error) {
    console.error('Error fetching outreach logs:', error);
    res.status(500).json({ error: 'Failed to fetch outreach logs' });
  }
});

// Get outreach statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await OutreachLog.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching outreach stats:', error);
    res.status(500).json({ error: 'Failed to fetch outreach statistics' });
  }
});

// Update outreach log (e.g., mark response received)
router.put('/:id', async (req, res) => {
  try {
    const { response_received, notes } = req.body;
    
    let updateData = {};
    if (response_received !== undefined) {
      updateData.response_received = response_received;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // For now, we'll just update response_received
    if (response_received !== undefined) {
      const outreachLog = await OutreachLog.updateResponseReceived(req.params.id, response_received);
      if (!outreachLog) {
        return res.status(404).json({ error: 'Outreach log not found' });
      }
      res.json(outreachLog);
    } else {
      res.status(400).json({ error: 'No valid update fields provided' });
    }
  } catch (error) {
    console.error('Error updating outreach log:', error);
    res.status(500).json({ error: 'Failed to update outreach log' });
  }
});

module.exports = router;
