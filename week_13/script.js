document.addEventListener("DOMContentLoaded", function() {
    const xpInput = document.getElementById("xpInput");
    const wonCompetitionCheckbox = document.getElementById("wonCompetition");
    const calculateButton = document.getElementById("calculateButton");
    const resultsDiv = document.getElementById("results");

    calculateButton.addEventListener("click", function() {
        const xpGained = parseInt(xpInput.value);
        const wonCompetition = wonCompetitionCheckbox.checked;

        const thousands = Math.floor(xpGained / 1000);
        const hundredThousands = Math.floor(xpGained / 100000);

        let karams = thousands + 100 * hundredThousands;
        if (wonCompetition) {
            karams += 1000; // Add 1000 only if the checkbox is checked
        }
        const cBalls = 10 * karams;

        const resultText = `You would receive ${karams} karambwans and ${cBalls} cannon balls!`;
        resultsDiv.textContent = resultText;
    });

    // Clear results and input fields
    function clearResults() {
        resultsDiv.textContent = "";
    }

    // Clear results when input is changed
    xpInput.addEventListener("input", clearResults);
    wonCompetitionCheckbox.addEventListener("change", clearResults);
});
