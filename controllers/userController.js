const pool = require('../db');

// GET /api/users/profile
exports.getUserProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id=$1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/assigned-room
exports.getAssignedRoom = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.room_number, r.photo, h.name AS hostel_name 
       FROM applications a 
       JOIN rooms r ON a.room_id = r.id 
       JOIN hostels h ON r.hostel_id = h.id 
       WHERE a.user_id = $1 AND a.status = 'approved'`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'No assigned room yet' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
