require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then((client) => {
    console.log("✅ Connecté à PostgreSQL !");
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log("🕐 Heure du serveur :", res.rows[0]);
    return pool.end();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion :", err.message);
  });
