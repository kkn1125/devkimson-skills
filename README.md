# devkimson-skills

개인 에이전트 스킬 저장소입니다.

스킬은 `skills/<skill-name>/SKILL.md` 구조로 관리하며 이름은 소문자 하이픈 형식만 사용합니다.

- [`ui-ux-evidence-review`](skills/ui-ux-evidence-review/SKILL.md): 화면·코드·실제 브라우저를 근거로 UI/UX 문제의 심각도와 확신도를 구분합니다. 기존 `ui-review`와 별도 스킬이며 `$ui-ux-evidence-review`로 호출합니다.

```powershell
npx skills add onfloukimson/devkimson-skills --list
npx skills add onfloukimson/devkimson-skills -g -a codex -a gemini-cli -a cursor --skill '*' -y
npx skills ls -g -a codex -a gemini-cli -a cursor
```

## ECC Codex 스킬

ECC의 모든 분야를 기존 스킬과 별도로 `ecc-` 이름으로 제공합니다. [전체 목록](ECC_CATALOG.md)과 [원본 대응표](ecc-manifest.json)에서 이름·원본 경로·커밋·라이선스를 확인할 수 있습니다.

| 원본 종류 | 추가 스킬 |
| --- | ---: |
| 분야별 스킬 | 311 |
| Codex core 전용 스킬 | 1 |
| 에이전트 절차 | 71 |
| 명령 절차 | 97 |
| 언어·공통 규칙 묶음 | 22 |
| 개발·조사·검토 모드 | 3 |
| 범용 디버깅·카탈로그 | 2 |
| 합계 | 507 |

45개 core 중복 변형은 해당 스킬의 참고 문서로 보존했습니다. 원본은 [affaan-m/ECC](https://github.com/affaan-m/ECC), 버전 `2.2.3`, 커밋 `76aaa77df6adc5b889e689007bf99b9a4f74af34`입니다. 개별 설치에도 출처와 MIT 라이선스가 포함됩니다.

### 선택과 사용

- 디자인·UI: `ecc-frontend-design-direction`, `ecc-design-system`, `ecc-frontend-a11y`, `ecc-make-interfaces-feel-better`
- 검토: `ecc-code-reviewer`, `ecc-react-reviewer`, `ecc-pr-test-analyzer`, `ecc-silent-failure-hunter`
- 디버깅: `ecc-systematic-debugging`, `ecc-build-error-resolver`, 언어별 build resolver
- 테스트: `ecc-tdd-workflow`, `ecc-e2e-testing`, `ecc-verification-loop`, 언어별 testing
- 그 외 리서치·글쓰기·마케팅·재무·물류·과학·네트워크 등은 `ecc-catalog`에서 찾습니다.
- 스킬·명령 이름이 겹치는 경우 명령은 `ecc-command-*`로 구분합니다.

로컬 저장소에서 목록을 확인하고 필요한 스킬을 선택해 설치할 수 있습니다. 설치는 별도 사용자 작업이며 이식 도구는 전역 설치를 하지 않습니다.

```powershell
npx skills add . --list
npx skills add . -g -a codex --skill ecc-catalog ecc-systematic-debugging ecc-code-reviewer ecc-tdd-workflow -y
```

설치 후 Codex에서 `$ecc-systematic-debugging`처럼 호출합니다. 기본 자동 선택은 유지하며, 원본의 명시적 호출 정책은 보존합니다. [Codex의 초기 스킬 목록에는 예산 제한이 있으므로](https://learn.chatgpt.com/docs/build-skills) 필요한 스킬부터 설치하는 편이 좋습니다.

### Codex 적용 범위

- 짧은 `SKILL.md`에서 구체적인 분야별 절차와 참고 문서를 선택해 읽습니다.
- 현재 도구와 프로젝트 규칙을 따릅니다. Git Bash 우선, 실패 시 PowerShell을 사용합니다.
- KPA의 상태·교훈·계획은 MCP로 처리하며, 다른 저장소는 그 저장소의 기록 권위를 따릅니다.
- 자동 위임·고정 모델·고정 커버리지·시간 경과 승인·자동 커밋·리뷰 게시를 요구하지 않습니다.
- Claude 전용 자동 관찰기·훅·외부 실행기는 Codex 기능으로 가장하지 않습니다. 이런 분야는 원본의 도메인 항목과 Codex 절차를 구분하고 실제 의존성을 확인합니다.
- 보조 스크립트는 보존했지만 일괄 실행 검증하지 않았습니다. 제공자 API·외부 서비스·별도 공유 런타임·자격 증명은 설치나 제공을 가정하지 않습니다.
- 규칙 묶음은 필요할 때 참고하는 스킬이며, 자동 적용되는 프로젝트 규칙이나 설치된 훅이 아닙니다.

### 검증과 재생성

```powershell
npm ci --ignore-scripts
npm test
npm run ecc:validate
node scripts/import-ecc.cjs --source C:/path/to/reviewed/ECC --output C:/path/to/new-staging
```

재생성 도구는 기존 `ecc-` 스킬·카탈로그·manifest를 덮어쓰지 않습니다. 검토한 원본을 별도 staging에 생성한 뒤 변경을 검토합니다. upstream 코드를 실행하거나 최신 커밋을 자동 신뢰하지 않습니다. YAML 파싱에는 검증 도구용 `yaml` 개발 의존성 하나를 사용합니다.

검사는 이름·메타데이터·개별 설치 경계·라이선스·원본 대응·파일 해시·내부 참조와 회귀 사례를 확인합니다. 전체 스킬의 행동·외부 서비스·운영 호환성을 입증하지는 않습니다.
