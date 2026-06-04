// ===============================
// GLOBALS
// ===============================

let childrenData = [];
let secretChild = null;
let selectedChildId = null;

// ===============================
// ELEMENTS
// ===============================

const grid = document.getElementById("characterGrid");
const selectedCharacter = document.getElementById("selectedCharacter");

const parentSelect = document.getElementById("parentSelect");
const traitSelect = document.getElementById("traitSelect");
const valueSelect = document.getElementById("valueSelect");

const askQuestionBtn = document.getElementById("askQuestionBtn");

const questionDisplay = document.getElementById("questionDisplay");
const answerDisplay = document.getElementById("answerDisplay");

const guessBtn = document.getElementById("guessBtn");

const rulesModal = document.getElementById("rulesModal");
const startGameBtn = document.getElementById("startGameBtn");

// ===============================
// TRAIT VALUES
// ===============================

const traitOptions = {
    hair: ["brown", "black", "blond", "ginger"],

    eyes: ["blue", "green", "brown", "grey"],

    faceShape: ["round", "square"],

    nose: ["round", "pointy"],

    glasses: ["yes", "no"],

    freckles: ["yes", "no"]
};

// ===============================
// INITIALIZATION
// ===============================

window.addEventListener("load", () => {

    populateValueDropdown();

    loadData();

});

// ===============================
// MODAL
// ===============================

startGameBtn.addEventListener("click", () => {
    rulesModal.style.display = "none";
});

// ===============================
// LOAD DATA
// ===============================

async function loadData() {

    try {

        const response = await fetch("data.json");

        childrenData = await response.json();

        chooseSecretChild();

        renderGrid();

    }
    catch (error) {

        console.error(error);

        alert("Could not load data.json");

    }

}

// ===============================
// SECRET CHILD
// ===============================

function chooseSecretChild() {

    const randomIndex =
        Math.floor(Math.random() * childrenData.length);

    secretChild = childrenData[randomIndex];

    console.log("Secret Child:", secretChild);

}

// ===============================
// GRID
// ===============================

function renderGrid() {

    grid.innerHTML = "";

    childrenData.forEach(child => {

        const card = document.createElement("div");

        card.classList.add("characterCard");

        card.dataset.id = child.id;

        card.innerHTML = `
            <img
                class="characterImage"
                src="images/${child.image}"
                alt="Child ${child.id}"
                onerror="this.src='images/placeholder.png'"
            >

            <div class="characterLabel">
                Child ${child.id}
            </div>
        `;

        card.addEventListener("click", () => {
            selectCard(child.id);
        });

        card.addEventListener("contextmenu", (e) => {

            e.preventDefault();

            card.classList.toggle("eliminated");

        });

        grid.appendChild(card);

    });

}

// ===============================
// CARD SELECTION
// ===============================

function selectCard(id) {

    selectedChildId = id;

    document
        .querySelectorAll(".characterCard")
        .forEach(card => card.classList.remove("selected"));

    const selectedCard =
        document.querySelector(`[data-id='${id}']`);

    selectedCard.classList.add("selected");

    selectedCharacter.textContent =
        `Child ${id}`;

}

// ===============================
// VALUE DROPDOWN
// ===============================

traitSelect.addEventListener("change", () => {

    populateValueDropdown();

});

function populateValueDropdown() {

    const trait = traitSelect.value;

    valueSelect.innerHTML = "";

    traitOptions[trait].forEach(value => {

        const option = document.createElement("option");

        option.value = value;

        option.textContent = capitalize(value);

        valueSelect.appendChild(option);

    });

}

// ===============================
// ASK QUESTION
// ===============================

askQuestionBtn.addEventListener("click", askQuestion);

function askQuestion() {

    const parent = parentSelect.value;
    const trait = traitSelect.value;
    const value = valueSelect.value;

    let parentLabel =
        parent === "father"
            ? "father"
            : "mother";

    let questionText =
        createQuestionText(parentLabel, trait, value);

    questionDisplay.textContent =
        questionText;

    let parentData =
        secretChild[parent];

    let actualValue =
        parentData[trait];

    let answer;

    if (typeof actualValue === "boolean") {

        const desired =
            value === "yes";

        answer =
            actualValue === desired;

    }
    else {

        answer =
            actualValue === value;

    }

    answerDisplay.textContent =
        answer ? "Yes" : "No";

}

// ===============================
// QUESTION TEXT
// ===============================

function createQuestionText(parent, trait, value) {

    switch (trait) {

        case "hair":
            return `Does the ${parent} have ${value} hair?`;

        case "eyes":
            return `Does the ${parent} have ${value} eyes?`;

        case "faceShape":
            return `Does the ${parent} have a ${value} face shape?`;

        case "nose":
            return `Does the ${parent} have a ${value} nose?`;

        case "glasses":
            return value === "yes"
                ? `Does the ${parent} wear glasses?`
                : `Does the ${parent} not wear glasses?`;

        case "freckles":
            return value === "yes"
                ? `Does the ${parent} have freckles?`
                : `Does the ${parent} not have freckles?`;

        default:
            return "Question";
    }

}

// ===============================
// GUESSING
// ===============================

guessBtn.addEventListener("click", makeGuess);

function makeGuess() {

    if (selectedChildId === null) {

        alert("Select a child first.");

        return;

    }

    if (selectedChildId === secretChild.id) {

        alert(
            `Correct! Child ${secretChild.id} was the hidden child.`
        );

        restartGame();

    }
    else {

        alert(
            `Incorrect. Try again.`
        );

    }

}

// ===============================
// RESTART
// ===============================

function restartGame() {

    chooseSecretChild();

    document
        .querySelectorAll(".characterCard")
        .forEach(card => {

            card.classList.remove("selected");
            card.classList.remove("eliminated");

        });

    selectedChildId = null;

    selectedCharacter.textContent =
        "No child selected";

    questionDisplay.textContent = "";

    answerDisplay.textContent =
        "Waiting for question...";

}

// ===============================
// HELPERS
// ===============================

function capitalize(str) {

    return str.charAt(0).toUpperCase()
        + str.slice(1);

}