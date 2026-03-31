const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ini akan diisi di Railway nanti
  ssl: {
    rejectUnauthorized: false // Wajib untuk koneksi ke database cloud
  }
});

module.exports = pool;