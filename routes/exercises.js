const express = require('express');
const router = express.Router();
const pool = require('../db/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title FROM exercises ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération exercices :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
