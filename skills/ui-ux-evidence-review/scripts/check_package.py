#!/usr/bin/env python3
"""Read-only checks for this bundle's manifest subset and local Markdown links.

Manifest subset: flat name and JSON-quoted description; optional openai.yaml
contains only interface strings. This is not a general YAML or behavior validator.
"""

import argparse
import json
import re
import tempfile
from pathlib import Path


LINK = re.compile(r"\[[^\]\n]*\]\(([^)\n]+)\)")


def check(root):
    root = Path(root).resolve()
    errors = []
    texts = {}
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            errors.append(f"Symlink not supported: {path.relative_to(root)}")
            continue
        if path.is_file() and path.suffix in (".md", ".yaml", ".py"):
            try:
                texts[path] = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                errors.append(f"Not UTF-8: {path.relative_to(root)}")
    entry = root / "SKILL.md"
    body = texts.get(entry, "")
    match = re.match(r"\A---\nname: ([a-z0-9]+(?:-[a-z0-9]+)*)\ndescription: (.+)\n---\n", body)
    if not match:
        errors.append("Missing SKILL.md or unsupported manifest subset")
    else:
        name, raw_description = match.groups()
        if name != root.name or len(name) >= 64:
            errors.append("Skill name must match folder and be under 64 characters")
        try:
            description = json.loads(raw_description)
            if (not isinstance(description, str) or not description.strip()
                    or len(description) > 1024 or any(c in description for c in "<>")):
                errors.append("Invalid description")
        except json.JSONDecodeError:
            errors.append("Description must be a JSON-quoted YAML string")
    entry_targets = set()
    all_targets = set()
    for path, text in texts.items():
        if path.suffix != ".md":
            continue
        if re.search(r"(?m)^\s*\[TODO:[^\n]*\]\s*$", text):
            errors.append(f"Unfinished scaffold: {path.relative_to(root)}")
        for raw in LINK.findall(text):
            if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", raw):
                continue
            target_text = raw.split("#", 1)[0]
            if not target_text:
                continue
            target = (path.parent / target_text).resolve()
            if not target.is_relative_to(root):
                errors.append(f"Link leaves skill: {path.relative_to(root)} -> {raw}")
            elif not target.is_file():
                errors.append(f"Broken link: {path.relative_to(root)} -> {raw}")
            all_targets.add(target)
            if path == entry:
                entry_targets.add(target)
    for path in (root / "references").glob("*.md"):
        if path not in entry_targets:
            errors.append(f"Reference not routed by SKILL.md: {path.name}")
    for path in (root / "scripts").glob("*.py"):
        if path not in all_targets:
            errors.append(f"Script not linked: {path.name}")
    metadata = texts.get(root / "agents" / "openai.yaml")
    if metadata is not None:
        try:
            lines = metadata.splitlines()
            if not lines or lines[0] != "interface:":
                raise ValueError("Expected interface mapping")
            fields = {}
            for line in lines[1:]:
                field = re.fullmatch(r"  ([a-z_]+): (.+)", line)
                if not field or field[1] in fields:
                    raise ValueError("Unsupported or duplicate metadata field")
                fields[field[1]] = json.loads(field[2])
            if set(fields) != {"display_name", "short_description", "default_prompt"}:
                raise ValueError("Expected the bundle's three interface fields")
            if not all(isinstance(value, str) and value.strip() for value in fields.values()):
                raise ValueError("Interface values must be nonempty strings")
            if not 25 <= len(fields["short_description"]) <= 64:
                raise ValueError("Short description must have 25-64 characters")
            if match and f"${match[1]}" not in fields["default_prompt"]:
                raise ValueError("Default prompt must mention skill")
        except (ValueError, json.JSONDecodeError) as error:
            errors.append(f"Invalid openai.yaml: {error}")
    return errors


def self_test():
    with tempfile.TemporaryDirectory(prefix="ui-review-check-") as directory:
        root = Path(directory) / "demo"
        (root / "references").mkdir(parents=True)
        entry = root / "SKILL.md"
        valid = '---\nname: demo\ndescription: "Review UI"\n---\n[Guide](references/guide.md)\n'
        entry.write_text(valid, encoding="utf-8")
        guide = root / "references" / "guide.md"
        guide.write_text("# Guide\n", encoding="utf-8")
        assert check(root) == []
        guide.unlink()
        assert any("Broken link" in error for error in check(root))
        guide.write_text("# Guide\n", encoding="utf-8")
        entry.write_text(valid + "[Outside](../outside.md)\n", encoding="utf-8")
        assert any("leaves skill" in error for error in check(root))
        entry.write_text(valid.replace("name: demo", "name: other"), encoding="utf-8")
        assert any("name must match" in error for error in check(root))
        entry.write_text(valid, encoding="utf-8")
        (root / "references" / "orphan.md").write_text("# Orphan\n", encoding="utf-8")
        assert any("not routed" in error for error in check(root))
        (root / "references" / "orphan.md").unlink()
        (root / "agents").mkdir()
        (root / "agents" / "openai.yaml").write_text('interface:\n  display_name: "Demo"\n', encoding="utf-8")
        assert any("Invalid openai.yaml" in error for error in check(root))
    print("PASS: valid fixture, missing link, escaped path, name mismatch, orphan, metadata")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill", nargs="?", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        if args.skill:
            parser.error("--self-test does not take a path")
        self_test()
        return
    errors = check(args.skill or Path(__file__).resolve().parents[1])
    for error in errors:
        print(f"FAIL: {error}")
    if errors:
        raise SystemExit(1)
    print("PASS: manifest subset, metadata, UTF-8, local links, reference routing, script links")


if __name__ == "__main__":
    main()
