# Project history and rationale

This is dated context, not current-state proof.

## 2026-08-18 to 2026-08-19: LMS ticket #174

- The LMS API contract was reconciled across a TXT Q&A, commented XLSX, older DOCX, and Dooray.
- Decision rule established: latest Ahn Hyo-eun Dooray comment wins when artifacts conflict.
- API work on branch `fix/lms-api`, commit `98fea86`, covered `/today`, `/weekly`, and `/weekly/students` changes.
- The only observed uncommitted API file was user-owned `application-local.yml`; it was intentionally excluded.
- `/monthly` and `/monthly/students` remained follow-up areas at review time.
- No source/commit observation was treated as QA, staging, production, or runtime verification.

Why `ROUND = 1` exists: learning tables retain review/retry attempts. Product counts initial completion, so later rounds must not inflate content totals or answer rate.

Why `null` matters: no assessment is different from a real zero score. Converting absence to zero misrepresents participation and distorts class averages.

Why request students are the denominator: the LMS passes subscribed service students. Database membership alone may include users outside the requested class/service population.

## 2026-08-18: ranking ticket #183

- A B2C member's personal completion displayed 100%, but batch ranking placed the member below the expected position.
- Trace showed the API report and batch rank used different content populations: API excluded inactive lessons while batch CTEs did not consistently do so.
- Minimal correction direction was to align batch weekly/monthly active lesson filters, not to broaden the API report to inactive content.
- Production SQL was discussed as read-only validation only; source review did not claim live-DB validation.

## Operational lesson

Rank/report bugs often come from population drift rather than arithmetic. Compare date range, member population, content population, attempt round, grouping unit, and null policy before rewriting formulas.
