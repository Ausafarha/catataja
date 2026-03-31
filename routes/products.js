const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(process.cwd() + '/public/products.html');
});

router.get('/api', async (req, res) => {
  const result = await pool.query('SELECT * FROM products WHERE user_id=$1', [req.session.user.id]);
  res.json(result.rows);
});

router.post('/api', async (req, res) => {
  const { nama_produk, harga } = req.body;
  await pool.query('INSERT INTO products (user_id, nama_produk, harga) VALUES ($1,$2,$3)', [req.session.user.id, nama_produk, harga]);
  res.sendStatus(200);
});

module.exports = router;