const bcrypt = require('bcrypt');
const pool = require('../db/db');

// 🔐 Inscription
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING username, email',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'Inscription réussie', user: newUser.rows[0] });

  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// 🔑 Connexion
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'username not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: 'password incorrect.' });
    }

    res.status(200).json({
      message: 'Connexion réussie',
      user: {
        username: user.rows[0].username,
        email: user.rows[0].email
      }
    });

  } catch (err) {
    console.error('Erreur lors de la connexion :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ✅ Export
module.exports = { registerUser, loginUser };
