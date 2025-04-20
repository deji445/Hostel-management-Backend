const pool = require('../db');

// GET /api/rooms
exports.getAllRooms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id, 
        r.room_number, 
        r.capacity, 
        r.occupancy,
        r.description, 
        r.photo, 
        r.status,
        h.name AS hostel_name
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.status = 'available'
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/rooms (Admin only)
// POST /api/rooms (Admin only)
exports.addRoom = async (req, res) => {
  const { hostel_id, room_number, capacity, photo, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rooms (hostel_id, room_number, capacity, occupancy, photo, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [hostel_id, room_number, capacity, 0, photo, description] // Set occupancy to 0 by default
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PUT /api/rooms/:id (Admin only)
exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { room_number, capacity, photo, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE rooms SET room_number=$1, capacity=$2, photo=$3, description=$4 WHERE id=$5 RETURNING *',
      [room_number, capacity, photo, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

