const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./db/db');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Déclaration du dossier public
const publicPath = path.join(process.cwd(), 'public');
console.log('Public path:', publicPath);

app.use(express.static(publicPath));

// Page d'accueil
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: publicPath });
});

// Page de code
app.get('/interfaceCode.html', (req, res) => {
  res.sendFile('interfaceCode.html', { root: publicPath });
});

// Auth & exercices
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const exercisesRoutes = require('./routes/exercises');
app.use('/api/exo', exercisesRoutes);

//  Nouvelle route pour récupérer la correction
app.get('/api/exercises/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT correction FROM exercises WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching correction:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// enregistrer prgress
app.post('/api/progress', async (req, res) => {
  try {
    const { user_id, exercise_id, status } = req.body;

    const existing = await pool.query(
      'SELECT * FROM completed_exercises WHERE user_id = $1 AND exercise_id = $2',
      [user_id, exercise_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE completed_exercises 
         SET status = $1, 
             completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END 
         WHERE user_id = $2 AND exercise_id = $3`,
        [status, user_id, exercise_id]
      );
    } else {
      await pool.query(
        `INSERT INTO completed_exercises (user_id, exercise_id, status, completed_at) 
         VALUES ($1, $2, $3, CASE WHEN $3 = 'completed' THEN NOW() ELSE NULL END)`,
        [user_id, exercise_id, status]
      );
    }

    res.status(200).json({ message: 'Progress saved successfully' });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT exercise_id, status 
       FROM completed_exercises 
       WHERE user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Port Railway
const PORT =  3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
