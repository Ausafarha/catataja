const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const path = require('path'); // WAJIB TAMBAHKAN INI

// Halaman Login (Tampilan Utama)
router.get('/', (req, res) => {
    // Mengambil index.html dari folder root
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Halaman Register
router.get('/register', (req, res) => {
    // Karena register.html sudah di luar root
    res.sendFile(path.join(process.cwd(), 'register.html'));
});

// Proses Register
router.post('/register', async (req, res) => {
    try {
        const { nama, email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (nama, email, password) VALUES ($1,$2,$3)', [nama, email, hash]);
        res.redirect('/');
    } catch (error) {
        console.error("Error Register:", error.message);
        res.send("Database belum siap, tapi form register aman!");
    }
});

// Proses Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        
        if (result.rows.length == 0) return res.send('Email tidak ditemukan');
        
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send('Password salah');

        req.session.user = user;
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error Login:", error.message);
        res.send("Database belum siap/konek, tapi sistem login sudah standby!");
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;