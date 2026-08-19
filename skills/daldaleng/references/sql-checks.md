# Read-only SQL validation patterns

Use these as construction patterns, not copy-paste production queries. First extract the current mapper SQL and bind explicit test values. Run only with authorized read-only access.

## Safety checklist

- `SELECT`/CTE only; no temp-table mutation, procedure, event, lock, or session-wide setting.
- Pin one member/student, one member type, and explicit dates.
- Preserve end-of-day inclusivity exactly.
- Return components (`ALL_CNT`, `END_CNT`, login days, answers, elapsed time), not only the final percentage.
- Run old and candidate predicates side by side.
- Inspect duplicate multiplication after every new join.

## Active-lesson delta

```sql
SELECT
    D.MMBR_SCHEDULE_DTL_SEQ,
    D.LRN_LESSON_SEQ,
    D.DEL_YN AS detail_del_yn,
    L.DEL_YN AS lesson_del_yn,
    L.USE_YN AS lesson_use_yn,
    D.SCHEDULE_ST_CD,
    D.END_ROUND
FROM TB_MMBR_SCHEDULE_DTL D
JOIN TB_LRN_LESSON L
  ON L.LRN_LESSON_SEQ = D.LRN_LESSON_SEQ
WHERE D.MMBR_SCHEDULE_SEQ = :schedule_seq
  AND D.SCHEDULE_ORD BETWEEN :start_ord AND :end_ord
ORDER BY D.SCHEDULE_ORD, D.MMBR_SCHEDULE_DTL_SEQ;
```

Compare counts with and without:

```sql
AND D.DEL_YN = 'N'
AND L.DEL_YN = 'N'
AND L.USE_YN = 'Y'
```

## Ranking reproduction

Copy `getMmbrWeekRkList` or `getMmbrMonthRkList` into a read-only worksheet and replace MyBatis `<choose>` with a literal reference date. Add a final member filter only after keeping the population-wide window calculation; filtering before `ROW_NUMBER()` produces a meaningless rank of 1.

Good pattern:

```sql
WITH ranked AS (
  -- current ranking query through its ROW_NUMBER expression
)
SELECT *
FROM ranked
WHERE MMBR_SEQ = :member_seq;
```

For a reported user, compare batch components against API `allCnt/endCnt` using the same week boundary. A matching total alone can hide compensating errors.

## Monthly request-relative week

Calendar formula `FLOOR((DAY(event_date)-1)/7)+1` is unsuitable when a request crosses months. Use request start as the bucket anchor after policy confirmation:

```sql
FLOOR(DATEDIFF(DATE(event_date), DATE(:start_date)) / 7) + 1
```

Also restrict to `DATE(event_date) BETWEEN DATE(:start_date) AND DATE(:end_date)` and derive the number of returned weeks from the inclusive request range rather than a fixed five.
