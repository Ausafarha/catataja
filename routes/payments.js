const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.sendFile(process.cwd() + '/public/payments.html');
});

router.get('/api', async (req, res) => {
    const result = await pool.query(`
        SELECT p.*, c.nama as nama_pelanggan FROM payments p
        JOIN orders o ON p.order_id = o.id 
        JOIN customers c ON o.customer_id = c.id
        WHERE o.user_id = $1 ORDER BY p.id DESC`, [req.session.user.id]);
    res.json(result.rows);
});

router.post('/api', async (req, res) => {
    const { order_id, jumlah } = req.body;
    const tanggal = new Date().toISOString().split('T')[0];
    const orderRes = await pool.query('SELECT sisa, dibayar FROM orders WHERE id = $1', [order_id]);
    
    const sisaBaru = orderRes.rows[0].sisa - parseInt(jumlah);
    const totalDibayarBaru = orderRes.rows[0].dibayar + parseInt(jumlah);

    await pool.query('INSERT INTO payments (order_id, jumlah, tanggal) VALUES ($1, $2, $3)', [order_id, jumlah, tanggal]);
    await pool.query(`UPDATE orders SET dibayar = $1, sisa = $2, status = $3 WHERE id = $4`, [totalDibayarBaru, sisaBaru, sisaBaru <= 0 ? 'Lunas' : 'Belum Lunas', order_id]);
    res.sendStatus(200);
});

router.delete('/api/:id', async (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    const { id } = req.params;

    try {
        // 1. Ambil info pembayaran sebelum dihapus untuk mengembalikan saldo 'sisa' di tabel orders
        const payRes = await pool.query('SELECT order_id, jumlah FROM payments WHERE id = $1', [id]);
        if (payRes.rows.length > 0) {
            const { order_id, jumlah } = payRes.rows[0];
            
            // 2. Update balik tabel orders (tambah sisa, kurangi dibayar)
            await pool.query(
                `UPDATE orders SET sisa = sisa + $1, dibayar = dibayar - $1, status = 'Belum Lunas' WHERE id = $2`,
                [jumlah, order_id]
            );
        }

        // 3. Hapus data pembayaran
        await pool.query('DELETE FROM payments WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal hapus pembayaran");
    }
});

module.exports = router;