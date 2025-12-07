# mood.py
import json
from datetime import datetime
import random

# Simple keyword → mood detection
KEYWORDS = {
    "anxious": ["meow", "cry", "loud", "pace", "nervous", "shiver"],
    "angry": ["hiss", "angry", "bite", "scratch"],
    "sleepy": ["sleep", "yawn", "slow", "tired"],
    "playful": ["play", "run", "jump", "active"],
}

MOOD_RECOMMENDATIONS = {
    "anxious": {
        "music": ["Calming Piano for Pets", "Soft Brown Noise", "Lo-fi for Cats"],
        "food": ["Warm chicken broth", "Pumpkin puree"]
    },
    "angry": {
        "music": ["Soft classical", "Ambient forest sounds"],
        "food": ["Crunchy calming treats"]
    },
    "sleepy": {
        "music": ["Gentle ambient pads"],
        "food": ["Light tuna snack"]
    },
    "playful": {
        "music": ["Upbeat cat chimes"],
        "food": ["Protein bites", "Interactive snack ball treat"]
    },
    "neutral": {
        "music": ["Any playlist"],
        "food": ["Any normal pet-safe meal"]
    }
}


def detect_mood(description):
    description = description.lower()
    for mood, words in KEYWORDS.items():
        for w in words:
            if w in description:
                return mood
    return "neutral"


def get_recommendations(mood):
    data = MOOD_RECOMMENDATIONS[mood]
    return random.choice(data["music"]), random.choice(data["food"])


def save_log(pet_type, mood, music, food):
    log = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "pet_type": pet_type,
        "mood": mood,
        "recommended_music": music,
        "recommended_food": food
    }

    try:
        with open("usage_log.json", "r") as f:
            logs = json.load(f)
    except:
        logs = []

    logs.append(log)

    with open("usage_log.json", "w") as f:
        json.dump(logs, f, indent=4)
