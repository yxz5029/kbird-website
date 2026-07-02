import os
import json
from pathlib import Path

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).parent
POSTERS_DIR = BASE_DIR / "posters"
OUTPUT_JSON_DIR = BASE_DIR / "data" / "birds"
JS_OUTPUT = BASE_DIR / "ps.js"

# Create output folder if it doesn't exist
OUTPUT_JSON_DIR.mkdir(parents=True, exist_ok=True)


def display_name(filename_stem):
    """
    Convert:
        first_poster -> First Poster
        first-poster -> First Poster
        great_blue-heron -> Great Blue Heron
    """
    name = filename_stem.replace("_", " ").replace("-", " ")
    return name.title()


# Collect jpg files
jpg_files = sorted(
    [
        f for f in POSTERS_DIR.iterdir()
        if f.is_file() and f.suffix.lower() == ".jpg"
    ]
)

js_entries = []

for jpg in jpg_files:
    stem = jpg.stem

    pretty_name = display_name(stem)

    # -----------------------------
    # Generate JSON
    # -----------------------------
    bird_data = {
        "commonName": pretty_name,
        "scientificName": pretty_name,
        "family": "xxx",
        "habitat": "xxx",
        "conservationStatus": "N/A",
        "photographer": "Kevin",
        "location": "xxx",
        "year": "2026",
        "story": [
            "I made this poster to start my full collection website. I want every new poster to have its own page with image and explanation.",
            "My goal is to keep adding more posters in the same format so the site can grow to 110+ pages while staying organized and easy to view."
        ]
    }

    json_path = OUTPUT_JSON_DIR / f"{stem}.json"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(bird_data, f, indent=2, ensure_ascii=False)

    # -----------------------------
    # Generate JS entry
    # -----------------------------
    js_entries.append(
f"""{{
    id: '{stem}',
    coverImage: 'posters/{jpg.name}',
    posterFile: 'posters/{jpg.name}',
}},"""
    )

# -----------------------------
# Write ps.js
# -----------------------------
with open(JS_OUTPUT, "w", encoding="utf-8") as f:
    f.write("\n".join(js_entries))

print(f"Generated {len(jpg_files)} JSON files.")
print(f"JavaScript written to: {JS_OUTPUT}")