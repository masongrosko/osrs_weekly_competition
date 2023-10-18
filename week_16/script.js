// Comp Numbers
const competitionNumbers = [31463];

// Images
const redChinImage = 'Red_chinchompa_detail.png';
const blackChinImage = 'Black_chinchompa_detail.png';

const sharkImage = 'Shark_detail.png';
const anglerImage = 'Anglerfish_detail.png';

const astralRuneImage = 'Astral_rune_detail.png';
const bloodRuneImage = 'Blood_rune_detail.png';

// Elements from html
const participantsTable = document.getElementById("participantsTable");
const reloadTableButton = document.getElementById("reloadTableButton");

const xpInput = document.getElementById("xpInput");
const calculateButton = document.getElementById("calculateButton");
const resultsDiv = document.getElementById("results");
let isUpdating = false;

// Prize values
const redChinsPer1_000Xp = 1;
const sharksPer1_000Xp = 2;
const astralsPer1_000Xp = 40;

const redChinsPer100_000Xp = 50;
const sharksPer100_000Xp = 100;
const astralsPer100_000Xp = 2000;

const maxXp = 3000000;
const maxBonusXp = 1000000;

const bonusScalar = 1/3;

// Main listener
document.addEventListener("DOMContentLoaded", async function() {
    // Populate table from wiseoldman
    const progressTable = await getProgressTotalsFromWiseOldMan(competitionNumbers);
    participantsTable.appendChild(progressTable);

    // Reload table on request
    reloadTableButton.addEventListener("click", async function() {
        participantsTable.innerHTML = "";  // Clear previous table
        const updatedProgressTable  = await getProgressTotalsFromWiseOldMan(
            competitionNumbers
        );
        participantsTable.appendChild(updatedProgressTable );
    });

    // Format input value with commas while typing
    xpInput.addEventListener("input", function() {
        xpInput.value = formatNumberWithCommas(
            sanitizeInput(
                Math.min(maxXp, parseInt(sanitizeInput(xpInput.value))).toString()
            )
        );
    });

    // Create calculation when calculate button clicked
    calculateButton.addEventListener("click", async function() {
        resultsDiv.innerHTML = "";

        const totalXp = parseInt(sanitizeInput(xpInput.value)); // Convert to int
        if (totalXp !== totalXp) {
            return;
        }
        console.log("Total XP: ", totalXp);

        // Normal table
        const redChins = formatNumberWithCommas(calculateRedChins(totalXp));
        const sharks = formatNumberWithCommas(calculateSharks(totalXp));
        const astrals = formatNumberWithCommas(calculateAstrals(totalXp));

        const resultTable = createTableFromListOfTuples(
            [
                [formatOsrsWikiImage(redChinImage), redChins],
                [formatOsrsWikiImage(sharkImage), sharks],
                [formatOsrsWikiImage(astralRuneImage), astrals],
            ]
        );
        resultsDiv.appendChild(resultTable);

        // Winner bonus table
        const blackChins = formatNumberWithCommas(calculateBlackChins(totalXp));
        const anglers = formatNumberWithCommas(calculateAnglers(totalXp));
        const bloods = formatNumberWithCommas(calculateBloods(totalXp));

        const resultBonusTable = createTableFromListOfTuples(
            [
                [formatOsrsWikiImage(blackChinImage), blackChins],
                [formatOsrsWikiImage(anglerImage), anglers],
                [formatOsrsWikiImage(bloodRuneImage), bloods]
            ]
        );

        // Calculate the total number of columns in the table
        const totalColumns = resultBonusTable.rows[0].cells.length;

        // Create a table row for the header with colspan
        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('th');
        headerCell.textContent = 'Winner Bonus!';
        headerCell.setAttribute('colspan', totalColumns.toString()); // Span all columns
        headerRow.appendChild(headerCell);

        // Insert the header row at the beginning of the table
        resultBonusTable.insertBefore(headerRow, resultBonusTable.firstChild);

        resultsDiv.appendChild(resultBonusTable);

        // Append max xp note
        // Create a paragraph element
        const maxBonusXPParagraph = document.createElement('p');
        maxBonusXPParagraph.innerHTML = (
            `*Max winner bonus xp is ${formatNumberWithCommas(maxBonusXp)}`
        );

        // Append the paragraph element to the resultsDiv
        resultsDiv.appendChild(maxBonusXPParagraph);
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

async function getProgressTotalsFromWiseOldMan(competitionNumbers, progressName="XP") {
    const competitionProgressTotal = {};

    for (const competitionNumber of competitionNumbers) {
        const data = await fetchWiseOldManAPI(`/competitions/${competitionNumber}`);
        const participants = data.participations;

        participants.forEach(participant => {
            const participantName = participant.player.displayName;
            const xpGained = participant.progress.gained;

            if (!competitionProgressTotal[participantName]) {
                competitionProgressTotal[participantName] = 0;
            }

            competitionProgressTotal[participantName] += xpGained;
        });
    }

    console.log("competitionProgressTotal:", competitionProgressTotal);

    const resultTable = document.createElement('table');
    resultTable.classList.add("table");
    resultTable.innerHTML = `
        <tr>
            <th>Participant</th>
            <th>Total ${progressName} Gained</th>
        </tr>
    `;

    for (
        const [participantName, totalProgressGained]
        of Object.entries(competitionProgressTotal)
    ) {
        resultTable.innerHTML += `
            <tr>
                <td>${participantName}</td>
                <td>${formatNumberWithCommas(totalProgressGained)}</td>
            </tr>
        `;
    }
    return resultTable;
}

// Create a table from text
function createTableFromListOfTuples(listOfTuples) {
    const createdTable = document.createElement('table');
    listOfTuples.forEach(rowOfData => {
        const row = createdTable.insertRow();
        rowOfData.forEach(item => {
            const cell = row.insertCell();
            cell.innerHTML = item;
        });
    });

    createdTable.classList.add("table")

    return createdTable;
}

function osrsWikiImgSrc(png) {
    return `https://oldschool.runescape.wiki/images/thumb/${png}/1024px-${png}`
}

// Format image
function formatOsrsWikiImage(imagePath, imageName) {
    const newImage = (
        `<img src="${osrsWikiImgSrc(imagePath)}" alt="${imageName}" `
        + `style="height: 2em; vertical-align: middle;">`
    );

    return newImage;
}

// Get number of thousands and number of hundred thousands
function calculateMilestoneNumbers(totalXp) {
    const thousands = Math.floor(totalXp / 1000);
    const hundredThousands = Math.floor(totalXp / 100000);

    return [thousands, hundredThousands];
}

// Function to calculate resources based on XP milestones
function calculateResources(totalXp, per1_000Xp, per100_000Xp) {
    const [thousands, hundredThousands] = calculateMilestoneNumbers(totalXp);
    return (
        thousands * per1_000Xp +
        hundredThousands * per100_000Xp
    );
}

// Function to calculate red chins
function calculateRedChins(totalXp) {
    return calculateResources(
        Math.min(totalXp, maxXp),
        redChinsPer1_000Xp,
        redChinsPer100_000Xp
    );
}

// Function to calculate black chins
function calculateBlackChins(totalXp) {
    return Math.round(bonusScalar * calculateRedChins(Math.min(totalXp, maxBonusXp)));
}

// Function to calculate sharks
function calculateSharks(totalXp) {
    return calculateResources(
        Math.min(totalXp, maxXp),
        sharksPer1_000Xp,
        sharksPer100_000Xp
    );
}

// Function to calculate anglerfish
function calculateAnglers(totalXp) {
    return Math.round(bonusScalar * calculateSharks(Math.min(totalXp, maxBonusXp)));
}

// Function to calculate astral runes
function calculateAstrals(totalXp) {
    return calculateResources(
        Math.min(totalXp, maxXp),
        astralsPer1_000Xp,
        astralsPer100_000Xp
    );
}

// Function to calculate blood runes
function calculateBloods(totalXp) {
    return Math.round(bonusScalar * calculateAstrals(Math.min(totalXp, maxBonusXp)));
}
