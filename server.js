const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'catataja-secret',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false }
}));

// Import Routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const debtRoutes = require('./routes/debts');
const paymentRoutes = require('./routes/payments');
const productRoutes = require('./routes/products');


// Pakai Routes
app.use('/', authRoutes);
app.use('/customers', customerRoutes);
app.use('/debts', debtRoutes);
app.use('/payments', paymentRoutes);
app.use('/products', productRoutes);

// Halaman Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  // Gunakan path.join agar terbaca benar di server Linux Vercel
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/user', (req, res) => {
  res.json({ nama: req.session.user ? req.session.user.nama : null });
});

app.listen(3000, () => console.log('Server Gacor di http://localhost:3000'));