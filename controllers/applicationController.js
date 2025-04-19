const pool = require('../db');

// POST /api/applications/apply
exports.applyForRoom = async (req, res) => {
  const { room_id, preference } = req.body;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO applications (user_id, room_id, preference) VALUES ($1, $2, $3) RETURNING *',
      [user_id, room_id, preference]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/applications (Admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT a.*, u.name AS student_name, r.room_number FROM applications a JOIN users u ON a.user_id = u.id JOIN rooms r ON a.room_id = r.id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/applications/status/:id (Admin only)
exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE applications SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
