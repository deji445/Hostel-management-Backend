const pool = require('../db');

// Get all hostels
const getAllHostels = async () => {
  const result = await pool.query('SELECT * FROM hostels');
  return result.rows;
};

module.exports = { getAllHostels };
