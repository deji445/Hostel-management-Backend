const pool = require('../db');

// GET /api/rooms
exports.getAllRooms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/rooms (Admin only)
exports.addRoom = async (req, res) => {
  const { hostel_id, room_number, capacity, photo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rooms (hostel_id, room_number, capacity, photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [hostel_id, room_number, capacity, photo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/rooms/:id (Admin only)
exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { room_number, capacity, photo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE rooms SET room_number=$1, capacity=$2, photo=$3 WHERE id=$4 RETURNING *',
      [room_number, capacity, photo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
