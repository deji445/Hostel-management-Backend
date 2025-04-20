const express = require('express');
const router = express.Router();
const pool = require('../db');

// Test DB connection route
router.get('/test-db', async (req, res) => {
  try {
    // Simple query to check connection
    const result = await pool.query('SELECT NOW()'); // This gets the current timestamp from the database
    res.json({ message: 'Database connected successfully!', time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ message: 'Database connection failed!', error: err.message });
  }
});

module.exports = router;
