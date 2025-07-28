$(document).ready(function () {
    const codeElement = $(".codemirror-textarea")[0];
    const editor = CodeMirror.fromTextArea(codeElement, {
        mode: "python",
        lineNumbers: true,
        theme: "default",
        indentUnit: 4,
        tabSize: 4
    });

    const width = window.innerWidth;
    const input = document.getElementById("input");
    const output = document.getElementById("output");
    const run = document.getElementById("run");

    editor.setSize(0.7 * width, "500");

    run.addEventListener("click", async function () {
        const codeToSend = {
            language: "python3",
            version: "3.10.0",
            files: [
                {
                    name: "main.py",
                    content: editor.getValue()
                }
            ],
            stdin: input.value
        };

        try {
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(codeToSend)
            });

            const result = await response.json();
            console.log("Résultat brut :", result);

            if (result.run && result.run.stdout) {
                output.value = result.run.stdout;
            } else if (result.run && result.run.stderr) {
                output.value = result.run.stderr;
            } else {
                output.value = "Aucune sortie.";
            }

        } catch (error) {
            console.error("Erreur de requête :", error);
            output.value = "Erreur lors de l'exécution.";
        }
    });
});
