const pool = require('../db');

// Get rooms by hostel id
const getRoomsByHostel = async (hostelId) => {
  const result = await pool.query('SELECT * FROM rooms WHERE hostel_id = $1', [hostelId]);
  return result.rows;
};

// Get a specific room by id
const getRoomById = async (roomId) => {
  const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
  return result.rows[0];
};

module.exports = { getRoomsByHostel, getRoomById };
