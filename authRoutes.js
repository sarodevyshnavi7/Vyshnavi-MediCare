const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || password.length < 8)
    return res.status(400).json({ message: 'Enter your name, email and a password of at least 8 characters.' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.promise().execute(
      'INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)',
      [name.trim(), email.toLowerCase().trim(), hash, phone || null, 'customer']);
    req.session.user = { user_id: result.insertId, name, email, role: 'customer' };
    res.json({ message: 'Account created.', user: req.session.user });
  } catch (e) {
    res.status(e.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: e.code === 'ER_DUP_ENTRY' ? 'Email already registered.' : 'Registration failed.' });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.promise().execute('SELECT * FROM users WHERE email=?', [(email || '').toLowerCase().trim()]);
    if (!rows.length || !(await bcrypt.compare(password || '', rows[0].password)))
      return res.status(401).json({ message: 'Invalid email or password.' });
    const u = rows[0];
    req.session.user = { user_id: u.user_id, name: u.name, email: u.email, role: u.role };
    res.json({ user: req.session.user, redirect: u.role === 'admin' ? '/admin-dashboard.html' : '/index.html' });
  } catch (e) { res.status(500).json({ message: 'Unable to sign in.' }); }
});
router.post('/logout', (req,res) => req.session.destroy(() => res.json({ message: 'Logged out.' })));
router.get('/me', (req,res) => res.json({ user: req.session.user || null }));
module.exports = router;
