document.addEventListener("DOMContentLoaded", function() {
    const xpInput = document.getElementById("xpInput");
    const wonCompetitionCheckbox = document.getElementById("wonCompetition");
    const calculateButton = document.getElementById("calculateButton");
    const resultsDiv = document.getElementById("results");

    // Format number with commas for thousands
    function formatNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Format input value with commas while typing
    xpInput.addEventListener("input", function() {
        const currentValue = xpInput.value.replace(/,/g, ''); // Remove existing commas
        const numericValue = currentValue.replace(/[^\d]/g, ''); // Remove non-numeric characters
        const formattedValue = formatNumberWithCommas(numericValue);
        xpInput.value = formattedValue;
    });

    calculateButton.addEventListener("click", function() {
        const xpGained = parseInt(xpInput.value.replace(/,/g, '')); // Remove commas for calculation
        const wonCompetition = wonCompetitionCheckbox.checked;

        const thousands = Math.floor(xpGained / 1000);
        const hundredThousands = Math.floor(xpGained / 100000);

        let karams = thousands + 100 * hundredThousands;
        if (wonCompetition) {
            karams += 1000; // Add 1000 only if the checkbox is checked
        }
        const cBalls = 10 * karams;

        const formattedXP = formatNumberWithCommas(xpGained);
        const karambwanImage = '<img src="https://oldschool.runescape.wiki/images/thumb/Cooked_karambwan_detail.png/1024px-Cooked_karambwan_detail.png?43b37" alt="Karambwan Image" style="height: 2em; vertical-align: middle;">';
        const cannonballImage = '<img src="https://oldschool.runescape.wiki/images/thumb/Cannonball_detail.png/1024px-Cannonball_detail.png?cbad8" alt="Cannonball Image" style="height: 2em; vertical-align: middle;">';
        const resultText = `<br>${karambwanImage} ${formatNumberWithCommas(karams)} karambwans<br>${cannonballImage} ${formatNumberWithCommas(cBalls)} cannon balls`;
        resultsDiv.innerHTML = resultText;
    });

    // Clear results and input fields
    function clearResults() {
        resultsDiv.innerHTML = "";
    }

    // Clear results when input is changed
    xpInput.addEventListener("input", clearResults);
    wonCompetitionCheckbox.addEventListener("change", clearResults);
});
