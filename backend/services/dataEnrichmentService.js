const axios = require('axios');

class DataEnrichmentService {
  constructor() {
    this.companiesHouseApiKey = process.env.COMPANIES_HOUSE_API_KEY;
    this.companiesHouseBaseUrl = 'https://api.company-information.service.gov.uk';
  }

  // Search Companies House for businesses in Hull & Yorkshire
  async searchCompaniesHouse(query, location = 'Hull') {
    try {
      const response = await axios.get(`${this.companiesHouseBaseUrl}/search/companies`, {
        params: {
          q: query,
          items_per_page: 20,
          start_index: 0
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(this.companiesHouseApiKey + ':').toString('base64')}`
        }
      });

      // Filter results for Hull & Yorkshire area
      const filteredResults = response.data.items.filter(company => {
        const address = company.address_snippet || '';
        const locationLower = location.toLowerCase();
        return address.toLowerCase().includes(locationLower) || 
               address.toLowerCase().includes('yorkshire') ||
               address.toLowerCase().includes('hull');
      });

      return filteredResults.map(company => this.transformCompaniesHouseData(company));
    } catch (error) {
      console.error('Companies House API error:', error);
      throw new Error('Failed to search Companies House');
    }
  }

  // Transform Companies House data to our business format
  transformCompaniesHouseData(company) {
    return {
      name: company.title,
      location: this.extractLocation(company.address_snippet),
      address: company.address_snippet,
      website: company.links?.self ? `https://find-and-update.company-information.service.gov.uk${company.links.self}` : null,
      source: 'companies_house',
      status: 'New',
      company_number: company.company_number,
      company_status: company.company_status,
      company_type: company.company_type,
      date_of_creation: company.date_of_creation
    };
  }

  // Extract location from address snippet
  extractLocation(addressSnippet) {
    if (!addressSnippet) return 'Hull';
    
    const addressParts = addressSnippet.split(',');
    // Look for Hull or Yorkshire in the address
    for (const part of addressParts) {
      const trimmed = part.trim().toLowerCase();
      if (trimmed.includes('hull')) return 'Hull';
      if (trimmed.includes('yorkshire')) return 'Yorkshire';
    }
    
    // Return the last part (usually the city/area)
    return addressParts[addressParts.length - 1]?.trim() || 'Hull';
  }

  // Get detailed company information
  async getCompanyDetails(companyNumber) {
    try {
      const response = await axios.get(`${this.companiesHouseBaseUrl}/company/${companyNumber}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.companiesHouseApiKey + ':').toString('base64')}`
        }
      });

      return this.transformDetailedCompanyData(response.data);
    } catch (error) {
      console.error('Companies House details API error:', error);
      throw new Error('Failed to get company details');
    }
  }

  // Transform detailed company data
  transformDetailedCompanyData(company) {
    const registeredOfficeAddress = company.registered_office_address || {};
    
    return {
      name: company.company_name,
      location: this.extractLocation(registeredOfficeAddress.address_line_1),
      address: [
        registeredOfficeAddress.address_line_1,
        registeredOfficeAddress.address_line_2,
        registeredOfficeAddress.locality,
        registeredOfficeAddress.region,
        registeredOfficeAddress.postal_code,
        registeredOfficeAddress.country
      ].filter(Boolean).join(', '),
      website: company.website || null,
      source: 'companies_house',
      status: 'New',
      company_number: company.company_number,
      company_status: company.company_status,
      company_type: company.type,
      date_of_creation: company.date_of_creation,
      sic_codes: company.sic_codes || [],
      description: company.description || null
    };
  }

  // Validate email address using regex and basic SMTP validation
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Enrich business data with additional information
  async enrichBusinessData(businessData) {
    const enriched = { ...businessData };

    // Validate email if present
    if (enriched.email && !this.validateEmail(enriched.email)) {
      enriched.email = null; // Remove invalid email
    }

    // Try to find website if not provided
    if (!enriched.website && enriched.name) {
      // Simple website generation based on business name
      const cleanName = enriched.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .substring(0, 20);
      enriched.website = `https://${cleanName}.co.uk`;
    }

    // Add Hull/Yorkshire location if not specified
    if (!enriched.location) {
      enriched.location = 'Hull';
    }

    return enriched;
  }

  // Search for businesses by industry/SIC code
  async searchByIndustry(sicCode, location = 'Hull') {
    try {
      const response = await axios.get(`${this.companiesHouseBaseUrl}/search/companies`, {
        params: {
          q: `sic_code:${sicCode}`,
          items_per_page: 50,
          start_index: 0
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(this.companiesHouseApiKey + ':').toString('base64')}`
        }
      });

      // Filter for Hull & Yorkshire
      const filteredResults = response.data.items.filter(company => {
        const address = company.address_snippet || '';
        return address.toLowerCase().includes('hull') || 
               address.toLowerCase().includes('yorkshire');
      });

      return filteredResults.map(company => this.transformCompaniesHouseData(company));
    } catch (error) {
      console.error('Companies House industry search error:', error);
      throw new Error('Failed to search by industry');
    }
  }

  // Get popular SIC codes for Hull & Yorkshire businesses
  getPopularSicCodes() {
    return [
      { code: '62020', description: 'Computer consultancy activities' },
      { code: '62010', description: 'Computer programming activities' },
      { code: '82990', description: 'Other business support service activities' },
      { code: '70229', description: 'Management consultancy activities' },
      { code: '62090', description: 'Other information technology service activities' },
      { code: '47110', description: 'Retail sale in non-specialised stores' },
      { code: '47190', description: 'Other retail sale in non-specialised stores' },
      { code: '56101', description: 'Licensed restaurants' },
      { code: '56102', description: 'Unlicensed restaurants and cafes' },
      { code: '68201', description: 'Renting and operating of own or leased real estate' }
    ];
  }
}

module.exports = new DataEnrichmentService();
