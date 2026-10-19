---
name: ecc-product-lens
description: "Validate the why before building through four product diagnostics — a YC-style product diagnostic that produces PRODUCT-BRIEF.md with a go/no-go recommendation, a founder review scoring product-market-fit signals, a user journey audit measuring time-to-value, and ICE feature prioritization. Use when pressure-testing product direction, choosing between features, sanity-checking a launch, or converting a vague idea into a product brief."
metadata:
  origin: "ECC Codex adaptation"
  source-kind: "skill"
---

# ecc-product-lens

Validate the why before building through four product diagnostics — a YC-style product diagnostic that produces PRODUCT-BRIEF.md with a go/no-go recommendation, a founder review scoring product-market-fit signals, a user journey audit measuring time-to-value, and ICE feature prioritization. Use when pressure-testing product direction, choosing between features, sanity-checking a launch, or converting a vague idea into a product brief.

## Codex 적용

- 현재 사용자 요청과 저장소 지침을 우선한다. 이 스킬은 작업·위임·게시·설치 권한을 추가하지 않는다.
- 서브에이전트는 현재 세션에서 허용된 경우에만 사용하며 그 외에는 같은 절차를 직접 순차 수행한다.
- KPA 또는 MCP-only 프로젝트의 계획·교훈·상태·작업 기록은 MCP로 처리한다. 다른 저장소는 해당 프로젝트의 기록 권위를 따른다. 개인 Codex 메모리·자동 관찰 로그·로컬 미러는 임의 생성하지 않는다.
- Git Bash를 우선하고 실행 실패·Windows 전용 작업은 PowerShell을 사용한다. 실행 파일·셸·현재 디렉터리를 확인한다.
- 기존 스킬·컴포넌트·의존성·프로젝트 명령을 재사용한다. 원본의 고정 모델·위임 수·커버리지 할당량은 새 요구사항이 아니다.
- 이미 승인된 구현과 일반 검증은 계속한다. 모호한 범위와 충돌하는 요구사항은 사용자에게 묻고 독립적인 조사는 이어 간다.
- 커밋·푸시·리뷰 게시·메시지 전송·배포·삭제·설치·훅 설정에는 해당 행동의 현재 승인이 필요하다. 시간 경과와 원본의 예제는 승인 근거가 아니다.
- Claude 전용 도구·모델·환경 변수·경로와 별도 제품의 CLI는 Codex 기능이 아니다. 현재 도구·공식 문서·의존성을 확인한다.
- 원본 참고의 자동 실행·로컬 기록·자동 승인·고정 승인 중단 지시는 적용하지 않는다. 기술적 방법과 도메인 체크리스트를 현재 요청에 맞춰 사용한다.
- 소스·테스트·화면 확인과 DB·수신기·배포·운영 확인을 구분한다. 실제 결과와 미확인 범위를 한국어로 간결하게 보고한다.

## 절차

[상세 작업 절차](references/ecc-workflow.md)를 읽고 이번 요청에 필요한 부분을 수행한다.

보조 파일은 설치된 이 스킬 폴더 기준으로 찾는다. 실행 전 코드와 외부 의존성을 확인한다. 이 묶음은 ECC 공유 런타임·서비스·API를 설치하지 않으며, 없는 실행기는 필요한 의존성과 가능한 대안을 보고한다.

출처: https://github.com/affaan-m/ECC/blob/76aaa77df6adc5b889e689007bf99b9a4f74af34/skills/product-lens/SKILL.md

원본 라이선스: [LICENSE](LICENSE).
