from classify import classify_image
import json
from mood import detect_mood, get_recommendations, save_log

def load_json(path):
    with open(path, "r") as f:
        return json.load(f)

recipes = load_json("recipes.json")
harmful = load_json("harmful_ingredients.json")


def ingredient_checker():
    ing = input("Enter an ingredient: ").lower()

    if ing in harmful:
        print("\n❌ Not safe!")
        print("Reason:", harmful[ing])
    else:
        print("\n✔ This ingredient is safe!")


def pet_mood_analyzer():
    print("\n🐾 Pet Mood Analyzer")
    pet_type = input("Pet type (cat/dog): ").capitalize()
    desc = input("Describe your pet's behavior: ")

    mood = detect_mood(desc)
    music, food = get_recommendations(mood)

    print(f"\nDetected Mood: {mood.upper()}")
    print("🎵 Music Recommendation:", music)
    print("🍖 Food Suggestion:", food)

    save_log(pet_type, mood, music, food)
    print("\n✔ Logged in usage_log.json")


def main():
    print("🐾 PET CHEF TERMINAL VERSION")
    print("1. Classify Food Image")
    print("2. Ingredient Checker")
    print("3. Pet Mood Analyzer")
    choice = input("\nChoose option: ")

    if choice == "1":
        img = input("Upload a food image path: ")
        food, prob = classify_image(img)
        print(f"\nDetected food: {food} ({prob:.2f})")

        if food in recipes:
            print("\nPet-safe alternatives:")
            for r in recipes[food]["pet_safe"]:
                print("- " + r)
        else:
            print("No recipe found for this food.")

    elif choice == "2":
        ingredient_checker()

    elif choice == "3":
        pet_mood_analyzer()

    else:
        print("Invalid input.")

if __name__ == "__main__":
    main()
