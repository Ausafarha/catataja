const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARE DASAR ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- 2. AKSES FILE STATIS (PINDAH KE SINI) ---
// Gunakan path.join agar Railway tidak bingung mencari folder
app.use(express.static(path.join(__dirname, 'public')));

// Tambahkan rute manual agar browser PASTI bisa baca manifest tanpa login
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// --- 3. KONFIGURASI SESSION ---
app.use(session({
  secret: 'catataja-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, 
    // Secure hanya true jika di produksi (Railway) agar session tidak hilang di lokal
    secure: process.env.NODE_ENV === 'production' 
  }
}));

// --- 4. IMPORT & PAKAI ROUTES ---
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const debtRoutes = require('./routes/debts');
const paymentRoutes = require('./routes/payments');
const productRoutes = require('./routes/products');

app.use('/', authRoutes);
app.use('/customers', customerRoutes);
app.use('/debts', debtRoutes);
app.use('/payments', paymentRoutes);
app.use('/products', productRoutes);

// --- 5. HALAMAN UTAMA ---
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/user', (req, res) => {
  res.json({ nama: req.session.user ? req.session.user.nama : null });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ada yang salah di Server Gacor!');
});

// Railway memberikan port secara dinamis melalui process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Gacor running on port ${PORT}`);
});