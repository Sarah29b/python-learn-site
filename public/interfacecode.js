$(document).ready(async function () {
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
    let expectedOutput = "";

    const urlParams = new URLSearchParams(window.location.search);
    const exerciseId = urlParams.get("id");

    const currentUsername = localStorage.getItem("username");

    try {
        const res = await fetch(`/api/exercises/${exerciseId}`);
        const data = await res.json();
        expectedOutput = (data.correction || "").trim();
        console.log("Correction loaded:", expectedOutput);
    } catch (err) {
        console.error("Error fetching correction:", err);
    }

    editor.setSize("100%", "500px");

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

    check.addEventListener("click", async function () {
        if (!output.value.trim()) {
            alert("⚠️ Please run your code first before checking!");
            return;
        }

        attemptCount++;
        let status = "in_progress";

        if (output.value.trim() === expectedOutput) {
            alert("✅ Correct answer!");
            attemptCount = 0;
            solution.style.display = "none";
            status = "completed";
        } else {
            alert(`❌ Incorrect. Attempt ${attemptCount}/5`);
        }

        if (attemptCount >= 5) {
            solution.style.display = "inline-block";
        }

        try {
            const res = await fetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUsername,
                    exercise_id: exerciseId,
                    status: status
                })
            });
            const data = await res.json();
            console.log("Progress saved:", data.message);
        } catch (err) {
            console.error("Error saving progress:", err);
        }
    });

    solution.addEventListener("click", function () {
        document.getElementById("solutionText").textContent = expectedOutput;
        const modal = new bootstrap.Modal(document.getElementById('solutionModal'));
        modal.show();
    });
});
