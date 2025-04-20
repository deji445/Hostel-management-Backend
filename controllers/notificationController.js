const pool = require('../db');

// GET /api/notifications (For the logged-in student)
exports.getNotifications = async (req, res) => {
  const userId = req.user.id; // Assuming you're using JWT to get user ID

  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/notifications/read/:id (Mark notification as read)
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
