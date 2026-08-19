# Dooray #174: Chococlass LMS API

Dooray mapping last confirmed 2026-08-18:

- project ID: `4271874883715387917`
- visible ticket: `#174`
- post ID: `4383612710882412425`

Always refetch the post and comments. The latest Ahn Hyo-eun comment outranks the supplied TXT Q&A, XLSX contract, and older DOCX review when they conflict.

## Latest confirmed five-item direction

1. `/today`: distinguish `READY` from `OFFLINE` using today's entry/login evidence.
2. `/weekly`: include `incompleteCnt`; return Monday as `MON` and retain the full requested weekday range.
3. `/weekly/students`: `completeRate` must distinguish no answer history (`null`) from all-wrong (`0`). Latest implementation interpretation uses correct answers / answered questions, despite the older field name and older completion-days definition.
4. `/monthly`: include `incompleteCnt`; a range such as 7/6–8/2 must produce four request-relative weeks, not five calendar buckets.
5. `/monthly/students`: no evaluation means `avgScore=null`, not `0`; prevent the reported HTTP 500.

## Confirmed current-source checkpoints (2026-08-19)

- API branch was `fix/lms-api`; HEAD `98fea86` contained today/weekly/weekly-students work.
- `application-local.yml` was a pre-existing user modification. Preserve it.
- Week SQL already used `TML.ROUND = 1` for completed learning and answer-rate aggregation.
- Week class aggregation used distinct request students as denominator and completed-student sets as numerator.
- Student `completeRate` returned `null` with no answered question, otherwise rounded correct/answer percentage.

Recheck all facts: branches and source drift.

## Semantic checks

### Completion

- Completion: at least one concept or evaluation lesson completed.
- Count at first completion only: `TML.ROUND = 1`; review/retry must not inflate counts.
- `/weekly` is class/student-count based.
- `/weekly/students` `learning.mon` through `sun` are per-student completed-content counts.

### Attendance

- Denominator is distinct non-null `studentUids` supplied by the caller.
- Attendance is distinct students with login evidence for each date.
- Rates are integer percentages rounded from count / denominator.

### Ambiguity to expose

Older Q&A defined weekly student `learning.completeRate` as completed days / attendance days. The latest Dooray comment and current implementation use answer correctness. Do not silently combine them. If the newest comment is still ambiguous, state the field-name/meaning mismatch and request contract confirmation before expanding the change.

## Documents

Historical files may exist in `C:\Users\onflou\Downloads`:

- `달달영어 문의사항 답변_수정본.txt`
- `초코클래스_연동정의서_코멘트.xlsx`
- `초코클래스연동.docx`

Read only when needed. Never reproduce embedded secrets.
