const express = require('express');
const cors = require('cors'); // permet au backend d’accepter les requêtes
// provenant d’un autre domaine (comme frontend)
require('dotenv').config(); //On charge les variables d’environnement
// stockées dans un fichier .env (ex : le port, l’URL de la base de données).

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth'); //On importe les routes d’authentification 
//(register/login), définies dans le fichier routes/auth.js.
app.use('/auth', authRoutes); //On connecte le routeur authRoutes au chemin /auth.

const PORT = process.env.PORT || 3000; //On récupère le port à utiliser à partir du fichier .env.
//S’il n’est pas défini, on utilise 3000 par défaut.

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
