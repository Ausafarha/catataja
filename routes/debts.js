const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. Tampilkan Halaman Hutang
router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(process.cwd() + '/public/debts.html');
});

// 2. API: Ambil Daftar Hutang/Orders
router.get('/api', async (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  try {
    const result = await pool.query(
      `SELECT 
          o.id, o.tanggal, o.total, o.dibayar, o.sisa, o.status,
          COALESCE(c.nama, 'Pelanggan Umum') as customer_nama,
          COALESCE(STRING_AGG(p.nama_produk || ' (' || oi.qty || ')', ', '), 'Detail tidak ada') as detail_pesanan
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id, c.nama
       ORDER BY o.id DESC`,
      [req.session.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal mengambil data hutang");
  }
});

// 3. API: Tambah Transaksi Baru (Auto-create Customer & Product)
router.post('/api', async (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  const { nama_pelanggan, nama_barang, qty, harga, dibayar } = req.body;
  const user_id = req.session.user.id;
  const tanggal = new Date().toISOString().split('T')[0];

  try {
    // Cek/Simpan Pelanggan
    let custRes = await pool.query('SELECT id FROM customers WHERE nama = $1 AND user_id = $2', [nama_pelanggan, user_id]);
    let customer_id = custRes.rows.length === 0 
      ? (await pool.query('INSERT INTO customers (nama, user_id) VALUES ($1, $2) RETURNING id', [nama_pelanggan, user_id])).rows[0].id 
      : custRes.rows[0].id;

    // Cek/Simpan Produk
    let prodRes = await pool.query('SELECT id FROM products WHERE nama_produk = $1 AND user_id = $2', [nama_barang, user_id]);
    let product_id = prodRes.rows.length === 0 
      ? (await pool.query('INSERT INTO products (nama_produk, harga, user_id) VALUES ($1, $2, $3) RETURNING id', [nama_barang, harga, user_id])).rows[0].id 
      : prodRes.rows[0].id;

    const total = qty * harga;
    const sisa = total - dibayar;
    const status = sisa <= 0 ? 'Lunas' : 'Belum Lunas';

    const orderRes = await pool.query(
      `INSERT INTO orders (customer_id, user_id, tanggal, total, dibayar, sisa, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [customer_id, user_id, tanggal, total, dibayar, sisa, status]
    );

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, qty, harga, subtotal) VALUES ($1, $2, $3, $4, $5)`,
      [orderRes.rows[0].id, product_id, qty, harga, total]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal simpan transaksi");
  }
});

// 4. API: Update/Edit Transaksi
router.put('/api/:id', async (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  const { id } = req.params;
  const { total, dibayar } = req.body;
  const sisa = total - dibayar;
  const status = sisa <= 0 ? 'Lunas' : 'Belum Lunas';

  try {
    await pool.query(
      `UPDATE orders SET total = $1, dibayar = $2, sisa = $3, status = $4 
       WHERE id = $5 AND user_id = $6`,
      [total, dibayar, sisa, status, id, req.session.user.id]
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("Gagal update transaksi");
  }
});

// 5. API: Hapus Transaksi
router.delete('/api/:id', async (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    await pool.query('DELETE FROM payments WHERE order_id = $1', [id]);
    await pool.query('DELETE FROM orders WHERE id = $1 AND user_id = $2', [id, req.session.user.id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("Gagal hapus transaksi");
  }
});

module.exports = router;