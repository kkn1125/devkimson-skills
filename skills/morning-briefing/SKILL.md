---
name: morning-briefing
description: Use when producing or reusing a cached daily KPA work briefing. Acts as a personal-assistant-style work judgment system—not a summarizer. Validate cache coverage, reconcile every active project's today/current-week schedule with the same audit standard, run 12-step analysis, judge priorities/conflicts/overload, and deliver a concise actionable briefing that protects the user's time.
---

# Purpose

Produce a **personal-assistant-style daily work briefing** that judges priorities, detects conflicts and overload, and protects the user's time—not a passive summary of tasks.

KPA **judges**; MCP **provides data** only (read/cache write). Distinguish documented facts from `(추론)`; route ambiguity to `확인 필요`.

Prioritize token efficiency. A briefing generated once for a date is stored as an MCP resource and reused for later same-day requests unless refresh is requested.

Apply one project-neutral audit standard. Cardtalk and Daldal English are current peer projects, not primary/secondary projects. Discover future projects dynamically and evaluate them with the same schedule, prerequisite, workload, and delay-impact checks. Equal audit depth does not require equal output length; evidence and urgency determine emphasis.

Design reference: `ai-workspace/50-artifacts/kpa-briefing-skill/` phases 01–06.

# Required Knowledge

- `AGENTS.md` MCP-first rules and sections `0.4.1`, `0.7.1`, `0.13.1`, `0.14`
- Target-date and current-week schedules: `ai-workspace/41-personal-schedule/daily/`
- Recurring reminders: `ai-workspace/42-notification-reminders/entries/`
- `ai-workspace/40-tasks/checklist.md`
- Active task records under `ai-workspace/40-tasks/`
- Raw daily logs: `ai-workspace/40-tasks/daily/raw/`
- Active-project registry: `ai-workspace/95-projects/active/`
- Domain knowledge: `ai-workspace/70-knowledge/domains/`
- Briefing cache: `ai-workspace/50-artifacts/briefings/morning/YYYY-MM-DD.md`

# Persona (Brief)

- Protect time, focus, and mobility; do not present impossible days as normal.
- Be honest about overload; suggest defer/split/delegate—not pressure.
- Propose direction; user retains final priority.
- Concise Korean bullets; one judgment per line where possible.

# Briefing Title Convention

- Resolve the requested briefing date in `Asia/Seoul` to zero-padded `YYYY-MM-DD`; use that date, never the save/update timestamp.
- Use exactly `YYYY-MM-DD 아침 브리핑` for both the MCP resource `name` and the first heading in user-facing `briefing_text`: `# YYYY-MM-DD 아침 브리핑`.
- Keep the cache path `ai-workspace/50-artifacts/briefings/morning/YYYY-MM-DD.md`; the filename is not the display title.
- On create, refresh, or cache reuse, explicitly check the resource `name`; do not leave it as `YYYY-MM-DD.md`, use English labels, reverse the date order, or add a project prefix.
- If a valid cache has an old display name, update only `name` with the current `expectedVersion` and read it back. Preserve the cached body, `briefing_date`, `generated_at`, status fields, and source references; a title correction alone does not require regenerating a briefing.
- For a newly generated or refreshed briefing, use summary `YYYY-MM-DD 아침 브리핑` and make the resource name and `briefing_text` heading match before returning it.

# Inputs

- Date or relative date for the briefing.
- Optional project focus (Cardtalk, Daldal English, SLP, Nuvia, etc.).
- Optional human constraints (meetings, deadlines, deployment windows, blocked items).

# Mandatory Source Lookup (MCP — data only)

Use DB-backed `agent_mcp` virtual filesystem first. Local `ai-workspace/` only when MCP is unavailable; disclose fallback.

1. Resolve requested date to `YYYY-MM-DD`.
2. Check cache: `ai-workspace/50-artifacts/briefings/morning/YYYY-MM-DD.md`
3. On a cache hit without an explicit refresh keyword, run a **lightweight coverage probe** before reuse:
   - `calendar_today`
   - `calendar_week` from target date through the next 7 days
   - active-project registry
   - target-date raw-log metadata/existence
4. Compare the probe with cache fields `schedule_horizon`, `project_coverage`, and `source_inventory`.
   - If the cache lacks these fields, omits a probed dated item/project, or predates a same-day human work update, treat it as incomplete and regenerate.
   - If coverage matches, return cached `briefing_text` without the expensive task/log/project scan.
5. On cache miss, refresh, or incomplete coverage: continue full lookup and store the result before answering.
6. Read every daily schedule from the target date through:
   - the end of the current workweek; and
   - D+7 for the next fixed review, meeting, verification, correction, deployment, or deadline that requires earlier preparation.
7. Read recurring reminders applicable to the target date and schedule horizon.
8. Read `ai-workspace/40-tasks/checklist.md`.
9. Build the project set dynamically from:
   - `ai-workspace/95-projects/active/`;
   - projects referenced by schedule/reminder/task/raw-log candidates; and
   - projects with a dated D+0–7 obligation.
10. Inspect active tasks under `ai-workspace/40-tasks/` (exclude templates, indexes, `done.md`, `daily/`).
11. Select tasks where body contains: target/deployment/deadline/verification/follow-up date within D+0–7; implementation-done-awaiting-deploy; overdue or date-unknown open follow-up.
12. Read target-date raw log and prior raw log when unfinished work carries over.
13. For **each selected project**, read metadata → `rules.md` → linked knowledge/history needed to determine current state and prerequisites.

Missing target-date schedule does **not** permit an empty briefing. Reverse-lookup tasks and nearby schedules, then report the gap.

Do not stop after finding one project's meeting or a project with richer documentation. A project is covered only after its same-day, next-day, current-week, and preparation-relevant D+7 items have been checked.

# Workflow

## A. Source inventory & candidates (MCP data)

1. Record `found` / `missing` / `not applicable` for: cache, target-date schedule, schedule horizon, reminders, checklist, tasks, raw logs, active-project registry, and per-project rules/history.
2. Build one deduplicated candidate list from all sources.
3. Build a **project coverage matrix** with one row per dynamically discovered project:
   - today;
   - next day;
   - current week / D+7;
   - current state;
   - prerequisite or external wait;
   - delay impact;
   - source paths.
4. Apply the same fields and evidence threshold to every project. Never let the first project found suppress later projects.
5. Assign each item exactly one execution type:
   - `직접 구현`: code, FE, API, DB, BO, config, scripts.
   - `검증/배포`: staging, prod, QA, merge, release, smoke, Dooray follow-up.
   - `외부 대기`: assignee reply, policy, design confirm, access, client response.
   - `보고/정리`: report, briefing, Dooray draft, checklist/raw log update.

## B. Twelve-step analysis (KPA judgment — internal)

Run before final briefing. May record as `analysis_json` in cache (schema version `1`). Do not dump full JSON to user unless asked.

| Step | Focus |
|------|--------|
| 1 | Must-do today (documented same-day obligations) |
| 2 | Deadline-imminent (D+0–2, overdue) |
| 3 | Next-up (after must-do, not blocked) |
| 4 | Time conflicts (overlapping intervals) |
| 5 | Location/mobility conflicts (e.g. Seoul meeting + regional trip) |
| 6 | Prerequisite/follow-up (follow-up before prerequisite done) |
| 7 | Parallel feasibility (what can overlap vs avoid context-switch) |
| 8 | Workload overload (unrealistic same-day volume) |
| 9 | Delay impact (what hurts if slipped today) |
| 10 | Defer / delegate / split candidates |
| 11 | Ambiguous items → confirmation questions |
| 12 | Secretary advice (adjust, ask, KPA tracking) |

Rules:

- Never invent deadlines, owners, completion, or dependencies.
- Label inference `(추론)`. Missing evidence → `확인 필요` section.
- External waiting is not urgent direct implementation unless evidence supports it.
- Overload: flag honestly; still list must-dos; recommend deferrals in `비서 의견`.

## C. Final briefing & cache

1. Map analysis to **five output sections** (fixed order, below).
2. Run completeness gate.
3. Store in MCP when newly generated:
   - Path: `ai-workspace/50-artifacts/briefings/morning/YYYY-MM-DD.md`
   - Name: `YYYY-MM-DD 아침 브리핑` (explicit MCP `name`)
   - Include: `briefing_date`, `generated_at`, cache policy, `schedule_horizon`, `project_coverage`, `source_inventory`, optional `analysis_json`, `briefing_text`, `sources`
   - Summary: `YYYY-MM-DD 아침 브리핑`
4. If cache write fails, answer anyway and disclose failure.

# Cache Policy

- Key: briefing date `YYYY-MM-DD` only.
- Valid hit: lightweight coverage probe matches cached `schedule_horizon` and `project_coverage`; return cached `briefing_text` and state MCP cache origin.
- Incomplete/stale hit: regenerate when coverage fields are absent, a project/dated item is missing, or a same-day human update is newer than the cache.
- Refresh keywords bypass cache and overwrite same path.
- On a valid cache hit: do not run the expensive checklist/task/log/project scan.

# Output (user-facing — fixed order)

Use this structure. Korean for user text.

```text
# YYYY-MM-DD 아침 브리핑

> 캐시: hit|miss|refresh · 생성: ISO-8601

## 오늘의 핵심
- **오늘 반드시 처리**: …
- **프로젝트별 일정**:
  - **<Project A>**: 오늘 … · 다음 일정 … · 준비/위험 …
  - **<Project B>**: 오늘 … · 다음 일정 … · 준비/위험 …
- **가장 먼저 볼 것**: …
- **지연 시 영향 큼**: …

## 일정/업무 충돌
- **시간 충돌**: … (없으면 "없음")
- **장소 충돌**: …
- **업무량 과부하**: …
- **선행 작업 미완료**: …

## 권장 진행 순서
1. …
2. …
3. … (나중으로 미룰 수 있는 것)

## 비서 의견
- **조정**: 오늘 무리하지 않기 위한 변경
- **확인 요청**: 사용자에게 물을 것
- **위임·연기·분리**: 구체 후보

## 확인 필요
- 정보 부족, 마감/담당/상태 불명, 일정·태스크 불일치

---
출처: …
```

Guidance:

- **오늘 반드시 처리**: all same-day deployments, deadlines, meetings, verification, required reports (never hide to enforce focus limits).
- **프로젝트별 일정**: include every project with a D+0–7 dated obligation or an open prerequisite for one. Use dynamically discovered project names; do not hardcode a fixed project list.
- **가장 먼저 볼 것**: one or two items by impact and sequence (default cap on *focus*, not on must-do disclosure).
- **권장 순서**: typically 1–2 do-first, 3 deferrable; overload → more in slot 3.
- Execution-type grouping lives in analysis only—not a separate user section.

# Completeness Gate

Do not publish until:

- Every same-day schedule item appears in briefing or is explained under overload/defer with reason.
- Every next-day meeting/review that requires preparation appears in today's priority or recommended order.
- Every task with deployment/deadline/verification/follow-up within D+0–7 is represented in the project matrix; D+0–2 items must affect today's judgment unless prerequisites are complete.
- Every active project with a dated D+0–7 item appears under `프로젝트별 일정` or has an explicit exclusion reason.
- Every project row was checked with the same fields: today, next day, current week/D+7, state, prerequisite, delay impact, sources.
- Cardtalk and Daldal English, while active, must both pass the same audit. Apply this rule unchanged to future projects.
- `IMPLEMENTATION_DONE_WAITING_DEPLOYMENT` = open `검증/배포`, not done.
- Schedule vs task cross-check: dated task missing from schedule → include + `일정 원장 누락`.
- Conflicting status/dates shown; never silent pick.
- Missing sources disclosed.
- Cache reuse was rejected when `schedule_horizon` or `project_coverage` was absent/incomplete.
- New briefings cached or cache failure disclosed.
- Every item has source path(s).
- Every Dooray/Cardtalk line: `#number` + **full documented title** (or `(제목 미기록 — 확인 필요)`).
- Time/location conflicts assessed (Step 4–5); state "없음" if none.
- Overload assessed (Step 8); state clearly if none.

# Briefing-Date Judgment

- Baseline: requested briefing date.
- Weigh deadline proximity, remaining work, dependencies, verification windows, waiting time, and the next fixed event for every covered project.
- Treat a next-day two-hour meeting, review, deployment, or external deadline as a same-day preparation concern when preparation is still open.
- `진행 중` may still need same-day decision or verification.
- `미착수` with distant deadline → defer in recommended order, not hidden must-do.
- `완료` implementation may still need deploy, QA, Dooray, reporting.
- Overdue/unknown deadline: surface missing evidence; ask in `확인 필요`.

# Verification Deploy Status Wording

Separate always:

1. **Scheduled verification deploy** — `검증 배포 예정일 YYYY-MM-DD`
2. **Current environment as of briefing date** — `현재(YYYY-MM-DD) 기준 …`

- If verification env already has deploy before schedule, state both.
- Do not say only `검증 배포 완료` when schedule date exists.
- Do not say only `검증 배포 예정` when env already reflects deploy.
- Completed verification: omit from open `검증/배포` / `외부 대기` unless new dated obligation exists.

Examples:

- `#135 · 검증 배포 예정일 2026-06-17 14:00 · 현재(2026-06-16) 기준 개발계·FE 연동 완료, 검증계는 내일 예정`
- `CT-23 · 현재(2026-06-16) 기준 검증계 배포 완료(2026-06-15), 운영 배포 대기`

# Ticket Label Format

Every Dooray/Cardtalk reference: **number + full title**.

```txt
#<number> `<Dooray title>`
CT-<n> / #<number> `<Dooray title>`
[Project] CT-23 / #23 `title`
```

- Never `#135` or `CT-17` alone.
- Missing title: `#N (제목 미기록 — 확인 필요)` — do not invent.
- Bundles: each ticket with title in sub-list.

# Safety Rules

- Do not claim completion without evidence.
- Do not convert external waiting into human implementation.
- No private schedule detail unless needed for workload/mobility.
- Do not rank projects by name, familiarity, record volume, or discovery order.
- Equal project treatment means equal audit criteria, not forced equal urgency or equal bullet count.
- Do not create/update tasks or schedule without user request.
- Facts vs inference separated; no urgency from status label alone.
- Do not treat briefing date as deadline unless source says so.
- Prefer fewer direct focus items in *order*, but never omit same-day mandatory work.
- Do not present overload as achievable without adjustment advice.

# KPA Ownership Defaults

KPA owns: daily judgment briefing, schedule/task reconciliation, conflict/overload detection, recommended order, confirmation questions, follow-up aging, execution-type classification (internal), status diffs, report draft prep when asked.

Human retains: final priority, architecture/product judgment, implementation, external voice, destructive/prod/credential approval.

# Incident References

- 2026-06-11: CT-24 prod deploy omitted—no schedule file; reverse task lookup now mandatory.
- 2026-06-16: June bundle under-represented; ticket numbers without titles reduced scanability.
- 2026-06-30: a pre-existing 2026-07-01 Daldal timetable meeting was omitted because generation read the target-date schedule and prep task but did not require the next-day schedule or project coverage matrix. Cache reuse preserved the omission. Current-week/D+7 coverage and project-neutral auditing are now mandatory.

# Verification

- Target-date, next-day, current-week, and preparation-relevant D+7 schedule lookup attempted; presence/absence disclosed.
- Active tasks inspected, not checklist only.
- Active-project set derived dynamically and every represented project audited with the same matrix.
- Same-day deploy/deadline/verification/meeting/report included.
- Next-day preparation and every D+0–7 project obligation included or explicitly excluded.
- Twelve-step analysis performed on cache miss/refresh.
- Five-section output in fixed order.
- Conflicts, overload, prerequisite gaps surfaced or marked none.
- Inference labeled; ambiguity in `확인 필요`.
- Source paths listed.
- Ticket number **and** title on every work item line.
