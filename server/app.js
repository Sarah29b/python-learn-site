const express = require('express');
const cors = require('cors'); // permet au backend d’accepter les requêtes
// provenant d’un autre domaine (comme frontend)
const path = require('path');
require('dotenv').config(); //On charge les variables d’environnement
// stockées dans un fichier .env (ex : le port, l’URL de la base de données).

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

const authRoutes = require('./routes/auth'); //On importe les routes d’authentification 
//(register/login), définies dans le fichier routes/auth.js.
app.use('/auth', authRoutes); //On connecte le routeur authRoutes au chemin /auth.

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT =  3000; //On récupère le port à utiliser à partir du fichier .env.
//S’il n’est pas défini, on utilise 3000 par défaut.


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
