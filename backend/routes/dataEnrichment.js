const express = require('express');
const dataEnrichmentService = require('../services/dataEnrichmentService');
const Business = require('../models/Business');

const router = express.Router();

// Search Companies House for businesses
router.get('/companies-house/search', async (req, res) => {
  try {
    const { query, location = 'Hull' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await dataEnrichmentService.searchCompaniesHouse(query, location);
    res.json({
      results,
      count: results.length,
      query,
      location
    });
  } catch (error) {
    console.error('Companies House search error:', error);
    res.status(500).json({ error: 'Failed to search Companies House' });
  }
});

// Search by industry/SIC code
router.get('/companies-house/industry', async (req, res) => {
  try {
    const { sicCode, location = 'Hull' } = req.query;
    
    if (!sicCode) {
      return res.status(400).json({ error: 'SIC code parameter is required' });
    }

    const results = await dataEnrichmentService.searchByIndustry(sicCode, location);
    res.json({
      results,
      count: results.length,
      sicCode,
      location
    });
  } catch (error) {
    console.error('Industry search error:', error);
    res.status(500).json({ error: 'Failed to search by industry' });
  }
});

// Get popular SIC codes
router.get('/companies-house/sic-codes', async (req, res) => {
  try {
    const sicCodes = dataEnrichmentService.getPopularSicCodes();
    res.json(sicCodes);
  } catch (error) {
    console.error('SIC codes error:', error);
    res.status(500).json({ error: 'Failed to get SIC codes' });
  }
});

// Get detailed company information
router.get('/companies-house/company/:companyNumber', async (req, res) => {
  try {
    const { companyNumber } = req.params;
    const companyDetails = await dataEnrichmentService.getCompanyDetails(companyNumber);
    res.json(companyDetails);
  } catch (error) {
    console.error('Company details error:', error);
    res.status(500).json({ error: 'Failed to get company details' });
  }
});

// Import businesses from Companies House search
router.post('/companies-house/import', async (req, res) => {
  try {
    const { companies, location = 'Hull' } = req.body;
    
    if (!companies || !Array.isArray(companies)) {
      return res.status(400).json({ error: 'Companies array is required' });
    }

    const importedBusinesses = [];
    const errors = [];

    for (const companyData of companies) {
      try {
        // Enrich the data
        const enrichedData = await dataEnrichmentService.enrichBusinessData(companyData);
        
        // Check if business already exists (by name and location)
        const existingBusiness = await Business.findAll({
          search: enrichedData.name,
          location: enrichedData.location
        });

        if (existingBusiness.length > 0) {
          errors.push({
            company: enrichedData.name,
            error: 'Business already exists'
          });
          continue;
        }

        // Create the business
        const business = await Business.create(enrichedData);
        importedBusinesses.push(business);
      } catch (error) {
        errors.push({
          company: companyData.name || 'Unknown',
          error: error.message
        });
      }
    }

    res.json({
      imported: importedBusinesses,
      importedCount: importedBusinesses.length,
      errors,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import businesses' });
  }
});

// Bulk import from Companies House search
router.post('/companies-house/bulk-import', async (req, res) => {
  try {
    const { query, location = 'Hull', sicCode } = req.body;
    
    let results;
    if (sicCode) {
      results = await dataEnrichmentService.searchByIndustry(sicCode, location);
    } else if (query) {
      results = await dataEnrichmentService.searchCompaniesHouse(query, location);
    } else {
      return res.status(400).json({ error: 'Query or SIC code is required' });
    }

    const importedBusinesses = [];
    const errors = [];

    for (const companyData of results) {
      try {
        // Enrich the data
        const enrichedData = await dataEnrichmentService.enrichBusinessData(companyData);
        
        // Check if business already exists
        const existingBusiness = await Business.findAll({
          search: enrichedData.name,
          location: enrichedData.location
        });

        if (existingBusiness.length > 0) {
          errors.push({
            company: enrichedData.name,
            error: 'Business already exists'
          });
          continue;
        }

        // Create the business
        const business = await Business.create(enrichedData);
        importedBusinesses.push(business);
      } catch (error) {
        errors.push({
          company: companyData.name || 'Unknown',
          error: error.message
        });
      }
    }

    res.json({
      imported: importedBusinesses,
      importedCount: importedBusinesses.length,
      errors,
      errorCount: errors.length,
      searchQuery: query || sicCode,
      location
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to bulk import businesses' });
  }
});

// Validate email address
router.post('/validate-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const isValid = dataEnrichmentService.validateEmail(email);
    res.json({ email, isValid });
  } catch (error) {
    console.error('Email validation error:', error);
    res.status(500).json({ error: 'Failed to validate email' });
  }
});

module.exports = router;
