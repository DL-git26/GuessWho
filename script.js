// ===============================
// GLOBAL STATE
// ===============================

let childrenData = [];
let secretChild = null;

let selectedChildId = null;

let selectedParent = null;
let selectedTrait = null;
let selectedValue = null;

// ===============================
// ELEMENTS
// ===============================

const grid = document.getElementById("characterGrid");

const selectedCharacter = document.getElementById("selectedCharacter");

const rulesModal = document.getElementById("rulesModal");
const startGameBtn = document.getElementById("startGameBtn");

const askQuestionBtn = document.getElementById("askQuestionBtn");

const questionDisplay = document.getElementById("questionDisplay");
const answerDisplay = document.getElementById("answerDisplay");

const guessBtn = document.getElementById("guessBtn");

const traitButtons = document.getElementById("traitButtons");
const valueButtons = document.getElementById("valueButtons");

// ===============================
// TRAITS
// ===============================

const traits = {
    hair: ["brown", "black", "blond", "ginger"],
    eyes: ["blue", "green", "brown", "grey"],
    faceShape: ["round", "square"],
    nose: ["round", "pointy"],
    glasses: ["yes", "no"],
    freckles: ["yes", "no"]
};

// ===============================
// INIT
// ===============================

window.addEventListener("load", async () => {

    await loadData();

    renderTraits();

    // Setup parent button event listeners
    document.querySelectorAll("[data-parent]").forEach(btn => {

        btn.addEventListener("click", () => {

            selectedParent = btn.dataset.parent;

            document.querySelectorAll("[data-parent]")
                .forEach(b => b.classList.remove("selected"));

            btn.classList.add("selected");

        });

    });

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

    const res = await fetch("data.json");
    childrenData = await res.json();

    secretChild =
        childrenData[Math.floor(Math.random() * childrenData.length)];

    renderGrid();

}

// ===============================
// GRID
// ===============================

function renderGrid() {

    grid.innerHTML = "";

    childrenData.forEach(child => {

        const card = document.createElement("div");

        card.className = "characterCard";

        card.dataset.id = child.id;

        card.innerHTML = `
            <img class="characterImage"
                 src="images/${child.image}">
            <div class="characterLabel">Child ${child.id}</div>
        `;

        card.addEventListener("click", () => selectChild(child.id));

        card.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            card.classList.toggle("eliminated");
        });

        grid.appendChild(card);

    });

}

// ===============================
// SELECTION
// ===============================

function selectChild(id) {

    selectedChildId = id;

    document.querySelectorAll(".characterCard")
        .forEach(c => c.classList.remove("selected"));

    document.querySelector(`[data-id="${id}"]`)
        .classList.add("selected");

    selectedCharacter.textContent = `Child ${id}`;

}

// ===============================
// TRAIT BUTTONS
// ===============================

function renderTraits() {

    traitButtons.innerHTML = "";

    Object.keys(traits).forEach(trait => {

        const btn = document.createElement("button");

        btn.className = "choiceBtn";

        btn.textContent = formatTrait(trait);

        btn.onclick = () => {

            selectedTrait = trait;
            selectedValue = null;

            // reset UI selection
            document.querySelectorAll("#traitButtons .choiceBtn")
                .forEach(b => b.classList.remove("selected"));

            btn.classList.add("selected");

            renderValues(trait);

        };

        traitButtons.appendChild(btn);

    });

}

function renderValues(trait) {

    valueButtons.innerHTML = "";

    traits[trait].forEach(value => {

        const btn = document.createElement("button");

        btn.className = "choiceBtn";

        btn.textContent = capitalize(value);

        btn.onclick = () => {

            selectedValue = value;

            document.querySelectorAll("#valueButtons .choiceBtn")
                .forEach(b => b.classList.remove("selected"));

            btn.classList.add("selected");

        };

        valueButtons.appendChild(btn);

    });

}

// ===============================
// QUESTION LOGIC
// ===============================

askQuestionBtn.addEventListener("click", () => {

    if (!selectedParent || !selectedTrait || !selectedValue) {
        alert("Complete question selection first.");
        return;
    }

    const question = buildQuestion();

    questionDisplay.textContent = question;

    const parentData = secretChild[selectedParent];

    const actual = parentData[selectedTrait];

    let answer;

    if (typeof actual === "boolean") {

        answer = (selectedValue === "yes") === actual;

    } else {

        answer = actual === selectedValue;

    }

    answerDisplay.textContent = answer ? "Yes" : "No";

});

// ===============================
// QUESTION TEXT
// ===============================

function buildQuestion() {

    return `Does the ${selectedParent} have ${selectedValue} ${formatTrait(selectedTrait)}? (Trait: ${selectedTrait})`;

}

// ===============================
// GUESS
// ===============================

guessBtn.addEventListener("click", () => {

    if (!selectedChildId) {
        alert("Select a child first.");
        return;
    }

    if (selectedChildId == secretChild.id) {

        alert("Correct! You found the child.");
        restart();

    } else {

        alert("Incorrect guess.");
    }

});

// ===============================
// RESTART
// ===============================

function restart() {

    selectedChildId = null;

    secretChild =
        childrenData[Math.floor(Math.random() * childrenData.length)];

    document.querySelectorAll(".characterCard")
        .forEach(c => c.classList.remove("selected", "eliminated"));

    selectedCharacter.textContent = "No child selected";

    questionDisplay.textContent = "";

    answerDisplay.textContent = "Waiting for question...";

}

// ===============================
// HELPERS
// ===============================

function formatTrait(t) {

    return t.replace(/([A-Z])/g, " $1")
        .replace(/^./, s => s.toUpperCase());

}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}