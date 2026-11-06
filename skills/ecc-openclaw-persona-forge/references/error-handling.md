# Error Handling and Fallback Strategies

## Design Principle

> Errors should not interrupt the user's creative workflow. Degrade gracefully and keep going.

## Error Categories and Fallback Matrix

### Category A: Missing Environment

| Failure | Detection | Fallback | Tell the user |
|----------|---------|---------|---------|
| Python 3 unavailable | `python3 --version` fails | Skip gacha.py and randomly choose from the 10 preset directions | "The draw engine requires Python 3; using the built-in random selection instead." |

### Category B: Optional Dependency Unavailable

| Failure | Detection | Fallback | Tell the user |
|----------|---------|---------|---------|
| Image-generation skill not installed | Check skill availability | Provide the complete prompt and instructions for manual generation | "No usable image-generation skill was found; here is the prompt for manual use." |
| Image-generation call fails | The skill returns an error | Retry once; provide prompt text if it still fails | "Image generation failed; here is the prompt for manual use." |

### Category C: Runtime Exceptions

| Failure | Fallback | Tell the user |
|----------|---------|---------|
| Unexpected gacha.py output format | Randomly choose from the 10 preset directions | "The draw result could not be parsed; using the built-in random selection instead." |
| Any unexpected error | Record the error, skip that step, and continue the main workflow | "A problem occurred: [brief error]. Skipping this step and continuing." |

## Standard Error Message

```markdown
> [Warning] **[Step name] is using a fallback**
> Reason: [What happened]
> Impact: [Affected capability]
> Alternative: [Fallback in use]
> Recovery: [How to restore full capability]
```

Example:

```markdown
> [Warning] **Avatar generation is using a fallback**
> Reason: No usable image-generation skill was found.
> Impact: Automatic avatar generation is unavailable.
> Alternative: The complete prompt is provided for manual use in Gemini or ChatGPT.
> Recovery: Install and enable a reviewed image-generation skill in the current environment.
```

## Key Principles

1. **The text plan is essential; the avatar is an enhancement**: failure of an auxiliary capability must not interrupt the main workflow.
2. **Fallback messages must be actionable**: explain how to recover, rather than merely saying an error occurred.
3. **A fallback does not block later steps**: Step 6 still produces its output if Step 5 uses a fallback.
