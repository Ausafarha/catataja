const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

// Halaman Login
router.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/login.html');
});

// Halaman Register
router.get('/register', (req, res) => {
    res.sendFile(process.cwd() + '/public/register.html');
});

// Proses Register
router.post('/register', async (req, res) => {
    const { nama, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (nama, email, password) VALUES ($1,$2,$3)', [nama, email, hash]);
    res.redirect('/');
});

// Proses Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length == 0) return res.send('Email tidak ditemukan');
    
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send('Password salah');

    req.session.user = user;
    res.redirect('/dashboard');
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;