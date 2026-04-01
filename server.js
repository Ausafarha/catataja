const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARE DASAR ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- 2. AKSES FILE STATIS (WAJIB PALING ATAS) ---
// Agar manifest.json dan sw.js bisa dibaca browser sebelum login
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Rute eksplisit untuk memastikan file PWA terkirim dengan header yang benar
app.get('/manifest.json', (res) => {
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/sw.js', (res) => {
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// --- 3. KONFIGURASI SESSION ---
app.use(session({
  secret: 'catataja-secret',
  resave: false, // Diubah ke false agar lebih stabil
  saveUninitialized: false, 
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, 
    secure: false // Set true jika sudah pakai SSL/HTTPS murni
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

// --- 5. HALAMAN UTAMA (DENGAN PROTEKSI) ---
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Port menyesuaikan Railway atau lokal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Gacor di port ${PORT}`);
});