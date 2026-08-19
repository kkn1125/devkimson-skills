# Dooray #183: report and ranking mismatch

Dooray mapping last confirmed 2026-08-18:

- visible ticket: `#183`
- post ID: `4401688154468678124`

Refetch before relying on policy or status.

## Business rule

Ranking is partitioned by member type (`B2C`, `B2B`) for active members who logged in during the target period and completed the basic diagnostic.

```text
total score = schedule progress rate + login rate + learning correctness rate
order = total score DESC, average solve time ASC, stable member tie-breaker
```

Weekly schedule progress uses the previous-week range from `TB_MMBR_SCHEDULE_WEEK`. Ranking generation is in batch; report/personal values are read through API. Matching labels do not guarantee matching filters.

## Relevant source

Batch, relative path:

```text
src/main/resources/mapper/RankMapper.xml
  getMmbrWeekRkList
    V1_Login
    V2_Schedule
    V3_Score
  getMmbrMonthRkList
    V2_WeekScore
    V2_Schedule
    V3_Score
```

API comparison:

```text
src/main/resources/mapper/schedule/MmbrScheduleMapper.xml
  getMmbrScheduleReportWeekIncompleteCnt
```

## Root-cause pattern observed

The API personal-report denominator excluded inactive lessons using:

```sql
LL.DEL_YN = 'N'
AND LL.USE_YN = 'Y'
```

Batch rank progress/score paths included schedule details or lesson rows without consistently applying the active-lesson predicate. This can lower a member's batch progress rate while the personal report shows 100%, changing the rank. `D.DEL_YN='N'` does not prove the referenced lesson is active.

## Minimal-fix review

Do not patch a remembered line alone. Search all weekly and monthly CTEs that count schedule detail or join `TB_LRN_LESSON`.

- Weekly `V2_Schedule`: join/filter active lesson rows before `COUNT` and completion sum.
- Weekly `V3_Score`: add `L.USE_YN='Y'` if correctness must follow the same active content population.
- Monthly `V2_WeekScore`: apply the same schedule-detail deletion and active-lesson population rules.
- Monthly `V3_Score`: keep the same active-lesson predicate as weekly.

Changing only the API to include inactive lessons is generally the wrong direction: it makes the displayed completion metric less faithful to service-active content. Confirm this policy in the live ticket before implementation.

## Tie behavior

Current ranking SQL used `ROW_NUMBER()` partitioned by member type and ordered by total score, average elapsed time, then member sequence. Verify whether product expects unique sequential ranks or shared ranks (`RANK`/`DENSE_RANK`) before changing window functions.
