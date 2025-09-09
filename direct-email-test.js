#!/usr/bin/env node

// Direct email test without API dependency
const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: './backend/.env' });

async function testEmailDirectly() {
  console.log('🧪 Direct SendGrid Email Test');
  console.log('=============================\n');

  // Check configuration
  console.log('1. Checking SendGrid configuration...');
  console.log(`   API Key: ${process.env.SENDGRID_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
  console.log(`   From Email: ${process.env.FROM_EMAIL || 'Not set ❌'}`);
  console.log('');

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.log('❌ SendGrid API key not configured properly');
    return;
  }

  // Configure SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    console.log('2. Sending test email...');
    
    const msg = {
      to: 'test@example.com', // Test email address
      from: process.env.FROM_EMAIL,
      subject: 'Cold Outreach CRM - Test Email',
      text: `Hi Test Business,

This is a test email from your Cold Outreach CRM system.

The system is working correctly and can send emails via SendGrid.

Best regards,
Cold Outreach CRM`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Cold Outreach CRM - Test Email</h2>
          <p>Hi Test Business,</p>
          <p>This is a test email from your Cold Outreach CRM system.</p>
          <p>The system is working correctly and can send emails via SendGrid.</p>
          <p>Best regards,<br>Cold Outreach CRM</p>
        </div>
      `
    };

    const result = await sgMail.send(msg);
    console.log('   ✅ Email sent successfully!');
    console.log(`   📧 Message ID: ${result[0].headers['x-message-id']}`);
    console.log('');

    console.log('🎉 SendGrid Email Test PASSED!');
    console.log('');
    console.log('📧 What this means:');
    console.log('   - SendGrid API is working correctly');
    console.log('   - Your API key is valid');
    console.log('   - Email sending is functional');
    console.log('   - The CRM can send real emails to businesses');
    console.log('');
    console.log('🔍 Check your SendGrid dashboard for delivery status!');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your SendGrid API key in backend/.env');
    console.log('   2. Verify your SendGrid account is active');
    console.log('   3. Check SendGrid dashboard for any issues');
  }
}

// Run the test
testEmailDirectly();
