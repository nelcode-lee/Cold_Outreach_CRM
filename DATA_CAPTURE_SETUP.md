# Data Capture System Setup Guide

## 🎯 Overview

Your Cold Outreach CRM now includes a comprehensive data capture system that automatically discovers and scrapes business data from multiple sources. This system can find hundreds of Hull & Yorkshire businesses and enrich their data automatically.

## 🚀 Features

### Data Sources
- **Companies House API** - Official UK company registry
- **Yell.com** - UK business directory
- **Yelp** - Business reviews and listings
- **Google My Business** - Local business listings
- **LinkedIn** - Professional business profiles
- **Facebook** - Business pages
- **Google Maps** - Local business data

### Data Enrichment
- **Email Discovery** - Find business email addresses
- **Website Detection** - Discover business websites
- **Phone Numbers** - Extract contact numbers
- **Social Media** - Find social media profiles
- **Business Descriptions** - Extract company descriptions
- **Industry Classification** - Categorize business types
- **Employee Count** - Estimate business size

## 🔧 Setup Instructions

### 1. Configure Companies House API

The Companies House API provides the most reliable business data. You need to get a free API key:

1. **Visit**: https://developer.company-information.service.gov.uk/
2. **Sign up** for a free account
3. **Get your API key** (starts with a random string)
4. **Update your `.env` file**:

```bash
# In backend/.env
COMPANIES_HOUSE_API_KEY=your_api_key_here
```

### 2. Test the Data Capture System

```bash
# Test basic scraping
node simple-scraping-test.js

# Test full scraping pipeline
node test-scraping.js
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

### 4. Access the Data Capture Interface

1. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```

2. **Navigate to "Data Capture"** in the sidebar

3. **Use the scraping controls**:
   - **Quick Scrape** - Basic web scraping (fast)
   - **Advanced Scrape** - Puppeteer-based scraping (comprehensive)
   - **Full Pipeline** - Complete scraping + validation
   - **Validate Data** - Enrich existing data

## 📊 How It Works

### Scraping Process

1. **Data Discovery**
   - Searches multiple sources for Hull & Yorkshire businesses
   - Uses various search terms and locations
   - Implements rate limiting to avoid blocking

2. **Data Extraction**
   - Extracts business name, location, contact details
   - Finds websites, social media, descriptions
   - Identifies business type and industry

3. **Data Validation**
   - Validates email addresses and websites
   - Enriches missing contact information
   - Deduplicates businesses across sources

4. **Database Storage**
   - Saves validated data to PostgreSQL
   - Tracks data source and quality
   - Maintains audit trail

### Data Quality

The system automatically:
- **Deduplicates** businesses across sources
- **Validates** email addresses and websites
- **Enriches** missing contact information
- **Categorizes** businesses by industry
- **Estimates** business size and type

## 🎛️ API Endpoints

### Scraping Controls
```bash
# Start quick scraping
POST /api/scraping/start-quick

# Start advanced scraping
POST /api/scraping/start-advanced

# Start full pipeline
POST /api/scraping/start-full

# Start data validation
POST /api/scraping/start-validation
```

### Statistics
```bash
# Get scraping statistics
GET /api/scraping/stats

# Get scraping status
GET /api/scraping/status
```

### Data Management
```bash
# Clean up old data
POST /api/scraping/cleanup
```

## 📈 Expected Results

### Typical Scraping Results
- **Companies House**: 200-500 businesses per search term
- **Yell.com**: 50-100 businesses per category/location
- **Yelp**: 30-80 businesses per category/location
- **Google Maps**: 20-50 businesses per search term
- **LinkedIn**: 100-300 businesses per search term
- **Facebook**: 50-150 businesses per search term

### Total Expected
- **Initial Scrape**: 500-1000+ businesses
- **After Deduplication**: 300-800 unique businesses
- **With Email**: 60-80% of businesses
- **With Website**: 70-90% of businesses
- **With Phone**: 80-95% of businesses

## 🔍 Data Sources Breakdown

### Companies House API
- **Most Reliable**: Official UK company registry
- **Data Quality**: High (verified business information)
- **Coverage**: All registered UK companies
- **Rate Limit**: 600 requests per 5 minutes

### Yell.com
- **Business Directory**: UK's largest business directory
- **Data Quality**: Good (user-submitted, verified)
- **Coverage**: Local businesses, services
- **Rate Limit**: Respectful scraping (1 request/second)

### Yelp
- **Reviews & Listings**: Business reviews and information
- **Data Quality**: Good (user-generated content)
- **Coverage**: Local businesses, restaurants, services
- **Rate Limit**: Respectful scraping (1 request/second)

### Google My Business
- **Local Listings**: Google's business directory
- **Data Quality**: High (Google-verified)
- **Coverage**: Local businesses with Google presence
- **Rate Limit**: Respectful scraping (1 request/second)

### LinkedIn
- **Professional Profiles**: Business and company pages
- **Data Quality**: High (professional information)
- **Coverage**: B2B companies, professional services
- **Rate Limit**: Respectful scraping (1 request/second)

### Facebook
- **Business Pages**: Facebook business profiles
- **Data Quality**: Medium (user-generated)
- **Coverage**: Local businesses with Facebook presence
- **Rate Limit**: Respectful scraping (1 request/second)

## 🛠️ Troubleshooting

### Common Issues

1. **Companies House API 401 Error**
   - Check your API key in `backend/.env`
   - Ensure the key is valid and active
   - Verify the key format (should be a random string)

2. **Scraping Rate Limited**
   - The system includes built-in delays
   - Wait a few minutes before retrying
   - Consider running during off-peak hours

3. **No Data Found**
   - Check your internet connection
   - Verify the target websites are accessible
   - Try different search terms

4. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check your `DATABASE_URL` in `backend/.env`
   - Verify the database schema is created

### Performance Tips

1. **Run During Off-Peak Hours**
   - Scraping is more reliable during low-traffic periods
   - Avoid running during business hours

2. **Use Quick Scrape First**
   - Start with quick scraping to get initial data
   - Use advanced scraping for comprehensive results

3. **Monitor Progress**
   - Check the frontend interface for real-time progress
   - Review scraping statistics regularly

## 🎉 Success Metrics

After successful setup, you should see:

- **500+ businesses** in your database
- **60%+ with email addresses**
- **70%+ with websites**
- **80%+ with phone numbers**
- **Multiple data sources** contributing data
- **Real-time statistics** in the frontend

## 🚀 Next Steps

1. **Configure Companies House API** key
2. **Run initial scraping** to populate your database
3. **Review and validate** the scraped data
4. **Start your cold outreach campaigns**
5. **Monitor and maintain** data quality

Your Cold Outreach CRM is now equipped with a powerful data capture system that will automatically discover and enrich business data for your outreach campaigns!
