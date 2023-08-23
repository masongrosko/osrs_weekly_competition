// Static values
const teleTabImage = "Teleport_to_house_%28tablet%29_detail.png";
const dragonBoneImage = "Dragon_bones_detail.png";
const sandImage = "Bucket_of_sand_detail.png";
const dragonScaleImage = "Blue_dragon_scale_detail.png";

const competitionNumbers = [29259, 29260, 29261, 29262, 29263];
const maxKc = 400;
let isUpdating = false;

const kcInput = document.getElementById("kcInput");
const calculateButton = document.getElementById("calculateButton");
const resultsDiv = document.getElementById("results");
const participantsTable = document.getElementById("participantsTable");
const reloadTableButton = document.getElementById("reloadTableButton");
const sliders = document.querySelectorAll('.slider');

// Main listener
document.addEventListener("DOMContentLoaded", async function() {
    // replace labels with images
    replaceLabelWithImage("dragonBones", dragonBoneImage);
    replaceLabelWithImage("dragonScales", dragonScaleImage);
    replaceLabelWithImage("bucketsOfSand", sandImage);
    replaceLabelWithImage("teleTabs", teleTabImage);


    sliders.forEach(slider => {
        slider.addEventListener(
            'input',
            () => handleSliderInput(sliders, slider)
        );
    });

    // Format input value with commas while typing
    kcInput.addEventListener("input", function() {
        kcInput.value = formatNumberWithCommas(
            sanitizeInput(
                Math.min(maxKc, parseInt(sanitizeInput(kcInput.value))).toString()
            )
        );
    });

    // Create calculation when calculate button clicked
    calculateButton.addEventListener("click", async function() {
        resultsDiv.innerHTML = "";

        const totalKc = parseInt(sanitizeInput(kcInput.value)); // Convert to int
        if (totalKc !== totalKc) {
            return;
        }
        console.log("Total KC: ", totalKc);

        const dbones = formatNumberWithCommas(calculateDragonBones(totalKc));
        const scales = formatNumberWithCommas(calculateScales(totalKc));
        const sand = formatNumberWithCommas(calculateSand(totalKc));
        const tabs = formatNumberWithCommas(calculateTabs(totalKc));

        const resultTable = createTableFromListOfTuples(
            [
                [formatOsrsWikiImage(dragonBoneImage), dbones],
                [formatOsrsWikiImage(dragonScaleImage), scales],
                [formatOsrsWikiImage(sandImage), sand],
                [formatOsrsWikiImage(teleTabImage), tabs]
            ]
        )
        resultsDiv.appendChild(resultTable);
    });

    // Populate table from wiseoldman
    const kcTable = await getKcTotalsFromWiseOldMan(competitionNumbers);
    participantsTable.appendChild(kcTable);

    // Reload table on request
    reloadTableButton.addEventListener("click", async function() {
        participantsTable.innerHTML = "";  // Clear previous table
        const updatedKcTable  = await getKcTotalsFromWiseOldMan(competitionNumbers);
        participantsTable.appendChild(updatedKcTable );
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

async function getKcTotalsFromWiseOldMan(competitionNumbers) {
    const competitionKcTotal = {};

    for (const competitionNumber of competitionNumbers) {
        const data = await fetchWiseOldManAPI(`/competitions/${competitionNumber}`);
        const participants = data.participations;

        participants.forEach(participant => {
            const participantName = participant.player.displayName;
            const kcGained = participant.progress.gained;

            if (!competitionKcTotal[participantName]) {
                competitionKcTotal[participantName] = 0;
            }

            competitionKcTotal[participantName] += kcGained;
        });
    }

    console.log("competitionKcTotal:", competitionKcTotal);

    const resultTable = document.createElement('table');
    resultTable.classList.add("table");
    resultTable.innerHTML = `
        <tr>
            <th>Participant</th>
            <th>Total KC Gained</th>
        </tr>
    `;

    for (const [participantName, totalKcGained] of Object.entries(competitionKcTotal)) {
        resultTable.innerHTML += `
            <tr>
                <td>${participantName}</td>
                <td>${formatNumberWithCommas(totalKcGained)}</td>
            </tr>
        `;
    }
    return resultTable;
}

// Update sliders
function handleSliderInput(allSliders, currentSlider) {
    if (isUpdating) {
        return;
    }
    const totalValue = Array.from(allSliders).reduce(
        (total, s) => total + parseFloat(s.value),
        0
    );

    const remainingValue = 100 - totalValue;
    const otherSliders = Array.from(allSliders).filter(slider =>
        slider !== currentSlider &&
        (
            (parseFloat(slider.value) !== 0.0 && remainingValue < 0) ||
            (parseFloat(slider.value) !== 100 && remainingValue > 0)
        )
    );
    console.log("The values of the other sliders are:", otherSliders.map(x => x.value));

    const remainingSlidersCount = otherSliders.length;

    // Update value for other sliders
    otherSliders.forEach((s, i) => {
        let updatedValue = parseFloat(s.value) + remainingValue / remainingSlidersCount;
        console.log(updatedValue)
        updateSliderValueWithoutTriggeringEvent(s, updatedValue);
    });

    // Update value displays for all sliders
    allSliders.forEach((s, i) => {
        s.nextElementSibling.textContent = `${parseFloat(s.value).toFixed(1)}%`;
    });
}


function updateSliderValueWithoutTriggeringEvent(slider, newValue) {
    isUpdating = true;
    slider.value = newValue.toString();

    // Trigger input event programmatically
    const inputEvent = new Event('input', { bubbles: true });
    slider.dispatchEvent(inputEvent);

    isUpdating = false;
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


// Calculate kc
function calculateKcFromPercent(totalKc, sliderName, scalar) {
    const slider = document.getElementById(sliderName);
    const percentage = parseFloat(slider.value) / 100;

    return Math.floor(percentage * totalKc * scalar);
}


// Function to calculate sand
function calculateSand(totalKc) {
    return calculateKcFromPercent(totalKc, "bucketsOfSand", 51.5);
}


// Function to calculate scales
function calculateScales(totalKc) {
    return calculateKcFromPercent(totalKc, "dragonScales", 86.0);
}


// Function to dragon bones
function calculateDragonBones(totalKc) {
    return calculateKcFromPercent(totalKc, "dragonBones", 2.0);
}


// Function to tele tabs
function calculateTabs(totalKc) {
    return calculateKcFromPercent(totalKc, "teleTabs", 21.0);
}


function replaceLabelWithImage(label, imagePng) {
    // Find the label element
    const htmlLabel = document.querySelector(`label[for="${label}"]`);

    // Create an image element
    const image = document.createElement('img');
    image.src = osrsWikiImgSrc(imagePng); // Replace with the actual image path
    image.alt = label;
    image.style = "height: 1.5em; vertical-align: middle;";

    // Replace the label with the image
    htmlLabel.textContent = ''; // Clear label's text content
    htmlLabel.appendChild(image);
}