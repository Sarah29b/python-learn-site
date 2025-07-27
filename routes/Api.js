const express = require("express");
const app = express();
const bodyP = require("body-parser");
const compiler = require("compilex");
const path = require("path");

const options = { stats: true };
compiler.init(options);

app.use(bodyP.json());

// ✅ Déclaration du chemin vers le dossier public
const publicPath = path.join(process.cwd(), 'public');
const codemirrorPath = path.join(process.cwd(), 'codemirror-5.65.19');

// ✅ Fichiers statiques
app.use('/codemirror', express.static(codemirrorPath));
app.use(express.static(publicPath));

// ✅ Route d'accueil
app.get("/", function(req, res){
    compiler.flush(() => console.log("deleted"));
    res.sendFile("interfaceCode.html", { root: publicPath });
});

// ✅ Route de compilation
app.post("/compile", function(req, res){
    const code = req.body.code;
    const input = req.body.input;
    const lang = req.body.lang;

    try {
        const envData = { OS: "windows" };

        if (!input) {
            compiler.compilePython(envData, code, function(data) {
                res.send(data.output ? data : { output: "error" });
            });
        } else {
            compiler.compilePythonWithInput(envData, code, input, function(data) {
                res.send(data.output ? data : { output: "error" });
            });
        }
    } catch (e) {
        console.log("Compilation error:", e);
        res.status(500).send({ output: "internal error" });
    }
});

// ✅ Lancement du serveur
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
