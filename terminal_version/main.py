# main.py
import json
import os
from classify import build_reference_histograms, predict_image

DATA_DIR = "."
RECIPES_FILE = os.path.join(DATA_DIR, "recipes.json")
HARMFUL_FILE = os.path.join(DATA_DIR, "harmful_ingredients.json")
NUTR_FILE = os.path.join(DATA_DIR, "nutrition.json")
REF_DIR = os.path.join(DATA_DIR, "reference_images")

def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def check_harmful(food_key, pet, harmful_map, recipes):
    # simple logic: if food_key is listed under an ingredient in harmful_map => unsafe
    reasons = []
    for ing, foods in harmful_map.items():
        if isinstance(foods, list) and food_key in foods:
            reasons.append(ing)
    # check recipe metadata
    entry = recipes.get(food_key)
    if entry and "safe_for" in entry:
        safe_for = entry["safe_for"]
        pet_safe = safe_for.get(pet.lower(), True)
        if not pet_safe:
            return "unsafe", reasons
        return "safe", reasons
    if reasons:
        return "unsafe", reasons
    return "caution", reasons

def print_recipe_options(food_key, recipes):
    entry = recipes.get(food_key)
    if not entry:
        print("No direct matching recipe found. Showing a couple of safe suggestions if available.")
        # fallback: print some safe recipes (top 2)
        count = 0
        for k,v in recipes.items():
            if v.get("safe_for", {}).get("dog") or v.get("safe_for", {}).get("cat"):
                print(f"- {v.get('pet_safe','No title')} (from {k})")
                count += 1
            if count >= 3:
                break
        return
    alts = entry.get("alternatives", [])
    if not alts:
        print("No alternatives listed. See entry reason:")
        print(entry.get("reason","No reason provided."))
        return
    print("Recipe alternatives:")
    for alt in alts:
        recs = entry.get("recipes", {})
        r = recs.get(alt) or recipes.get(alt)
        if not r:
            continue
        print(f"\n=== {r.get('title','No title')} ===")
        print("Ingredients:")
        for ing in r.get("ingredients", []):
            print(" - " + ing)
        print("Steps:")
        for s in r.get("steps", []):
            print(" - " + s)

def main():
    print("PetChef — Terminal Edition")
    print("Choose pet: (cat/dog)")
    pet = input("Pet: ").strip().lower()
    if pet not in ("cat","dog"):
        print("Defaulting to dog.")
        pet = "dog"

    # load data
    recipes = load_json(RECIPES_FILE)
    harmful_map = load_json(HARMFUL_FILE)
    nutrition = load_json(NUTR_FILE)

    # build reference histograms
    print("Building reference histograms (if reference images exist)...")
    class_hists = build_reference_histograms(REF_DIR)

    print("\nOptions:\n1) Upload image (enter full path)\n2) Ingredient checker\n3) Quit")
    choice = input("Select option [1/2/3]: ").strip()
    if choice == "1":
        path = input("Enter the full path to the image file: ").strip().strip('"')
        best, score = predict_image(path, class_hists)
        if best is None:
            print("No reference images available or error reading image. You can type the food name instead.")
            best = input("Type food name: ").strip().lower()
            score = 0.0
        print(f"\nDetected: {best} (score {score:.2f})")
        status, reasons = check_harmful(best, pet, harmful_map, recipes)
        print("\nSafety status:", status.upper())
        if reasons:
            print("Harmful ingredients flagged:", ", ".join(reasons))
        else:
            print("No obvious harmful ingredients flagged by DB.")
        # nutrition snippet
        nut = nutrition.get(best)
        if nut:
            print("\nNutrition (approx):")
            for k,v in nut.items():
                print(f" {k}: {v}")
        # print recipe alternatives
        print()
        print_recipe_options(best, recipes)

    elif choice == "2":
        ing = input("Type ingredient name: ").strip().lower()
        # simple check
        bad_for_cat = set(load_json(HARMFUL_FILE).keys())  # keys are ingredients
        # more advanced mapping could be used. For now, check if typed ingredient in harmful keys:
        if ing in bad_for_cat:
            print(f"\nStatus: NEVER give {ing} to pets. Reason: {ing} appears in our harmful list.")
        else:
            print(f"\nStatus: Usually safe or unknown. Please verify with a vet if unsure.")
    else:
        print("Bye!")

if __name__ == "__main__":
    main()

