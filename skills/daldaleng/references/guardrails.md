# Do and do not

## Do

- Inspect the actual checked-out source and diff on every turn.
- Refresh Dooray before using a ticket as policy or status evidence.
- Map visible ticket number to post ID explicitly.
- Identify the exact aggregation unit and denominator for every field.
- Compare weekly and monthly variants when changing shared ranking rules.
- Preserve user-owned config and unrelated dirty changes.
- Show minimal symbol-level edits and what earlier work should be removed.
- Use explicit, read-only, narrow SQL for live validation.
- Test boundary dates, duplicate student IDs, no activity, all wrong, review attempts, inactive lessons, and cross-month ranges.

## Do not

- Do not answer from cached source, old line numbers, or this reference alone.
- Do not assume the TXT/XLSX/DOCX is newer than Dooray.
- Do not equate `DEL_YN='N'` with active content; check `USE_YN` where policy requires it.
- Do not count `COUNT(*)` until join multiplicity is proven.
- Do not convert absent scores to `0` when the contract requires `null`.
- Do not filter the ranking population before the window function when reproducing one member's rank.
- Do not change both API and batch just to force matching numbers; first identify the authoritative population.
- Do not expose secrets found in attachments or local configuration.
- Do not claim staging, QA, production, or verification from a commit/build alone.
- Do not modify code during a review-only request.
