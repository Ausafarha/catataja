const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.sendFile(process.cwd() + '/public/customers.html');
});

router.get('/api', async (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    const result = await pool.query('SELECT * FROM customers WHERE user_id=$1 ORDER BY id DESC', [req.session.user.id]);
    res.json(result.rows);
});

router.post('/api', async (req, res) => {
    const { nama, no_hp, alamat } = req.body;
    await pool.query('INSERT INTO customers (user_id, nama, no_hp, alamat) VALUES ($1,$2,$3,$4)', [req.session.user.id, nama, no_hp, alamat]);
    res.sendStatus(200);
});

router.put('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { nama, no_hp, alamat } = req.body;
    await pool.query('UPDATE customers SET nama=$1, no_hp=$2, alamat=$3 WHERE id=$4 AND user_id=$5', [nama, no_hp, alamat, id, req.session.user.id]);
    res.sendStatus(200);
});

router.delete('/api/:id', async (req, res) => {
    await pool.query('DELETE FROM customers WHERE id=$1', [req.params.id]);
    res.sendStatus(200);
});

module.exports = router;