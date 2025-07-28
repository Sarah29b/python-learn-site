const express = require('express');
const router = express.Router();
const pool = require('../db/db');

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const result = await pool.query('SELECT * FROM exo WHERE id = $1', [id]);
  res.json(result.rows[0]);
});


module.exports = router;
