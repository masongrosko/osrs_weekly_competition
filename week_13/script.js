const karambwanImage = '<img src="https://oldschool.runescape.wiki/images/thumb/Cooked_karambwan_detail.png/1024px-Cooked_karambwan_detail.png?43b37" alt="Karambwan Image" style="height: 2em; vertical-align: middle;">';
const cannonballImage = '<img src="https://oldschool.runescape.wiki/images/thumb/Cannonball_detail.png/1024px-Cannonball_detail.png?cbad8" alt="Cannonball Image" style="height: 2em; vertical-align: middle;">';
const competitionNumber = 28879;

document.addEventListener("DOMContentLoaded", function() {
    const xpInput = document.getElementById("xpInput");
    const wonCompetitionCheckbox = document.getElementById("wonCompetition");
    const calculateButton = document.getElementById("calculateButton");
    const resultsDiv = document.getElementById("results");
    const participantsTable = document.getElementById("participantsTable");
    const reloadTableButton = document.getElementById("reloadTableButton");

    // Format input value with commas while typing
    xpInput.addEventListener("input", function() {
        xpInput.value = formatNumberWithCommas(sanitizeInput(xpInput.value));
    });

    // Create calulation when calulate button clicked
    calculateButton.addEventListener("click", function() {
        const xpGained = parseInt(sanitizeInput(xpInput.value)); // Convert to int
        const wonCompetition = wonCompetitionCheckbox.checked;

        const thousands = Math.floor(xpGained / 1000);
        const hundredThousands = Math.floor(xpGained / 100000);

        const karams = calculateKarambwans(xpGained, wonCompetition)
        const cBalls = calculateCannonballs(xpGained, wonCompetition)

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

    // Populate table from wiseoldman
    participantsTable.appendChild(fetchAndUpdateTable(competitionNumber));
    
    // Reload table on request
    reloadTableButton.addEventListener("click", function() {
        participantsTable.innerHTML = "";  // Clear previous table
        participantsTable.appendChild(fetchAndUpdateTable(competitionNumber));
    });
});


// Sanitize input in realtime
function sanitizeInput(inputValue) {
    return (
        inputValue
        .replace(/,/g, '')  // Remove existing commas
        .replace(/[^\d]/g, '')  // Remove non-numeric characters
    );
}


// Format number with commas for thousands
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// Fetch wiseoldman data
function fetchWiseOldManAPI(endpoint) {
    return fetch(`https://api.wiseoldman.net/v2${endpoint}`)
        .then(response => response.json())
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}


// Fetch and update table
function fetchAndUpdateTable(competitionNumber) {
    const endpoint = `/competitions/${competitionNumber}`;
    const table = document.createElement("table");
    fetchWiseOldManAPI(endpoint).then(
        data => {
            const participants = data.participations;

            // Populate the table
            table.classList.add("participants");

            participants.forEach(participant => {
                const row = table.insertRow();
                const nameCell = row.insertCell();
                const xpCell = row.insertCell();
                const karambwansCell = row.insertCell();
                const cannonballsCell = row.insertCell();
                
                const participantName = participant.player.displayName;
                const xpGained = participant.progress.gained;
                const karams = calculateKarambwans(xpGained);
                const cBalls = calculateCannonballs(xpGained);

                nameCell.textContent = participantName;
                xpCell.textContent = formatNumberWithCommas(xpGained);
                karambwansCell.innerHTML = `${karambwanImage} ${formatNumberWithCommas(karams)}`;
                cannonballsCell.innerHTML = `${cannonballImage} ${formatNumberWithCommas(cBalls)}`;

                // Append row to the table
                table.appendChild(row);
            });
        }
    )
    return table;
}

// Function to calculate karambwans
function calculateKarambwans(xpGained, wonCompetition) {
    const thousands = Math.floor(xpGained / 1000);
    const hundredThousands = Math.floor(xpGained / 100000);

    let karams = thousands + 100 * hundredThousands;

    if (wonCompetition) {
        karams += 1000; // Add 1000 only if the checkbox is checked
    }

    return karams;
}

// Function to calculate cannonballs
function calculateCannonballs(xpGained, wonCompetition) {
    const karams = calculateKarambwans(xpGained, wonCompetition);
    const cannonballs = 10 * karams;

    return cannonballs;
}
