# 한국어·영어 조건부 패턴

아래 표현은 점검 후보이며 금지어가 아니다. 삭제하거나 바꿔도 의미·논리·말투·문서 목적이 같을 때만 수정한다. 예시는 허용되는 수정의 한 사례이며 정답 문자열이 아니다.

## 한국어

### 정보 없는 안내와 반복

- `함께 살펴보도록 하겠습니다`, `이처럼 중요한 의미가 있습니다`, `앞서 언급했듯이`가 내용을 예고하거나 반복만 하면 줄인다.
- 주제·범위·목적을 알려 주는 유일한 문장이면 그 정보를 남긴다. `이 글에서는 온보딩 절차를 설명합니다`를 `온보딩 절차를 개선해야 합니다`로 바꾸지 않는다. 설명 목적이 개선 주장으로 바뀐다.
- `중요한 것은`, `무엇보다도`, `핵심은`이 우선순위를 실제로 표시하면 남긴다. 강조가 있다는 이유만으로 지우지 않는다.

**교정 예시**

원문: `테스트는 통과했습니다. 다시 말해, 테스트를 통과했습니다.`

수정: `테스트는 통과했습니다.`

중복만 제거한다. 배포·운영 검증까지 완료됐다고 확장하지 않는다.

### 유보 표현과 정중함

- `~라고 할 수 있습니다`, `~으로 보입니다`, `~일 수 있습니다`는 문맥에 따라 추정·능력·가능성을 나타낸다. 단정문으로 일괄 변경하지 않는다.
- `검토할 수 있습니다`는 검토 가능성이다. `검토하겠습니다`라는 약속을 만들어내지 않는다.
- 이메일의 `검토해 주시면 감사하겠습니다`는 정중한 요청이다. 명령형으로 바꾸지 않는다.
- 완곡 표현을 줄일 때도 의사 강도를 유지한다. 예: `다음 주에 검토할 수 있을 것 같습니다` → `다음 주 검토가 가능할 것 같습니다`. 가능성과 추정이 모두 남는다.

### 주어와 피동

- `서버가 요청을 처리합니다`, `이 문서는 세 가지를 다룹니다`, `값이 암호화되어 저장됩니다`는 사용할 수 있다.
- `저장했습니다`의 주체가 문맥에서 분명하면 `제가`를 넣지 않는다.
- `보여지다`처럼 교정 근거가 있는 표현과 `여겨지다`처럼 정상적으로 가능한 표현을 구분한다. `-어지다`가 있다는 이유만으로 이중피동으로 판정하지 않는다.
- 책임 주체가 중요한데 원문에 없으면 원문을 유지하고 필요한 경우 확인 사항으로 표시한다. 임의로 `개발팀`이나 `운영팀`을 넣지 않는다.

### 부사·접속사·대조

- `다시 시도하세요`, `아직 배포하지 않았습니다`, `일부 계정에서만 발생했습니다`의 제한·시간 정보는 보존한다.
- `이후`를 `때문에`로, `관련이 있다`를 `원인이다`로 바꾸지 않는다.
- `따라서`, `하지만`, `또한`은 필요한 논리 연결이면 남긴다. 문단당 개수로 판정하지 않는다.
- `DB 문제가 아니라 캐시 문제입니다`처럼 원인을 구분하는 대조는 보존한다. 정보 없는 극적 반전만 줄인다.
- `효율적`, `다양한`, `혁신적`을 실제 근거로 바꾸려면 그 근거가 입력에 있어야 한다. 없으면 핵심 주장을 유지하고 증거 부족을 표시한다.

## English

### Openers, emphasis, and repetition

- Consider shortening `Here's the thing`, `It's worth noting`, and `At the end of the day` when they add no information or useful voice.
- Cut empty intensifiers and duplicate explanations. Keep words that change time, frequency, scope, degree, or the speaker's confidence.
- Do not turn an overview into a recommendation or remove the only sentence identifying the topic.

**Editing example**

Original: `The tests passed. In other words, the tests passed.`

Edited: `The tests passed.`

This says nothing about deployment or production validation.

### Modality, tense, and voice

- Preserve `may`, `might`, `can`, `could`, `must`, `should`, `will`, `likely`, `not yet`, and `some` when they carry meaning.
- `We could review this next week` must not become `We will review this next week`.
- Passive voice is valid when the actor is unknown, irrelevant, or already clear. Do not invent a human actor for `The backup was restored`.
- Technical subjects are valid: `The server rejects expired tokens` does not need a human subject.
- Preserve polite requests and the original level of formality. Do not add contractions or an opinion merely to sound human.

### Structure and punctuation

- Keep contrasts that distinguish actual alternatives, and keep all required list items. A question can be a real question or a useful section title.
- Use em dashes, headings, fragments, tables, and numbered steps when the document benefits from them. Reduce distracting repetition without blanket bans or quotas.
- Shorter is not automatically better. Keep a longer sentence when it carries necessary conditions or exceptions.

## 혼합 언어·기술 문서·인용

- 적용 언어는 블록의 실제 언어로 판단한다. 한국어 설명에 포함된 API·React·NPS 같은 용어를 임의로 번역하거나 순화하지 않는다.
- 코드와 명령어는 실행하거나 교정하지 않는다. 설명 문장만 다듬는다.
- 인용·인터뷰·브랜드 문구의 의도적 반복은 작성자의 표현이다. 인용 편집이 명시되지 않으면 그대로 둔다.
- 단계 순서가 결과를 바꾸는 절차, 비교 표, 권한 목록은 형식을 유지한다. 산문으로 합쳐 의미를 흐리지 않는다.
