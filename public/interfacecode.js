$(document).ready(function () {
    // Initialisation de CodeMirror
    const textarea = $(".codemirror-textarea")[0];
    const editor = CodeMirror.fromTextArea(textarea, {
        mode: 'python',
        lineNumbers: true,
        theme: 'default',
        indentUnit: 4,
        tabSize: 4
    });

    // Redimensionne l'éditeur
    const width = window.innerWidth;
    editor.setSize(0.7 * width, "500");

    // Récupération des éléments DOM
    const input = document.getElementById("input");
    const output = document.getElementById("output");
    const run = document.getElementById("run");

    // Bouton Run → appel API Piston
    run.addEventListener("click", async function () {
        const payload = {
            language: "python3",
            source: editor.getValue(),
            stdin: input.value
        };

        try {
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            output.value = result.output || result.stdout || result.stderr || "No output.";
        } catch (err) {
            console.error("Erreur d'exécution :", err);
            output.value = "Erreur lors de l'exécution.";
        }
    });
});
