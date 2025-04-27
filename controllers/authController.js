const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1) hash the password
    const hashed = await bcrypt.hash(password, 10);

    // 2) insert the user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id, name, email, role`,
      [name, email, hashed]
    );

    const user = result.rows[0];

    // 3) sign a token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4) return exactly one JSON payload
    return res.status(201).json({
      message: 'User registered',
      token,
      user
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.registerAdmin = async (req, res) => {
  const { name, email, password, code } = req.body;
  if (code !== process.env.ADMIN_REG_CODE) {
    return res.status(403).json({ error: 'Invalid admin code' });
  }
  // hash & insert exactly like student, but role = 'admin'
  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name,email,password,role)
     VALUES($1,$2,$3,'admin') RETURNING id,name,email,role`,
    [name,email,hashed]
  );
  // sign token, return user + token just like login
  const user = result.rows[0];
  const token = jwt.sign({ id:user.id,role:user.role }, process.env.JWT_SECRET);
  res.status(201).json({ message:'Admin created', token, user });
};

