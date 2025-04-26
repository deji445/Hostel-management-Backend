const pool = require('../db');
// GET /api/rooms/available
exports.getAvailableRooms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.room_number,
        r.capacity,
        r.occupancy,
        r.description,
        r.photo,
        h.name AS hostel_name
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.occupancy < r.capacity
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


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
  const { room_number, capacity } = req.body;
  // 1. get current occupancy
  const { rows: [existing] } = await pool.query(
    'SELECT occupancy FROM rooms WHERE id = $1',
    [req.params.id]
  );
  const occupancy = existing.occupancy;
  // 2. decide status
  const status = capacity <= occupancy ? 'full' : 'available';
  // 3. update
  const { rows: [updated] } = await pool.query(
    `UPDATE rooms
       SET room_number = $1,
           capacity    = $2,
           status      = $3
     WHERE id = $4
     RETURNING *`,
    [room_number, capacity, status, req.params.id]
  );
  res.json(updated);
};

// GET /api/rooms
exports.getAllRoomsAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.hostel_id, r.room_number, r.capacity, r.occupancy,
             r.photo, r.status, r.description,
             h.name AS hostel_name
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      ORDER BY r.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin only: delete a room
exports.deleteRoom = async (req, res) => {
  try {
    await pool.query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
    res.status(204).send();       // no content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAllRooms = exports.getAvailableRooms;