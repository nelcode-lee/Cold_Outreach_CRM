#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testEmailFunctionality() {
  console.log('🧪 Testing Cold Outreach CRM Email Functionality');
  console.log('================================================\n');

  try {
    // Step 1: Test API health
    console.log('1. Testing API health...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('   ✅ API is healthy\n');

    // Step 2: Create a test business
    console.log('2. Creating test business...');
    const testBusiness = {
      name: 'Test Business Ltd',
      location: 'Hull',
      email: 'test@example.com', // Using a test email
      telephone: '+44 1234 567890',
      website: 'https://testbusiness.co.uk',
      source: 'manual',
      status: 'New'
    };

    const businessResponse = await axios.post(`${API_BASE_URL}/businesses`, testBusiness);
    const businessId = businessResponse.data.id;
    console.log(`   ✅ Test business created with ID: ${businessId}\n`);

    // Step 3: Test outreach email sending
    console.log('3. Testing outreach email sending...');
    console.log('   📧 Sending cold outreach email...');
    
    const outreachResponse = await axios.post(`${API_BASE_URL}/businesses/${businessId}/outreach`, {
      notes: 'Test outreach email from automated test'
    });

    console.log('   ✅ Outreach email sent successfully!');
    console.log('   📊 Response:', outreachResponse.data);
    console.log('');

    // Step 4: Check outreach history
    console.log('4. Checking outreach history...');
    const historyResponse = await axios.get(`${API_BASE_URL}/outreach?business_id=${businessId}`);
    console.log(`   ✅ Found ${historyResponse.data.length} outreach record(s)`);
    
    if (historyResponse.data.length > 0) {
      const latestOutreach = historyResponse.data[0];
      console.log('   📋 Latest outreach details:');
      console.log(`      - Email sent: ${latestOutreach.email_sent}`);
      console.log(`      - Template used: ${latestOutreach.template_used}`);
      console.log(`      - Sent at: ${latestOutreach.sent_at}`);
      console.log(`      - Notes: ${latestOutreach.notes}`);
    }
    console.log('');

    // Step 5: Clean up test data
    console.log('5. Cleaning up test data...');
    await axios.delete(`${API_BASE_URL}/businesses/${businessId}`);
    console.log('   ✅ Test business deleted\n');

    console.log('🎉 Email functionality test completed successfully!');
    console.log('');
    console.log('📧 What happened:');
    console.log('   - A test business was created');
    console.log('   - A cold outreach email was sent via SendGrid');
    console.log('   - The email was logged in the database');
    console.log('   - Test data was cleaned up');
    console.log('');
    console.log('🔍 Check your SendGrid dashboard to see the email delivery status!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure backend is running: cd backend && npm run dev');
    console.log('   2. Check SendGrid API key in backend/.env');
    console.log('   3. Verify database connection');
  }
}

// Run the test
testEmailFunctionality();
