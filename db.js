const { Pool } = require('pg');

// Tambahkan pengaman agar tidak error kalau URL database kosong
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/dummy",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Tambahkan ini agar jika ada error di pool tidak langsung mematikan server
pool.on('error', (err) => {
  console.error('Database error ignored for now:', err.message);
});

module.exports = pool;