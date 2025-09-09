const sgMail = require('@sendgrid/mail');
require('dotenv').config();

if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SENDGRID_API_KEY not configured or invalid. Email sending will be disabled.');
}

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'you@nuvaru.co.uk';
  }

  // Email templates
  getTemplates() {
    return {
      cold_outreach: {
        subject: 'Helping {{business_name}} with AI & Automation in Hull',
        text: `Hi {{first_name}},

I work with businesses across Hull and Yorkshire, helping them streamline operations with AI-driven automation.

I noticed {{business_name}} is based in {{location}}, and thought it might be useful to explore how automation could reduce costs and boost efficiency.

Would you be open to a quick 15-min call next week?

Best,
[Your Name]
Nuvaru – AI & Automation Specialists`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Helping {{business_name}} with AI & Automation in Hull</h2>
            <p>Hi {{first_name}},</p>
            <p>I work with businesses across Hull and Yorkshire, helping them streamline operations with AI-driven automation.</p>
            <p>I noticed {{business_name}} is based in {{location}}, and thought it might be useful to explore how automation could reduce costs and boost efficiency.</p>
            <p>Would you be open to a quick 15-min call next week?</p>
            <p>Best,<br>
            [Your Name]<br>
            <strong>Nuvaru – AI & Automation Specialists</strong></p>
          </div>
        `
      },
      follow_up: {
        subject: 'Following up on AI & Automation for {{business_name}}',
        text: `Hi {{first_name}},

I wanted to follow up on my previous email about AI & automation opportunities for {{business_name}}.

Many businesses in Hull and Yorkshire are seeing significant cost savings and efficiency improvements through strategic automation.

Would you be interested in a brief 10-minute call to discuss how this might apply to your business?

Best,
[Your Name]
Nuvaru – AI & Automation Specialists`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Following up on AI & Automation for {{business_name}}</h2>
            <p>Hi {{first_name}},</p>
            <p>I wanted to follow up on my previous email about AI & automation opportunities for {{business_name}}.</p>
            <p>Many businesses in Hull and Yorkshire are seeing significant cost savings and efficiency improvements through strategic automation.</p>
            <p>Would you be interested in a brief 10-minute call to discuss how this might apply to your business?</p>
            <p>Best,<br>
            [Your Name]<br>
            <strong>Nuvaru – AI & Automation Specialists</strong></p>
          </div>
        `
      }
    };
  }

  // Replace template variables
  replaceVariables(template, variables) {
    let processedTemplate = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, variables[key] || '');
    });
    return processedTemplate;
  }

  // Send email
  async sendEmail(to, templateName, variables = {}) {
    try {
      // Check if SendGrid is configured
      if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        console.log(`📧 [MOCK] Email would be sent to ${to} with template ${templateName}`);
        return { success: true, messageId: 'mock-' + Date.now(), mock: true };
      }

      const templates = this.getTemplates();
      const template = templates[templateName];
      
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const subject = this.replaceVariables(template.subject, variables);
      const text = this.replaceVariables(template.text, variables);
      const html = this.replaceVariables(template.html, variables);

      const msg = {
        to,
        from: this.fromEmail,
        subject,
        text,
        html
      };

      const result = await sgMail.send(msg);
      console.log(`Email sent successfully to ${to}`);
      return { success: true, messageId: result[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // Send cold outreach email
  async sendColdOutreach(business) {
    const variables = {
      business_name: business.name,
      first_name: business.name.split(' ')[0], // Extract first name
      location: business.location || 'Hull'
    };

    return await this.sendEmail(business.email, 'cold_outreach', variables);
  }

  // Send follow-up email
  async sendFollowUp(business) {
    const variables = {
      business_name: business.name,
      first_name: business.name.split(' ')[0],
      location: business.location || 'Hull'
    };

    return await this.sendEmail(business.email, 'follow_up', variables);
  }

  // Validate email address
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new EmailService();
