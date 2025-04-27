const pool = require('../db');

// GET /api/hostels
exports.getAllHostels = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hostels ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/hostels
exports.addHostel = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO hostels (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/hostels/:id
exports.updateHostel = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE hostels SET name=$1, description=$2 WHERE id=$3 RETURNING *',
      [name, description, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/hostels/:id
exports.deleteHostel = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM hostels WHERE id=$1 RETURNING id',
      [id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
