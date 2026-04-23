#!/usr/bin/env python3
"""
Generate 1,000 riddles for Connor's Riddle Maker using Claude Opus 4.6 (1M context).
4 batches of 250, each batch sees ALL prior riddles to avoid duplicates.
"""

import json
import os
import sys
import time
from pathlib import Path

import anthropic

OUTPUT_FILE = Path(__file__).parent.parent / "data" / "riddles.json"
PROGRESS_FILE = Path(__file__).parent.parent / "data" / "riddles_progress.json"

BATCH_SIZE = 250
TOTAL_BATCHES = 4

SYSTEM_PROMPT = """You are a riddle writer creating a collection of clever, fun riddles for kids around age 9. You write riddles that make kids laugh, think, and feel smart when they figure them out.

A GREAT kids riddle:
- Describes something familiar in a surprising, indirect way
- Has wordplay, clever misdirection, or a fun "aha!" moment
- Is satisfying to solve — not too easy, not impossibly hard
- Uses vivid, concrete language kids can picture
- NEVER contains the answer in the riddle text

Examples of GREAT riddles:
- "I have cities but no houses, forests but no trees, and water but no fish. What am I?" → A map
- "The more you take, the more you leave behind. What am I?" → Footsteps
- "I have a head and a tail but no body. What am I?" → A coin
- "What has hands but can't clap?" → A clock
- "I'm tall when I'm young and short when I'm old. What am I?" → A candle
- "What can you catch but never throw?" → A cold
- "What has teeth but cannot bite?" → A comb
- "I go up but never come down. What am I?" → Your age
- "What building has the most stories?" → A library
- "What has a neck but no head?" → A bottle

BAD riddles (DO NOT write these):
- "I am a food that starts with P" (just a guessing game, not a riddle)
- "Spell my name backwards and you get 'tac'" (not clever or fun)
- "I have 5 letters and belong to the animals group" (boring, not a riddle)
- "What number comes after 6?" (math question, not a riddle)"""


def make_prompt(batch_num: int, existing_riddles: list[dict]) -> str:
    existing_json = ""
    if existing_riddles:
        existing_json = f"""

HERE ARE ALL {len(existing_riddles)} RIDDLES GENERATED SO FAR. Do NOT repeat any of these answers or use very similar riddle concepts:

{json.dumps(existing_riddles, indent=1)}

---
"""

    # Rotate style/category emphasis per batch
    style_emphasis = [
        "what-am-i and lateral thinking",
        "wordplay and puns",
        "rhyming and trivia",
        "mix of all styles — fill gaps in whatever categories/styles are underrepresented above",
    ]

    return f"""{existing_json}Generate exactly {BATCH_SIZE} NEW unique riddles (batch {batch_num + 1} of {TOTAL_BATCHES}).

This batch should emphasize: {style_emphasis[batch_num]}

REQUIREMENTS:
1. Every riddle must be genuinely clever and fun for a 9-year-old
2. The riddle MUST describe the answer indirectly — never name it or make it trivially obvious
3. Every answer must be unique across ALL riddles (including the ones above)
4. Vary sentence structure — don't start every riddle with "I" or "What"
5. hints: hint1 should be vague/general, hint2 should narrow it down significantly
6. distractors: 3 wrong answers that a kid might actually consider (not random nonsense)

DISTRIBUTE evenly across these categories: animals, food, nature, school, science, silly, holidays, sports, space, math, words

DISTRIBUTE evenly across these styles: what-am-i, wordplay, rhyming, lateral, math, trivia

DIFFICULTY split: ~40% easy, ~35% medium, ~25% tricky

Return a JSON array of {BATCH_SIZE} objects, each with:
- "question": string (the riddle — must NOT contain the answer)
- "answer": string (1-4 words)
- "hints": [hint1, hint2]
- "distractors": [wrong1, wrong2, wrong3]
- "category": one of [animals, food, nature, school, science, silly, holidays, sports, space, math, words]
- "style": one of [what-am-i, wordplay, rhyming, lateral, math, trivia]
- "difficulty": one of [easy, medium, tricky]
- "emoji": single emoji related to the answer

Return ONLY the JSON array. No markdown fences, no commentary."""


def generate_batch(client: anthropic.Anthropic, batch_num: int, existing_riddles: list[dict]) -> list[dict]:
    prompt = make_prompt(batch_num, existing_riddles)

    print(f"  Sending request (input ~{len(prompt) // 4:,} tokens)...")
    start = time.time()

    # Use streaming — required for long Opus requests
    text_chunks = []
    input_tokens = 0
    output_tokens = 0

    with client.messages.stream(
        model="claude-opus-4-20250514",
        max_tokens=16384,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for event in stream:
            pass
        response = stream.get_final_message()

    elapsed = time.time() - start
    print(f"  Response received in {elapsed:.0f}s")
    print(f"  Usage: input={response.usage.input_tokens:,} output={response.usage.output_tokens:,}")

    text = response.content[0].text.strip()

    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    return json.loads(text)


def validate_riddle(r: dict, idx: int) -> bool:
    CATEGORIES = {"animals", "food", "nature", "school", "science", "silly", "holidays", "sports", "space", "math", "words"}
    STYLES = {"what-am-i", "wordplay", "rhyming", "lateral", "math", "trivia"}
    DIFFICULTIES = {"easy", "medium", "tricky"}

    required = ["question", "answer", "hints", "distractors", "category", "style", "difficulty"]
    for f in required:
        if f not in r:
            print(f"    SKIP #{idx}: missing '{f}'")
            return False

    if r["answer"].lower() in r["question"].lower():
        print(f"    SKIP #{idx}: answer '{r['answer']}' found in question")
        return False

    if not isinstance(r["hints"], list) or len(r["hints"]) < 1:
        print(f"    SKIP #{idx}: bad hints")
        return False

    if not isinstance(r["distractors"], list) or len(r["distractors"]) < 3:
        print(f"    SKIP #{idx}: need 3 distractors")
        return False

    # Normalize
    r["hints"] = r["hints"][:2]
    r["distractors"] = r["distractors"][:3]
    if r["category"] not in CATEGORIES:
        r["category"] = "silly"
    if r["style"] not in STYLES:
        r["style"] = "what-am-i"
    if r["difficulty"] not in DIFFICULTIES:
        r["difficulty"] = "medium"

    return True


def deduplicate(riddles: list[dict]) -> list[dict]:
    seen_answers = set()
    unique = []
    for r in riddles:
        key = r["answer"].lower().strip()
        if key in seen_answers:
            continue
        seen_answers.add(key)
        unique.append(r)
    removed = len(riddles) - len(unique)
    if removed:
        print(f"  De-duplication removed {removed} riddles")
    return unique


def main():
    api_key = os.environ.get("ANTHROPIC_AUTH_TOKEN") or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: Set ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # Resume from progress if available
    all_riddles = []
    start_batch = 0
    if PROGRESS_FILE.exists():
        all_riddles = json.loads(PROGRESS_FILE.read_text())
        start_batch = len(all_riddles) // BATCH_SIZE
        print(f"Resuming: {len(all_riddles)} riddles loaded, starting batch {start_batch + 1}")

    for batch_num in range(start_batch, TOTAL_BATCHES):
        print(f"\n=== Batch {batch_num + 1}/{TOTAL_BATCHES} (generating {BATCH_SIZE} riddles) ===")

        retries = 0
        while retries < 3:
            try:
                batch = generate_batch(client, batch_num, all_riddles)
                break
            except json.JSONDecodeError as e:
                retries += 1
                print(f"  JSON parse error (retry {retries}/3): {e}")
                time.sleep(5)
            except anthropic.RateLimitError:
                print("  Rate limited, waiting 60s...")
                time.sleep(60)
                retries += 1
            except Exception as e:
                retries += 1
                print(f"  Error (retry {retries}/3): {e}")
                time.sleep(10)
        else:
            print(f"  FAILED batch {batch_num + 1} after 3 retries")
            continue

        valid = [r for i, r in enumerate(batch) if validate_riddle(r, i)]
        print(f"  Valid: {len(valid)}/{len(batch)}")

        all_riddles.extend(valid)
        PROGRESS_FILE.write_text(json.dumps(all_riddles, indent=2))
        print(f"  Total: {len(all_riddles)}")

    # Final cleanup
    print(f"\n=== Final processing ===")
    print(f"Raw: {len(all_riddles)}")
    all_riddles = deduplicate(all_riddles)
    print(f"After de-dup: {len(all_riddles)}")

    for i, r in enumerate(all_riddles):
        r["id"] = f"r{i+1:04d}"

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(all_riddles, indent=2))
    print(f"\nWrote {len(all_riddles)} riddles to {OUTPUT_FILE}")

    if PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()

    from collections import Counter
    cats = Counter(r["category"] for r in all_riddles)
    diffs = Counter(r["difficulty"] for r in all_riddles)
    styles = Counter(r["style"] for r in all_riddles)
    print(f"\nCategories: {json.dumps(dict(sorted(cats.items())), indent=2)}")
    print(f"Difficulties: {json.dumps(dict(sorted(diffs.items())), indent=2)}")
    print(f"Styles: {json.dumps(dict(sorted(styles.items())), indent=2)}")


if __name__ == "__main__":
    main()
