#!/usr/bin/env python3
"""Merge batch files, deduplicate, validate, and produce final riddles.json."""

import json
from pathlib import Path
from collections import Counter

DATA_DIR = Path(__file__).parent.parent / "data"
BATCH_FILES = sorted(DATA_DIR.glob("batch*.json"))
OUTPUT = DATA_DIR / "riddles.json"

CATEGORIES = {"animals", "food", "nature", "school", "science", "silly", "holidays", "sports", "space", "math", "words"}
STYLES = {"what-am-i", "wordplay", "rhyming", "lateral", "math", "trivia"}
DIFFICULTIES = {"easy", "medium", "tricky"}

def main():
    # Load all batches
    all_riddles = []
    for f in BATCH_FILES:
        batch = json.load(open(f))
        print(f"Loaded {f.name}: {len(batch)} riddles")
        all_riddles.extend(batch)
    print(f"\nTotal raw: {len(all_riddles)}")

    # Validate
    valid = []
    for i, r in enumerate(all_riddles):
        # Check required fields
        required = ["question", "answer", "hints", "distractors", "category", "style", "difficulty"]
        if not all(f in r for f in required):
            print(f"  SKIP #{i}: missing field")
            continue

        # Check answer not in question
        if r["answer"].lower() in r["question"].lower():
            print(f"  SKIP #{i}: answer '{r['answer']}' in question")
            continue

        # Normalize
        if r["category"] not in CATEGORIES:
            r["category"] = "silly"
        if r["style"] not in STYLES:
            r["style"] = "what-am-i"
        if r["difficulty"] not in DIFFICULTIES:
            r["difficulty"] = "medium"

        r["hints"] = r["hints"][:2]
        r["distractors"] = r["distractors"][:3]

        if not isinstance(r["hints"], list) or len(r["hints"]) < 1:
            continue
        if not isinstance(r["distractors"], list) or len(r["distractors"]) < 3:
            continue

        valid.append(r)

    print(f"After validation: {len(valid)}")

    # Deduplicate by answer (case-insensitive)
    seen_answers = set()
    unique = []
    for r in valid:
        key = r["answer"].lower().strip()
        if key in seen_answers:
            continue
        seen_answers.add(key)
        unique.append(r)

    print(f"After dedup: {len(unique)}")

    # Assign IDs
    for i, r in enumerate(unique):
        r["id"] = f"r{i+1:04d}"

    # Write output
    OUTPUT.write_text(json.dumps(unique, indent=2))
    print(f"\nWrote {len(unique)} riddles to {OUTPUT}")

    # Stats
    cats = Counter(r["category"] for r in unique)
    diffs = Counter(r["difficulty"] for r in unique)
    styles = Counter(r["style"] for r in unique)

    print(f"\n--- Categories ---")
    for k, v in sorted(cats.items()):
        print(f"  {k}: {v}")

    print(f"\n--- Difficulties ---")
    for k, v in sorted(diffs.items()):
        print(f"  {k}: {v}")

    print(f"\n--- Styles ---")
    for k, v in sorted(styles.items()):
        print(f"  {k}: {v}")

if __name__ == "__main__":
    main()
