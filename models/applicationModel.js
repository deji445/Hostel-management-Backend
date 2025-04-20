const pool = require('../db');

// Get all applications for a specific user
const getApplicationsByUser = async (userId) => {
  const result = await pool.query('SELECT * FROM applications WHERE user_id = $1', [userId]);
  return result.rows;
};

// Create a new application
const createApplication = async (userId, roomId, preference) => {
  const result = await pool.query(
    'INSERT INTO applications (user_id, room_id, preference) VALUES ($1, $2, $3) RETURNING *',
    [userId, roomId, preference]
  );
  return result.rows[0];
};

// Update application status (approved/rejected)
const updateApplicationStatus = async (applicationId, status) => {
  const result = await pool.query(
    'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
    [status, applicationId]
  );
  return result.rows[0];
};

module.exports = { getApplicationsByUser, createApplication, updateApplicationStatus };
