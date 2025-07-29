const express = require('express');
const path = require('path');
const cors = require('cors');

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

// Port Railway
const PORT =  3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
