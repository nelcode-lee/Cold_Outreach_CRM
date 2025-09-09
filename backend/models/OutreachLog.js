const pool = require('../database/connection');

class OutreachLog {
  static async create(logData) {
    const { business_id, email_sent = false, phone_called = false, notes, template_used } = logData;
    const result = await pool.query(
      `INSERT INTO outreach_logs (business_id, email_sent, phone_called, notes, template_used)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [business_id, email_sent, phone_called, notes, template_used]
    );
    return result.rows[0];
  }

  static async findByBusinessId(businessId) {
    const result = await pool.query(
      'SELECT * FROM outreach_logs WHERE business_id = $1 ORDER BY sent_at DESC',
      [businessId]
    );
    return result.rows;
  }

  static async findAll(filters = {}) {
    const { limit = 50, offset = 0, email_sent, phone_called, business_id } = filters;
    let query = 'SELECT ol.*, b.name as business_name FROM outreach_logs ol JOIN businesses b ON ol.business_id = b.id WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (email_sent !== undefined) {
      paramCount++;
      query += ` AND ol.email_sent = $${paramCount}`;
      params.push(email_sent);
    }

    if (phone_called !== undefined) {
      paramCount++;
      query += ` AND ol.phone_called = $${paramCount}`;
      params.push(phone_called);
    }

    if (business_id !== undefined) {
      paramCount++;
      query += ` AND ol.business_id = $${paramCount}`;
      params.push(business_id);
    }

    query += ` ORDER BY ol.sent_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async updateResponseReceived(id, responseReceived = true) {
    const result = await pool.query(
      'UPDATE outreach_logs SET response_received = $1 WHERE id = $2 RETURNING *',
      [responseReceived, id]
    );
    return result.rows[0];
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        DATE(sent_at) as date,
        COUNT(*) as total_outreach,
        COUNT(CASE WHEN email_sent = true THEN 1 END) as emails_sent,
        COUNT(CASE WHEN phone_called = true THEN 1 END) as calls_made,
        COUNT(CASE WHEN response_received = true THEN 1 END) as responses_received
      FROM outreach_logs 
      WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(sent_at)
      ORDER BY date DESC
    `);
    return result.rows;
  }
}

module.exports = OutreachLog;
