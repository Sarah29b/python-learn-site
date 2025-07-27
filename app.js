const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyP = require("body-parser");
const options = { stats: true };
compiler.init(options);
require('dotenv').config();

const app = express(); // ✅ Doit être déclaré AVANT tout app.use

app.use(cors());
app.use(bodyP.json());
app.use(express.json());

// ✅ Comme `public` est à la racine :
const publicPath = path.join(process.cwd(), 'public');
console.log('Public path:', publicPath);  // DEBUG Railway

app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: publicPath });
});

app.get('/interfaceCode.html', (req, res) => {
  res.sendFile('interfaceCode.html', { root: publicPath });
});

app.post('/compile', (req, res) => {
  const code = req.body.code;
  const input = req.body.input;
  const envData = { OS: 'windows' };

  try {
    if (!input) {
      compiler.compilePython(envData, code, function (data) {
        res.send(data.output ? data : { output: 'error' });
      });
    } else {
      compiler.compilePythonWithInput(envData, code, input, function (data) {
        res.send(data.output ? data : { output: 'error' });
      });
    }
  } catch (e) {
    console.error('Compilation error:', e);
    res.status(500).send({ output: 'internal error' });
  }
});

// ✅ Routes principales
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const exercisesRoutes = require('./routes/exercises');
app.use('/api/exercises', exercisesRoutes);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
