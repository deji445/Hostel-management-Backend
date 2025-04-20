const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming you're using pg for PostgreSQL
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Create Room
router.post('/', async (req, res) => {
  const { hostel_id, room_number, capacity, status, photo } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO rooms (hostel_id, room_number, capacity, status, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [hostel_id, room_number, capacity, status || 'available', photo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Rooms
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Room by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Room Status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE rooms SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Room
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update room details
router.patch('/:id', protect, async (req, res) => {
  const { status, capacity } = req.body;
  const roomId = req.params.id;

  try {
    const result = await pool.query(
      'UPDATE rooms SET status = $1, capacity = $2 WHERE id = $3 RETURNING *',
      [status, capacity, roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Increase Room Occupancy
router.patch('/:id/occupancy/increase', async (req, res) => {
  const { id } = req.params;

  try {
    // Get current room details
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];

    // Check if occupancy is less than capacity
    if (room.occupancy < room.capacity) {
      // Increase occupancy
      const result = await pool.query(
        'UPDATE rooms SET occupancy = occupancy + 1 WHERE id = $1 RETURNING *',
        [id]
      );
      res.json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'Room is already at full occupancy' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decrease Room Occupancy
router.patch('/:id/occupancy/decrease', async (req, res) => {
  const { id } = req.params;

  try {
    // Get current room details
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];

    // Check if occupancy is greater than 0
    if (room.occupancy > 0) {
      // Decrease occupancy
      const result = await pool.query(
        'UPDATE rooms SET occupancy = occupancy - 1 WHERE id = $1 RETURNING *',
        [id]
      );
      res.json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'No students to check out from this room' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
