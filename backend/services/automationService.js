const { Queue, Worker } = require('bullmq');
const Business = require('../models/Business');
const OutreachLog = require('../models/OutreachLog');
const emailService = require('./emailService');

class AutomationService {
  constructor() {
    this.outreachQueue = new Queue('outreach', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      }
    });

    this.setupWorker();
  }

  setupWorker() {
    this.worker = new Worker('outreach', async (job) => {
      const { businessId, type } = job.data;
      
      try {
        const business = await Business.findById(businessId);
        if (!business) {
          throw new Error(`Business with ID ${businessId} not found`);
        }

        if (!business.email) {
          throw new Error(`Business ${business.name} has no email address`);
        }

        let emailResult;
        let templateUsed;

        switch (type) {
          case 'cold_outreach':
            emailResult = await emailService.sendColdOutreach(business);
            templateUsed = 'cold_outreach';
            break;
          case 'follow_up':
            emailResult = await emailService.sendFollowUp(business);
            templateUsed = 'follow_up';
            break;
          default:
            throw new Error(`Unknown outreach type: ${type}`);
        }

        // Log the outreach
        const outreachLog = await OutreachLog.create({
          business_id: businessId,
          email_sent: true,
          template_used: templateUsed,
          notes: `Automated ${type} email sent`
        });

        // Update business last contacted
        await Business.updateLastContacted(businessId);

        console.log(`Automated ${type} sent to ${business.name} (${business.email})`);
        
        return {
          success: true,
          businessId,
          outreachLogId: outreachLog.id,
          emailResult
        };
      } catch (error) {
        console.error(`Failed to send ${type} to business ${businessId}:`, error);
        
        // Log the failed attempt
        await OutreachLog.create({
          business_id: businessId,
          email_sent: false,
          notes: `Failed to send ${type}: ${error.message}`
        });

        throw error;
      }
    }, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      }
    });

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err);
    });
  }

  // Queue cold outreach for a specific business
  async queueColdOutreach(businessId, delay = 0) {
    const job = await this.outreachQueue.add('cold_outreach', {
      businessId,
      type: 'cold_outreach'
    }, {
      delay: delay * 1000, // Convert seconds to milliseconds
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    return job;
  }

  // Queue follow-up for a specific business
  async queueFollowUp(businessId, delay = 0) {
    const job = await this.outreachQueue.add('follow_up', {
      businessId,
      type: 'follow_up'
    }, {
      delay: delay * 1000,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    return job;
  }

  // Queue cold outreach for all uncontacted businesses
  async queueBulkColdOutreach(limit = 10, delayBetweenEmails = 60) {
    const uncontactedBusinesses = await Business.getUncontacted(limit);
    
    const jobs = [];
    for (let i = 0; i < uncontactedBusinesses.length; i++) {
      const business = uncontactedBusinesses[i];
      const delay = i * delayBetweenEmails; // Stagger emails
      
      const job = await this.queueColdOutreach(business.id, delay);
      jobs.push({
        businessId: business.id,
        businessName: business.name,
        jobId: job.id,
        delay
      });
    }

    return jobs;
  }

  // Get queue statistics
  async getQueueStats() {
    const waiting = await this.outreachQueue.getWaiting();
    const active = await this.outreachQueue.getActive();
    const completed = await this.outreachQueue.getCompleted();
    const failed = await this.outreachQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length
    };
  }

  // Pause the queue
  async pauseQueue() {
    await this.outreachQueue.pause();
    console.log('Outreach queue paused');
  }

  // Resume the queue
  async resumeQueue() {
    await this.outreachQueue.resume();
    console.log('Outreach queue resumed');
  }

  // Clear all jobs
  async clearQueue() {
    await this.outreachQueue.obliterate({ force: true });
    console.log('Outreach queue cleared');
  }
}

module.exports = new AutomationService();
