const bcrypt = require('bcrypt');
const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
    console.error('Connection error :', err);
    res.status(500).json({ error: 'Error server.' });
  }
};

const RESET_SECRET = process.env.RESET_PASSWORD_SECRET || 'reset-secret';
const CLIENT_URL = 'https://python-learn-site-production.up.railway.app'; 

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email requis.' });

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userId = user.rows[0].id;
    const username = user.rows[0].username;

    const token = jwt.sign({ userId, username }, RESET_SECRET, { expiresIn: '15m' });

    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + interval '15 minutes')`,
      [userId, token]
    );

    const resetLink = `${CLIENT_URL}/reset-password.html?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,  
      auth: {
        user: process.env.MAILTRAP_USER,  
        pass: process.env.MAILTRAP_PASS    
  }
    });

    await transporter.sendMail({
      from: '"PythonLearn" <noreply@pythonlearn.com>',
      to: email,
      subject: 'Reset password',
      html: `
        <p>Hello ${username},</p>
        <p>This is the link to reinitialize your password :</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `
    });

    res.json({ message: 'Email sent with the reinitialization link.' });

  } catch (err) {
    console.error('Error forgotPassword:', err);
    res.status(500).json({ error: 'Error server.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and password required.' });
  }

  try {
    const decoded = jwt.verify(token, RESET_SECRET);
    const userId = decoded.userId;

    const valid = await pool.query(
      `SELECT * FROM password_resets 
       WHERE user_id = $1 AND token = $2 AND expires_at > NOW()`,
      [userId, token]
    );

    if (valid.rows.length === 0) {
      return res.status(400).json({ error: 'Token incorrect or expired.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);

    res.json({ message: 'Password updated.' });
  } catch (err) {
    console.error('Error resetPassword:', err);
    res.status(400).json({ error: 'Token incorrect or expired.' });
  }
  
};

module.exports = { registerUser, loginUser, forgotPassword,resetPassword };