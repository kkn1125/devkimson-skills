# Repository map

Default local roots on the user's Windows workstation:

| Area | Path | Primary use |
|---|---|---|
| API | `D:\kimson\02_workspace\02_miraen\daldal-english-api` | LMS endpoints, personal report data, DTO/service/mapper logic |
| Batch | `D:\kimson\02_workspace\02_miraen\daldal-english-batch` | weekly/monthly rank generation and scheduled snapshots |
| Backoffice | `D:\kimson\02_workspace\02_miraen\daldal-english-backoffice` | administrative UI/API integration |

The path may move. Locate rather than inventing a path when absent.

## Useful discovery commands

```bash
git status --short --branch
git log -5 --oneline --decorate
rg -n -e 'ChococlassExternalController' -e 'reportView' -e 'getMmbrWeekRkList' src
rg -n -e '@PostMapping' -e '<select id=' src/main
```

Run through Git Bash on this machine when practical:

```powershell
& "C:\Program Files\Git\bin\bash.exe" -lc '...'
```

## Evidence hierarchy

For current behavior: checked-out source + current diff. For current business policy: latest authoritative Dooray comment. Attachments and these references are supporting history. A commit proves only repository history; it does not prove build, QA, staging, production, or runtime correctness.
