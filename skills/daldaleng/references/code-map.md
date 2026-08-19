# LMS API code map

Paths are relative to `daldal-english-api`. Refresh line numbers before citing.

## Entry and service

- `src/main/java/com/miraenchoco/frontApi/chococlass/controller/v1/ChococlassExternalController.java`
  - `/today`, `/weekly`, `/weekly/students`, `/monthly`, `/monthly/students`
- `.../service/ChococlassExternalTodayServiceImpl.java`
- `.../service/ChococlassExternalWeekServiceImpl.java`
- `.../service/ChococlassExternalMonthServiceImpl.java`

## SQL

- `src/main/resources/mapper/chococlass/ChococlassExternalTodayMapper.xml`
  - `getTodayLearningStudents`
- `src/main/resources/mapper/chococlass/ChococlassExternalWeekMapper.xml`
  - `getWeeklyAttendance`
  - `getWeeklyComplete`
  - `getWeeklyStudentAttendance`
  - `getWeeklyStudentLearning`
  - `getWeeklyStudentAnswerRate`
- `src/main/resources/mapper/chococlass/ChococlassExternalMonthMapper.xml`
  - `getMonthlyAttendance`, `getMonthlyComplete`
- `src/main/resources/mapper/schedule/MmbrScheduleMapper.xml`
  - `getMmbrScheduleReportWeekIncompleteCnt`; API report completion denominator filters lesson `DEL_YN='N'` and `USE_YN='Y'`.

## DTOs and mapper interfaces

Search under:

```text
src/main/java/com/miraenchoco/frontApi/chococlass/dto/
src/main/java/com/miraenchoco/frontApi/chococlass/mapper/
```

Do not stop at SQL. Check service-side de-duplication, rounding, null handling, fixed week loops, and the frontend's derived calculation.

## 2026-08-19 source landmarks

These are navigation hints only:

- week mapper: first-attempt filters near `getWeeklyComplete`, `getWeeklyStudentLearning`, and `getWeeklyStudentAnswerRate`.
- week service: distinct request-student denominator in `getWeeklyLearning`; student answer rate in `getWeeklyStudentLearning`.
- month service: fixed `for (week = 1; week <= 5)` and no-report score normalization require review.
- month mapper: calendar-day `FLOOR((DAY(date)-1)/7)+1` conflicts with arbitrary Monday-to-Sunday request windows.
