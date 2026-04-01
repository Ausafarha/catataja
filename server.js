const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// --- 1. FILE STATIS (WAJIB PALING ATAS) ---
// Agar CSS dan Manifest bisa dibaca browser tanpa login
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// --- 2. MIDDLEWARE PARSER ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- 3. KONFIGURASI SESSION ---
app.use(session({
  secret: 'catataja-secret',
  resave: false, 
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, 
    secure: false 
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

// --- 5. HALAMAN UTAMA (DENGAN PROTEKSI LOGIN) ---
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));