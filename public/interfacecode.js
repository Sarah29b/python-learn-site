$(document).ready(function () {
    const codeElement = $(".codemirror-textarea")[0];
    const editor = CodeMirror.fromTextArea(codeElement, {
        mode: "python",
        lineNumbers: true,
        theme: "default",
        indentUnit: 4,
        tabSize: 4
    });

    const input = document.getElementById("input");
    const output = document.getElementById("output");
    const run = document.getElementById("run");
    const check = document.getElementById("check");
    const solution = document.getElementById("solution");

    let attemptCount = 0;
    const expectedOutput = "Hello world!\n"; // À personnaliser

    editor.setSize("100%", "500px");

    // Run code
    run.addEventListener("click", async function () {
        const codeToSend = {
            language: "python3",
            version: "3.10.0",
            files: [{ name: "main.py", content: editor.getValue() }],
            stdin: input.value
        };

        try {
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(codeToSend)
            });

            const result = await response.json();
            if (result.run && result.run.stdout) {
                output.value = result.run.stdout;
            } else if (result.run && result.run.stderr) {
                output.value = result.run.stderr;
            } else {
                output.value = "No output.";
            }
        } catch (error) {
            console.error("Execution error:", error);
            output.value = "Execution error.";
        }
    });

    // Check answer
    check.addEventListener("click", function () {
        attemptCount++;
        if (output.value.trim() === expectedOutput.trim()) {
            alert("✅ Correct answer! Well done!");
            attemptCount = 0;
            solution.style.display = "none";
        } else {
            alert(`❌ Incorrect. Attempt ${attemptCount}/5`);
        }

        if (attemptCount >= 5) {
            solution.style.display = "inline-block";
        }
    });

    // Show solution modal
    solution.addEventListener("click", function () {
        document.getElementById("solutionText").textContent = expectedOutput;
        const modal = new bootstrap.Modal(document.getElementById('solutionModal'));
        modal.show();
    });
});
