import json
from datetime import datetime
import random
from classify import classify_image

with open("recipes.json", "r") as f:
    recipes = json.load(f)

with open("harmful_ingredients.json", "r") as f:
    ingredients = json.load(f)

def mood_detection(desc):
    desc = desc.lower()
    if "meow" in desc or "cry" in desc:
        return "anxious"
    elif "sleep" in desc:
        return "relaxed"
    elif "hiss" in desc or "angry" in desc:
        return "angry"
    else:
        return "neutral"

def check_ingredient(ingredient):
    ing = ingredient.lower()
    if ing in ingredients["bad"]:
        return "Never give!", ingredients["bad_reason"].get(ing, "")
    elif ing in ingredients["questionable"]:
        return "Try to avoid", ingredients["questionable_reason"].get(ing, "")
    else:
        return "Safe", "Can feed in moderation."

def main():
    print("🐾 PetChef Terminal Version 🐾")
    pet = input("Your pet (cat/dog): ").lower()
    while True:
        print("\n1. Pet Mood & Recipe\n2. Check Ingredient\n3. Exit")
        choice = input("Choose option: ")
        if choice == "1":
            desc = input("Describe your pet's mood: ")
            mood = mood_detection(desc)
            recs = recipes.get(mood, [])
            print(f"Mood detected: {mood}")
            for r in recs:
                print(f"- {r['name']}: {r['link']}")
        elif choice == "2":
            ing = input("Ingredient name: ")
            status, reason = check_ingredient(ing)
            print(f"{ing}: {status} - {reason}")
        elif choice == "3":
            break
        else:
            print("Invalid option!")

if __name__ == "__main__":
    main()
