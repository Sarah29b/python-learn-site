const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Comme `public` est à la racine :
const publicPath = path.join(process.cwd(), 'public');
console.log('Public path:', publicPath);  // DEBUG Railway

app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: publicPath });
});

// ✅ Plus besoin de `server/` dans le chemin :
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const exercisesRoutes = require('./routes/exercises');
app.use('/api/exercises', exercisesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
