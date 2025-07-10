const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// CORRECTION ICI : utiliser chemin absolu correct
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: publicPath });
});

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const PORT =  3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
