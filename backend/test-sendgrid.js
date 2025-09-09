const sgMail = require('@sendgrid/mail');
require('dotenv').config();

console.log('🧪 SendGrid Email Test');
console.log('======================\n');

console.log('1. Configuration:');
console.log('   API Key:', process.env.SENDGRID_API_KEY ? 'Set ✅' : 'Not set ❌');
console.log('   From Email:', process.env.FROM_EMAIL || 'Not set ❌');
console.log('');

if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.log('❌ SendGrid API key not configured properly');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'test@example.com',
  from: process.env.FROM_EMAIL,
  subject: 'Cold Outreach CRM - Test Email',
  text: 'This is a test email from your Cold Outreach CRM system.',
  html: '<p>This is a test email from your Cold Outreach CRM system.</p>'
};

sgMail.send(msg)
  .then(() => {
    console.log('✅ Email sent successfully!');
    console.log('🎉 SendGrid is working correctly!');
    console.log('');
    console.log('📧 Your Cold Outreach CRM can now send real emails!');
  })
  .catch(err => {
    console.error('❌ Email failed:', err.message);
    console.log('');
    console.log('🔧 Check your SendGrid configuration');
  });
