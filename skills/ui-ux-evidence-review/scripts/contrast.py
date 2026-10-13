#!/usr/bin/env python3
"""Compare two opaque sRGB colors; this is not a WCAG conformance audit."""

import argparse
import json
import math
import re


def luminance(color):
    if not isinstance(color, str) or not re.fullmatch(r"#[0-9a-fA-F]{6}", color):
        raise ValueError("Use an opaque sRGB color in #RRGGBB form.")
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
              for c in channels]
    return sum(c * weight for c, weight in zip(linear, (0.2126, 0.7152, 0.0722)))


def contrast(foreground, background):
    light, dark = sorted((luminance(foreground), luminance(background)), reverse=True)
    return (light + 0.05) / (dark + 0.05)


def self_test():
    assert math.isclose(contrast("#000000", "#FFFFFF"), 21.0)
    assert contrast("#aBcDeF", "#abcdef") == 1.0
    assert math.isclose(contrast("#777777", "#FFFFFF"), 4.478089453577214)
    assert contrast("#777777", "#FFFFFF") < 4.5
    assert contrast("#767676", "#FFFFFF") >= 4.5
    assert contrast("#123456", "#abcdef") == contrast("#abcdef", "#123456")
    for invalid in ("#fff", "#ffffffff", "red", "#GG0000", "ffffff", None):
        try:
            luminance(invalid)
        except ValueError:
            continue
        raise AssertionError(f"Invalid input accepted: {invalid!r}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("colors", nargs="*", metavar="#RRGGBB")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        if args.colors:
            parser.error("--self-test does not take colors")
        self_test()
        print("PASS: known ratios, threshold boundary, symmetry, invalid input")
        return
    if len(args.colors) != 2:
        parser.error("Provide foreground and background colors in #RRGGBB form")
    try:
        ratio = contrast(*args.colors)
    except ValueError as error:
        parser.error(str(error))
    print(json.dumps({
        "foreground": args.colors[0], "background": args.colors[1], "ratio": ratio,
        "meets_numeric_4_5_threshold": ratio >= 4.5,
        "meets_numeric_3_threshold": ratio >= 3.0,
        "scope": "Opaque sRGB pair only; check criterion applicability and exceptions."
    }, indent=2))


if __name__ == "__main__":
    main()
