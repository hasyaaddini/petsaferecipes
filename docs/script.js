let pet = "";
let recipes = {};
let harmfulIngredients = {};

// Load JSON files
fetch('data/recipes.json')
    .then(response => response.json())
    .then(data => recipes = data);

fetch('data/harmful_ingredients.json')
    .then(response => response.json())
    .then(data => harmfulIngredients = data);

// Pet selection
function selectPet(selectedPet) {
    pet = selectedPet;
    document.getElementById('pet-choice').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

// Back button
function backToMenu() {
    document.getElementById('mood-section').style.display = 'none';
    document.getElementById('ingredient-section').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

// Mood detection
function showMoodInput() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('mood-section').style.display = 'block';
}

function detectMood() {
    const desc = document.getElementById('mood-input').value.toLowerCase();
    let mood = "neutral";

    if(desc.includes("meow") || desc.includes("cry")) mood = "anxious";
    else if(desc.includes("sleep")) mood = "relaxed";
    else if(desc.includes("hiss") || desc.includes("angry")) mood = "angry";

    const recs = recipes[mood] || ["Check back later!"];
    let html = `<p>Mood detected: <strong>${mood}</strong></p>`;
    html += "<p>Recommended for your pet:</p><ul>";
    recs.forEach(item => {
        html += `<li><a href="${item.link}" target="_blank">${item.name}</a></li>`;
    });
    html += "</ul>";

    document.getElementById('mood-result').innerHTML = html;
}

// Ingredient checker
function showIngredientChecker() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('ingredient-section').style.display = 'block';
}

function checkIngredient() {
    const ingredient = document.getElementById('ingredient-input').value.toLowerCase();
    let status = "Unknown";
    let reason = "";

    if(harmfulIngredients.bad.includes(ingredient)) {
        status = "Never give!";
        reason = harmfulIngredients.bad_reason[ingredient] || "";
    } else if(harmfulIngredients.questionable.includes(ingredient)) {
        status = "Try to avoid";
        reason = harmfulIngredients.questionable_reason[ingredient] || "";
    } else {
        status = "Safe";
        reason = "Can feed in moderation.";
    }

    document.getElementById('ingredient-result').innerHTML = `<p>${ingredient}: <strong>${status}</strong> - ${reason}</p>`;
}
