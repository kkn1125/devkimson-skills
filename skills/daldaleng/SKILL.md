---
name: daldaleng
description: Inspect, diagnose, review, or safely change the Daldal English repositories and Dooray tickets. Use for daldal-english-api, daldal-english-batch, frontend/backoffice, Chococlass LMS endpoints (/today, /weekly, /weekly/students, /monthly, /monthly/students), reportView, RankMapper rankings, ticket #174/#183, SQL validation, deployment-state checks, or project-history questions.
---

# Daldal English Engineering

Use current repository and current Dooray evidence. Reference documents provide orientation, never proof that today's code or policy is unchanged.

## Start every investigation

1. Locate the relevant repository from [references/repositories.md](references/repositories.md).
2. Read that repository's `AGENTS.md` or equivalent instructions.
3. Run `git status --short --branch`, `git log -5 --oneline`, and targeted `rg -n` searches.
4. Preserve all existing local changes. Never assume a dirty file belongs to this task.
5. For policy-sensitive work, fetch the latest Dooray ticket/comments before deciding. Visible ticket numbers and Dooray post IDs are different identifiers.
6. State separately what is observed in source, committed, built/tested, deployed to staging/QA/production, and verified.

Do not answer from remembered line numbers. Find the mapper ID, method, endpoint, or DTO symbol again, then print a narrow numbered excerpt with `nl -ba ... | sed -n ...`.

## Route the task

- LMS/Chococlass endpoints or ticket #174: read [references/ticket-174-lms-api.md](references/ticket-174-lms-api.md), then [references/code-map.md](references/code-map.md).
- Rankings, `reportView`, `RankMapper`, or ticket #183: read [references/ticket-183-ranking.md](references/ticket-183-ranking.md), then [references/sql-checks.md](references/sql-checks.md).
- Why a rule or unusual implementation exists: read [references/history.md](references/history.md).
- Before editing, reviewing a diff, or suggesting production SQL: read [references/guardrails.md](references/guardrails.md).

Only load the references needed for the current request.

## Investigation method

Trace one response field end to end:

```text
Controller endpoint
  -> request/response DTO
  -> service aggregation or null handling
  -> mapper interface
  -> MyBatis SQL
  -> source tables, date boundary, first-attempt rule, and grouping unit
  -> caller/frontend calculation or batch snapshot
```

Compare semantics, not just names. For every count/rate identify:

- numerator and denominator;
- unit: content, student, day, week, or member;
- time source and inclusive boundary;
- first attempt versus review;
- B2B versus B2C identity mapping;
- inactive/deleted lesson filtering;
- `null` versus numeric zero.

## Change and review rules

- Diagnose only when asked to review. Do not edit source unless explicitly asked.
- Prefer the smallest change that aligns every producer of the same metric.
- Update SQL, mapper/DTO, service calculation, and tests together only when each is actually affected.
- Do not weaken active-record filters merely to make totals match.
- Do not copy credentials, tokens, or raw secret values from local documents into output or this skill.
- Treat direct production `SELECT` as a separate human-authorized validation step. Provide read-only SQL with explicit date/member filters and no mutation.
- After changes, run focused tests/builds plus `git diff --check`; report anything not executed.

## Result format

Lead with the conclusion, then list:

1. current evidence with repository, branch/HEAD, symbol, and refreshed line;
2. root cause or unresolved policy conflict;
3. exact minimal file/symbol/condition changes;
4. removals from earlier work, if any;
5. validation SQL/tests and environment caveats;
6. deployment/verification state.
