const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("✅ Connecté à la base de données PostgreSQL !"))
  .catch((err) => console.error("❌ Erreur de connexion à la base :", err));

module.exports = pool;
