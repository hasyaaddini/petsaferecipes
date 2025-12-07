let selectedPet = "";

function selectPet(pet) {
    selectedPet = pet;
    document.getElementById('pet-title').innerText = "🐾 " + pet;
    document.getElementById('home').style.display = 'none';
    document.getElementById('features').style.display = 'block';
}

// Show tutorial
function showTutorial() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('tutorial').style.display = 'block';
}

function hideTutorial() {
    document.getElementById('tutorial').style.display = 'none';
    document.getElementById('home').style.display = 'block';
}

// Show one feature, hide others
function showFeature(feature) {
    let features = ['food', 'ingredient', 'mood'];
    features.forEach(f => {
        document.getElementById(f + '-feature').style.display = (f === feature) ? 'block' : 'none';
    });
}

// ================== FOOD CLASSIFIER ==================
// Fake logic for demo
function classifyFood() {
    let fileInput = document.getElementById('food-file').value;
    let name = fileInput.split('\\').pop().split('/').pop().split('.')[0]; // filename
    let recipes = {
        "pizza": ["Cheese & Chicken Mini Pizza", "Pumpkin Pet Pizza"],
        "burger": ["Mini Chicken Burger", "Turkey Patty Bites"]
    };

    let resultDiv = document.getElementById('food-result');
    if (recipes[name]) {
        let html = "<h4>Detected: " + name + "</h4>";
        html += "<p>Pet-safe recipes:</p><ul>";
        recipes[name].forEach(r => {
            html += "<li>" + r + "</li>";
        });
        html += "</ul>";
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = "<p>Food not recognized!</p>";
    }
}

// ================== INGREDIENT CHECKER ==================
function checkIngredient() {
    let input = document.getElementById('ingredient-input').value.toLowerCase();
    let harmful = {
        "onion": "❌ Highly toxic for cats and dogs",
        "garlic": "❌ Avoid, causes anemia",
        "chocolate": "❌ Very dangerous for pets"
    };
    let safeMsg = "✔ Safe for your pet!";
    document.getElementById('ingredient-result').innerText = harmful[input] || safeMsg;
}

// ================== PET MOOD ANALYZER ==================
function analyzeMood() {
    let desc = document.getElementById('mood-input').value.toLowerCase();
    let mood = "neutral";

    if (desc.includes("meow") || desc.includes("cry") || desc.includes("loud")) mood = "anxious";
    else if (desc.includes("hiss") || desc.includes("angry") || desc.includes("scratch")) mood = "angry";
    else if (desc.includes("sleep") || desc.includes("yawn") || desc.includes("tired")) mood = "sleepy";
    else if (desc.includes("play") || desc.includes("run") || desc.includes("jump")) mood = "playful";

    let musicOptions = {
        "anxious": ["Calming Piano", "Lo-fi for Pets"],
        "angry": ["Soft Classical", "Ambient Forest"],
        "sleepy": ["Gentle Ambient Pads"],
        "playful": ["Upbeat Cat Chimes"],
        "neutral": ["Any playlist"]
    };

    let foodOptions = {
        "anxious": ["Warm Chicken Broth", "Pumpkin Puree"],
        "angry": ["Crunchy calming treats"],
        "sleepy": ["Light tuna snack"],
        "playful": ["Protein bites", "Interactive snack ball treat"],
        "neutral": ["Regular pet-safe food"]
    };

    let music = musicOptions[mood][Math.floor(Math.random() * musicOptions[mood].length)];
    let food = foodOptions[mood][Math.floor(Math.random() * foodOptions[mood].length)];

    document.getElementById('mood-result').innerHTML = `
        <p>Mood detected: <b>${mood}</b></p>
        <p>🎵 Music: ${music}</p>
        <p>🍖 Food: ${food}</p>
    `;
}

