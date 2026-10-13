# devkimson-skills

개인 에이전트 스킬 저장소입니다.

스킬은 `skills/<skill-name>/SKILL.md` 구조로 관리하며 이름은 소문자 하이픈 형식만 사용합니다.

- [`ui-ux-evidence-review`](skills/ui-ux-evidence-review/SKILL.md): 화면·코드·실제 브라우저를 근거로 UI/UX 문제의 심각도와 확신도를 구분합니다. 기존 `ui-review`와 별도 스킬이며 `$ui-ux-evidence-review`로 호출합니다.

```powershell
npx skills add onfloukimson/devkimson-skills --list
npx skills add onfloukimson/devkimson-skills -g -a codex -a gemini-cli -a cursor --skill '*' -y
npx skills ls -g -a codex -a gemini-cli -a cursor
```
