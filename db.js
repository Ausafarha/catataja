const { Pool } = require('pg');

// Cek apakah ada DATABASE_URL (untuk Vercel/Railway) 
// Jika tidak ada, pakai settingan localhost kamu
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'Pengarasan123',
      database: 'catataja'
    };

const pool = new Pool(poolConfig);

// Tambahkan ini biar kalau DB mati, server kamu gak ikutan tewas
pool.on('error', (err) => {
  console.error('Database Error:', err.message);
});

module.exports = pool;