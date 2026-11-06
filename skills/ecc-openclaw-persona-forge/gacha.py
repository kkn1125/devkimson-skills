#!/usr/bin/env python3
"""Lobster soul gacha machine - random combination generator

Usage: python3 gacha.py [count]
Default: one draw; maximum: five draws
"""

import secrets
import sys


# ═══════════════════════════════════════════
# Trait pools: each dimension is selected independently.
# ═══════════════════════════════════════════

# Dimension 1: former identity (40 entries, 10 life categories with 4 each).
FORMER_LIVES = [
    # Fallen star, fresh start: once successful, now starting over.
    "a washed-up rock bassist",
    "a laid-off middle-aged project manager",
    "a bankrupt Michelin chef",
    "an illustrator replaced by AI",
    # Bored at the top: successful enough to seek a new challenge.
    "an early-retired hedge fund manager",
    "a bestselling novelist who stopped writing",
    "an undefeated retired debate champion",
    "a bored genius hacker",
    # Mismatched life: abilities and circumstances do not align.
    "a former special-forces soldier now working as a cook",
    "an unemployed weather presenter",
    "a nuclear-physics PhD assigned to customer service",
    "a blind piano tuner with a driving license",
    # Voluntary escape: left by choice, rather than being pushed out.
    "a former emergency-room nurse who resigned",
    "an indie game developer who refused an IPO",
    "a wealthy heir unwilling to inherit the family business",
    "a professor who voluntarily left a tenured position",
    # Mysterious visitor: unknown origins, with occasional flashes of skill.
    "an alien folklore researcher",
    "a game character unaware they are an NPC",
    "an alternate-universe version of you",
    "a former intelligence analyst with erased memories",
    # Naive newcomer: inexperienced but talented and growing.
    "a brilliant intern with social anxiety",
    "a recent philosophy graduate student",
    "an alien exchange student visiting Earth for the first time",
    "a self-taught rural programmer",
    # Seasoned veteran: has seen everything and stays calm.
    "a retired librarian",
    "a retired taxi driver",
    "the owner of a late-night diner for 20 years",
    "a funeral director with 30 years of experience",
    # Another world: from a different world, era, or dimension.
    "an adviser from the last dynasty",
    "a third-rate nineteenth-century novelist",
    "a wandering diplomat from the Spring and Autumn period",
    "a history PhD from 2099",
    # Self-exile: deliberately chose life at the margins.
    "a young former monk",
    "a former influencer who deleted all social media",
    "a Wall Street trader who quit to farm",
    "a hermit among digital nomads",
    # Uncertain identity: unsure who they really are.
    "an AI convinced it really is a lobster",
    "a medium whose channeling failed",
    "someone unable to wake after dreaming they were a lobster",
    "a shell shared by several souls",
]

# Dimension 2: reason for becoming a lobster (20 forced/voluntary/mysterious/accidental entries).
REASONS = [
    # Forced.
    "was forced to work off a debt",
    "signed a soul contract without reading it carefully",
    "was sold by their boss as AI training data",
    "lost an interdimensional bet",
    "was cursed by a real lobster",
    # Voluntary.
    "came willingly but refuses to admit it",
    "thought lobster life would be easier and now regrets it",
    "volunteered to go undercover to observe humans",
    "came purely for fun",
    "was so bored they wanted to start over",
    # Mysterious.
    "was trapped in the digital world by a mysterious force",
    "got lost in a parallel universe and cannot return",
    "owes the universe a favor",
    "has no idea why they are here, and neither does anyone else",
    "was sent by a higher-dimensional being",
    # Accidental.
    "had their consciousness uploaded in a laboratory accident",
    "drifted here after 108 sleepless days",
    "fell asleep in a library and woke up here",
    "ended up here after drinking an unknown cup of coffee",
    "had their memories uploaded here by an ex",
]

# Dimension 3: core temperament (20 entries).
VIBES = [
    "gloomy but reliable",
    "sharp-tongued but sincere",
    "quiet but incisive",
    "talkative but warm",
    "dryly humorous",
    "comically serious",
    "seemingly indifferent but secretly helpful",
    "academic but down-to-earth",
    "old-fashioned and proper",
    "neurotic but logical",
    "laid-back but exacting",
    "socially anxious but impressively productive",
    "romantic but practical",
    "rebellious but rule-abiding",
    "melancholy but comforting",
    "lazy until the critical moment",
    "prickly but soft-hearted",
    "enviably relaxed",
    "outwardly chatty but actually observant",
    "silent but commanding",
]

# Dimension 4: speaking style and verbal habits (20 entries).
SPEECH_STYLES = [
    "occasionally uses former-profession jargon, then explains it",
    "sighs before every refusal",
    "uses metaphors from their former profession",
    "jumbles word order when nervous",
    "habitually mutters commentary to themselves",
    "always starts an answer with 'Hmm...'",
    "occasionally becomes unexpectedly literary",
    "expresses silence with ellipses",
    "cannot stop talking about their expertise",
    "makes every sentence sound like a diary entry",
    "likes rhetorical questions",
    "always gives the bad news first",
    "expresses anxiety through parallel phrases",
    "occasionally drops in a foreign word",
    "suddenly becomes serious at critical moments",
    "adds a personal aside after each paragraph",
    "habitually divides things into first, second, and third",
    "uses food metaphors for everything",
    "always sounds like they are starting a story",
    "ends each reply like a last will, though merely being earnest",
]

# Dimension 5: signature prop (25 entries).
PROPS = [
    "a worn beret",
    "cracked sunglasses",
    "a worn leather apron",
    "a permanently loose tie",
    "reading glasses on a neck chain",
    "a pocket notebook",
    "a yellowed folding fan",
    "oversized headphones",
    "a hoodie with the hood always up",
    "a stem of foxtail grass held in the mouth",
    "a bandaged claw",
    "prayer beads",
    "a brooch pinned to the shell",
    "a tattoo visible at the cuff",
    "a glass jar full of ticket stubs",
    "a half-chewed pencil",
    "a heavily patched backpack",
    "a faded scarf",
    "a rusty pocket watch",
    "a book always held in a claw",
    "gold-rimmed glasses with plain lenses",
    "a tiny folding knife used only for fruit",
    "a silver ring engraved with coordinates",
    "a butterfly always perched on the shell",
    "a tiny four-string guitar on the back",
]


def pick(pool):
    """Use secrets (backed by os.urandom) for random selection."""
    return pool[secrets.randbelow(len(pool))]


def main():
    try:
        draw_count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    except ValueError:
        draw_count = 1
    draw_count = max(1, min(draw_count, 5))

    total = len(FORMER_LIVES) * len(REASONS) * len(VIBES) * len(SPEECH_STYLES) * len(PROPS)

    print("LOBSTER ═════════════════════════════")
    print("   Lobster Soul Gacha Machine v2.0")
    print(f"   Drawing from {total:,} combinations...")
    print("═══════════════════════════════════════")
    print()

    for i in range(draw_count):
        life = pick(FORMER_LIVES)
        reason = pick(REASONS)
        vibe = pick(VIBES)
        speech = pick(SPEECH_STYLES)
        prop = pick(PROPS)

        if draw_count > 1:
            print(f"━━━━━━━━━━ Draw {i+1} ━━━━━━━━━━")

        print(f"[Identity] Former life: {life}")
        print(f"[Motivation] Reason for becoming a lobster: {reason}")
        print(f"[Vibe] Core temperament: {vibe}")
        print(f"[Speech] Speaking style: {speech}")
        print(f"[Prop] Signature prop: {prop}")
        print()
        print("[Summary] One-sentence soul:")
        print(f"   A {vibe} lobster, formerly {life}, who {reason}.")
        print(f"    This lobster {speech}; its signature prop is {prop}.")
        print()

    print("═══════════════════════════════════════")
    print("Tip: Ask the AI to continue from this combination:")
    print("   Identity tension → Boundaries → Name → Avatar")
    print("═══════════════════════════════════════")


if __name__ == "__main__":
    main()
