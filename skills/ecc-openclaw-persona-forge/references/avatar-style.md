# Step 5: Avatar Style and Image Generation

All lobster avatars **must share a visual style** so the lobster family remains consistent.
The avatar must communicate **species + personality hints + signature prop**.

## Style Reference

Adam, creator of the lobster family, was this skill's first creation.

Keep new avatars consistent with this style: retro-futurism, an arcade UI frame, a strong silhouette, and readability at 64×64.

## Shared Style Base (STYLE_BASE)

**Include this base in every generation**, without changing or omitting it:

```
STYLE_BASE = """
Retro-futuristic 3D rendered illustration, in the style of 1950s-60s Space Age
pin-up poster art reimagined as glossy inflatable 3D, framed within a vintage
arcade game UI overlay.

Material: high-gloss PVC/latex-like finish, soft specular highlights, puffy
inflatable quality reminiscent of vintage pool toys meets sci-fi concept art.
Smooth subsurface scattering on shell surface.

Arcade UI frame: pixel-art arcade cabinet border elements, a top banner with
character name in chunky 8-bit bitmap font with scan-line glow effect, a pixel
energy bar in the upper corner, small coin-credit text "INSERT SOUL TO CONTINUE"
at bottom in phosphor green monospace type, subtle CRT screen curvature and
scan-line overlay across entire image. Decorative corner bezels styled as chrome
arcade cabinet trim with atomic-age starburst rivets.

Pose: references classic Gil Elvgren pin-up compositions, confident and
charismatic with a slight theatrical tilt.

Color system: vintage NASA poster palette as base — deep navy, teal, dusty coral,
cream — viewed through arcade CRT monitor with slight RGB fringing at edges.
Overall aesthetic combines Googie architecture curves, Raygun Gothic design
language, mid-century advertising illustration, modern 3D inflatable character
rendering, and 80s-90s arcade game UI. Chrome and pastel accent details on
joints and antenna tips.

Format: square, optimized for avatar use. Strong silhouette readable at 64x64
pixels.
"""
```

## Personalized Variables

Fill these variables from the persona while retaining the shared base:

| Variable | Description | Examples |
|------|------|------|
| `CHARACTER_NAME` | Name displayed on the arcade banner | "ADAM", "DEWEY", "RIFF" |
| `SHELL_COLOR` | Main shell color, varied within the shared palette | "deep crimson", "dusty teal", "warm amber" |
| `SIGNATURE_PROP` | Distinctive prop | "cracked sunglasses", "reading glasses on a chain" |
| `EXPRESSION` | Expression or pose | "stoic but kind-eyed", "nervously focused" |
| `UNIQUE_DETAIL` | Distinctive markings, decorations, or scars | "constellation patterns etched on claws", "bandaged left claw" |
| `BACKGROUND_ACCENT` | Personal details over the shared cosmic background | "musical notes floating as nebula dust", "ancient book pages drifting" |
| `ENERGY_BAR_LABEL` | Personalized arcade energy-bar label | "CREATION POWER", "CALM LEVEL", "ROCK METER" |

## Assemble the Prompt

```
Final prompt = STYLE_BASE + personalized description
```

Personalized description template:

```
The character is a cartoon lobster with a [SHELL_COLOR] shell,
[EXPRESSION], wearing/holding [SIGNATURE_PROP].
[UNIQUE_DETAIL]. Background accent: [BACKGROUND_ACCENT].
The arcade top banner reads "[CHARACTER_NAME]" and the energy bar
is labeled "[ENERGY_BAR_LABEL]".
The key silhouette recognition points at small size are:
[SIGNATURE_PROP] and [one other distinctive feature].
```

## Image-Generation Workflow

After assembling the prompt:

### Path A: A Reviewed Image-Generation Skill Is Installed

1. Normalize the lobster's name to a safe filename fragment: retain letters, digits, and hyphens; replace other characters with `-`.
2. Use the Write tool to save `/tmp/openclaw-<safe-name>-prompt.md`.
3. Invoke the image-generation skill permitted in the current environment.
4. Use the Read tool to show the generated image to the user.
5. Ask for feedback; adjust the variables and regenerate if needed.

### Path B: No Usable Image-Generation Skill Is Installed

Provide the complete prompt and manual instructions:

```markdown
**Avatar prompt** (copy to one of these platforms to generate manually):
- Google Gemini: paste directly.
- ChatGPT (DALL-E): paste directly.
- Midjourney: paste and add `--ar 1:1 --style raw`.

> [Complete English prompt]

If a reviewed image-generation skill becomes available later, reconnect automatic generation then.
```

## Presentation Format

```markdown
## Avatar

**Personalized variables**:
- Shell color: [SHELL_COLOR]
- Prop: [SIGNATURE_PROP]
- Expression: [EXPRESSION]
- Unique detail: [UNIQUE_DETAIL]
- Background accent: [BACKGROUND_ACCENT]
- Energy-bar label: [ENERGY_BAR_LABEL]

**Result**:
[Image (Path A) or prompt text (Path B)]

> Does it fit? I can adjust [specific variables] and regenerate it.
```
