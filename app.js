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

// Port Railway
const PORT =  3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
