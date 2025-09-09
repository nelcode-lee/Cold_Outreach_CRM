const pool = require('../database/connection');

class Business {
  static async findAll(filters = {}) {
    const { location, status, search, limit = 50, offset = 0 } = filters;
    let query = 'SELECT * FROM businesses WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (location) {
      paramCount++;
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR website ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM businesses WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(businessData) {
    const { name, location, address, telephone, email, website, source, status = 'New' } = businessData;
    const result = await pool.query(
      `INSERT INTO businesses (name, location, address, telephone, email, website, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, location, address, telephone, email, website, source, status]
    );
    return result.rows[0];
  }

  static async update(id, businessData) {
    const { name, location, address, telephone, email, website, status } = businessData;
    const result = await pool.query(
      `UPDATE businesses 
       SET name = $1, location = $2, address = $3, telephone = $4, 
           email = $5, website = $6, status = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, location, address, telephone, email, website, status, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM businesses WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async updateLastContacted(id) {
    const result = await pool.query(
      'UPDATE businesses SET last_contacted = NOW(), status = $1 WHERE id = $2 RETURNING *',
      ['Contacted', id]
    );
    return result.rows[0];
  }

  static async getUncontacted(limit = 10) {
    const result = await pool.query(
      'SELECT * FROM businesses WHERE last_contacted IS NULL AND status = $1 ORDER BY created_at ASC LIMIT $2',
      ['New', limit]
    );
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM businesses 
      GROUP BY status
      ORDER BY count DESC
    `);
    return result.rows;
  }
}

module.exports = Business;
