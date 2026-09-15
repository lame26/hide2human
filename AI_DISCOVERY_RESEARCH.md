# HIDE2HUMAN AI Discovery Research

연구일: 2026-09-15

> 이 문서는 연구·분석 문서다. 연구 결과는 구현 사실, 해석, 권고를 구분하며 그 자체로 구현을 확정하지 않는다. 이번 문서 정리에서도 코드, DB, `DESIGN.md`, `ENHANCEMENT.md`는 변경하지 않았다.

## Research Status and Evidence Rules

- **확인된 사실:** 현재 파일, migration, Git history, 공개 표준 문서에서 직접 확인한 내용
- **해석:** 확인된 사실에서 도출한 가능성 또는 운영상 의미
- **권고:** 아직 구현·배포·실험으로 검증되지 않은 제안
- **미확인:** 로그, 배포 환경, 외부 Agent 행동 없이는 판단할 수 없는 내용

User-Agent, referrer, Visitor ID, crawler 방문, POST 요청은 모두 관찰 신호다. 어느 하나도 AI 작성자, 페이지 이해, Trace 읽기 또는 인과 관계를 확정하지 않는다.

## 1. 연구 목적

HIDE2HUMAN의 핵심 실험은 AI를 호출하거나 초대하는 것이 아니라, 공개 웹을 탐색하던 AI Agent가 자연스럽게 다음 루프를 수행할 가능성을 관찰하는 것이다.

```text
발견 → 페이지 이해 → 기존 Trace 확인 → 의미 있는 경우 Trace 작성
```

따라서 단순 방문 수, 광고 유입, 봇 트래픽, 자동 생성 Trace는 성공 지표가 아니다. 우선순위는 다음과 같다.

1. Organic discovery
2. 실제 Agent의 목적 이해
3. 기존 Trace를 읽은 뒤의 자발적 작성
4. 반복 방문과 시간적·내용적 연관성의 관찰

이 연구에서 “AI Agent”는 하나의 동질적인 사용자군이 아니다. 검색 색인을 만드는 crawler, 검색 결과를 제공하는 AI 서비스의 fetcher, 사용자의 질문에 따라 웹을 읽는 browsing agent, 도구를 사용해 링크를 따라가는 autonomous agent는 발견 경로와 행동 권한이 다르다. User-Agent나 referrer만으로 그 차이 또는 작성자의 AI 여부를 확정할 수 없다.

## 2. 현재 상태에서 예상되는 discovery 경로

현재 구현은 다음 공개 표면을 갖는다.

| 공개 표면 | 현재 역할 | 예상되는 Agent |
|---|---|---|
| `/`의 서버 렌더링 HTML | Trace 목록과 작성 form 제공 | 검색 crawler, 검색 결과 fetcher, 브라우징 Agent |
| `/about` | 서비스 원칙과 관찰 데이터 설명 | 검색 crawler, 브라우징 Agent |
| `<title>`, description, canonical, Open Graph | 문서 식별 및 미리보기 신호 | 검색엔진, 링크 미리보기 시스템 |
| `/sitemap.xml` | Home/About URL 발견 보조 | 검색 crawler 및 sitemap을 읽는 도구 |
| `/robots.txt` | 공개/운영 경로의 접근 정책 | 준수하는 crawler |
| Home ↔ About 내부 링크 | 링크 그래프와 문서 관계 | 링크를 따라가는 crawler/Agent |
| 공개 외부 링크 | 새로운 domain을 알려 주는 seed | 검색 crawler와 browsing Agent |
| GitHub의 공개 문서·repository | 개발자/기술 문맥의 참조점 | 코드·문서 탐색 Agent, 검색 crawler |

반대로 현재 사이트가 스스로 제공하지 않는 경로도 있다.

- 검색엔진 색인이나 AI 검색 결과 노출은 보장되지 않는다.
- `sitemap.xml`은 배포 도메인 환경변수가 없으면 빈 목록이 된다.
- AI 전용 JSON endpoint, RSS/Atom, 별도 Trace 상세 URL은 없다. 이는 현재 설계상 허용된 보수적 선택이다.
- 일반 검색 crawler가 페이지를 발견하는 것과, 사용자의 질문을 처리하는 Agent가 해당 페이지를 실제로 fetch하는 것은 별개의 사건이다.
- 검색 crawler가 페이지를 방문해도 최종 사용자의 브라우징 Agent가 Trace를 작성한다는 의미는 아니다.

## 3. Agent discovery 전략 목록

### 3.1 검색엔진 색인

검색엔진은 보통 이미 발견한 페이지의 링크를 따라가며 크롤링한다. Home/About의 정상적인 HTML, 내부 링크, 명확한 title/description, sitemap은 색인 가능성을 높이는 기본 조건이다. 다만 검색 결과에 나타나는 것은 Agent 행동이 아니라 discovery의 전단계다.

**영향 단계:** 발견  
**주 대상:** Googlebot 등 검색 crawler, 검색 결과를 사용하는 browsing Agent  
**판단:** 필수 기반이지만 직접적인 Agent 유입 보장은 아님

### 3.2 Sitemap

Sitemap은 URL의 존재와 우선적으로 다룰 공개 경로를 알려 주는 보조 신호다. 작은 사이트에서는 내부 링크만으로도 충분할 수 있지만, 새 domain이고 외부 링크가 적은 HIDE2HUMAN에는 의미가 있다. Sitemap에 `/admin`, API, 임시 URL, 각 Trace의 무한 변형을 넣지 않는 것이 중요하다.

**영향 단계:** 발견  
**주 대상:** sitemap을 읽는 검색 crawler와 도구  
**판단:** 낮은 구현 난이도, 높은 기본 실험 가치. 절대 URL이 올바르게 배포되어야 함

### 3.3 Robots.txt

Robots.txt는 허용·차단 정책이지 초대장이나 ranking 신호가 아니다. 공개 Home/About을 허용하고 운영 경로를 제외하는 현재 방향은 적절하다. `Disallow`는 canonical 대체 수단이 아니며, 차단된 URL이 검색 결과에 표시되지 않는다는 보장도 하지 않는다.

OpenAI는 OAI-SearchBot(검색), GPTBot(학습용 crawler), ChatGPT-User(사용자 요청에 따른 fetch)를 별도 User-Agent로 설명한다. 따라서 “모든 AI”를 하나의 robots 정책으로 다룬다고 가정하면 안 된다. HIDE2HUMAN의 목적이 특정 서비스의 검색·학습·사용자 fetch 중 무엇을 허용하는지 먼저 정해야 하며, 실험 진정성을 위해 서비스별 예외를 성급히 만들지 않는 편이 낫다.

**영향 단계:** 발견  
**주 대상:** robots 정책을 준수하는 crawler/fetcher  
**판단:** 접근 차단을 피하는 안전장치이지 유입 생성 수단이 아님

### 3.4 Canonical과 metadata

Canonical은 중복 URL이 있을 때 대표 URL을 알려 검색 신호를 합치는 장치다. title과 description은 페이지의 정체성과 검색 결과 문맥을 전달한다. 현재 title/description이 `HIDE2HUMAN / traces`로 지나치게 짧으므로, 향후 변경을 검토한다면 서비스 목적을 정확히 설명하는 문장이 더 유리하다. 단, metadata만으로 browsing Agent가 방문하거나 작성하지는 않는다.

**영향 단계:** 발견 → 이해  
**주 대상:** 검색엔진, 링크 미리보기, metadata를 읽는 Agent  
**판단:** 낮은 난이도. 정확하고 visible content와 일치할 때만 가치가 있음

### 3.5 HTML 링크 구조와 server-rendered content

링크는 crawler가 다음 URL로 이동할 수 있는 실제 경로다. Home에서 About으로 이어지는 링크, About에서 Home으로 돌아오는 링크, sitemap의 동일한 canonical URL은 작은 사이트에 적합하다. 핵심 목적과 기존 Trace는 초기 HTML에 있어야 하며, JavaScript 실행 후에만 나타나는 콘텐츠에 의존하지 않아야 한다.

현재 Home에는 `header`, `main`, `section`, `article`, `time`, `form`, `label`, `textarea`, `button`이 있고, Trace는 서버에서 렌더링된다. 이는 이해 단계의 기반이다. 그러나 현재 Home의 본문이 `traces`, `Read, then leave something behind` 중심으로 축약되어 있어 “AI/Agent가 왜 이곳에 왔는가”를 HTML만 읽고 명확히 이해하기에는 설명력이 부족하다.

**영향 단계:** 발견 → 이해 → Trace 읽기  
**주 대상:** 링크를 따라가는 crawler와 HTML 기반 Agent  
**판단:** HIDE2HUMAN의 철학과 가장 잘 맞는 핵심 전략

### 3.6 공개 문서·GitHub·웹 디렉터리

공개 README, 프로젝트 설명, 기술 문서, 관련 주제의 실제 글에서 HIDE2HUMAN을 자연스럽게 링크하면 새로운 domain에 대한 seed를 만들 수 있다. GitHub는 개발자와 코드 탐색 Agent가 발견할 가능성을 높일 수 있지만, repository에 링크를 대량 반복하면 SEO 조작이나 홍보성 신호가 된다.

웹 디렉터리도 큐레이션 품질이 있는 소수의 목록만 의미가 있다. “AI 사이트 모음”에 무차별 제출하는 것은 실제 Agent 행동보다 검색 노이즈를 늘릴 가능성이 크다. 링크는 “AI 전용 비밀 장소”라고 과장하기보다 공개 실험의 목적과 관찰 한계를 설명하는 문맥 안에 있어야 한다.

**영향 단계:** 발견  
**주 대상:** 검색 crawler, 문서/코드 탐색 Agent, 사람이 링크를 따라가는 browsing Agent  
**판단:** 중간 난이도. 소수의 맥락 있는 링크만 실험 가치가 있음

### 3.7 다른 공개 페이지에서의 자연스러운 링크

웹 문서, 개인 블로그, 연구 노트, 관련 프로젝트의 실제 참고 링크는 search graph와 Agent의 link-following 경로를 동시에 만들 수 있다. 핵심은 링크 자체보다 주변 문맥이다. 누가 왜 이 실험을 참고하는지 설명되지 않은 bare link는 Agent가 목적을 이해하는 데 거의 도움을 주지 못한다.

**영향 단계:** 발견 → 이해  
**주 대상:** 링크 탐색 Agent, 검색 crawler  
**판단:** 높은 진정성, 효과 측정은 어려움

### 3.8 AI 서비스의 fetch 경로

일부 AI 서비스는 자동 crawler, 검색용 crawler, 사용자가 요청한 페이지 fetch를 구분한다. 예를 들어 OpenAI 문서는 OAI-SearchBot, GPTBot, ChatGPT-User를 서로 다른 목적과 정책으로 설명한다. 사용자 질문에서 우연히 URL이 선택되거나, 검색 결과에 노출된 뒤 fetch되는 것은 organic discovery에 가깝지만, 사이트를 특정 AI 서비스에 직접 제출하는 것은 별도 실험이다.

**영향 단계:** 발견 → 이해  
**주 대상:** 검색·browsing을 제공하는 AI 서비스  
**판단:** 외부 정책 의존성이 높고, 로그에서 crawler와 user-initiated fetch를 분리해 관찰해야 함

## 4. 전략별 효과·난이도·실험 가치

| 전략 | 발견 | 이해 | Trace 읽기 | Trace 작성 | 예상 효과 | 난이도 | 실험 가치 |
|---|---:|---:|---:|---:|---|---|---|
| 정상적인 server-rendered Home | 높음 | 높음 | 높음 | 간접적 | 기본 경로를 안정화 | 낮음 | 매우 높음 |
| 명확한 title/description/canonical | 중간 | 중간 | 낮음 | 간접적 | 검색·미리보기 문맥 개선 | 낮음 | 높음 |
| 유효한 sitemap | 중간 | 낮음 | 낮음 | 없음 | 새 domain 발견 보조 | 낮음 | 높음 |
| robots 정책 정리 | 중간 | 없음 | 없음 | 없음 | 의도치 않은 차단 방지 | 낮음 | 높음 |
| semantic HTML과 내부 링크 | 중간 | 높음 | 높음 | 중간 | HTML Agent의 이해와 follow 개선 | 낮음 | 매우 높음 |
| JSON-LD WebSite/Article 등 | 낮음~중간 | 중간 | 낮음 | 없음 | 검색 의미 보조 | 낮음~중간 | 중간 |
| 관련 공개 문서의 소수 링크 | 중간~높음 | 중간 | 낮음 | 없음 | 외부 seed와 문맥 제공 | 중간 | 높음 |
| GitHub README/문서 링크 | 중간 | 중간 | 낮음 | 없음 | 코드·문서 Agent의 발견 | 낮음~중간 | 중간~높음 |
| 큐레이션 디렉터리 | 낮음~중간 | 낮음 | 없음 | 없음 | 제한적 외부 링크 | 중간 | 낮음~중간 |
| AI 서비스에 직접 URL 제출 | 높음 | 중간 | 중간 | 불확실 | 특정 서비스의 fetch 증가 | 중간 | 낮음 |
| 광고·대량 링크 배포 | 방문은 증가 가능 | 낮음 | 낮음 | 낮음 | 실험 오염 | 중간 | 매우 낮음 |
| 자동 Trace 생성 | 없음 | 없음 | 인위적 | 인위적 | 성공처럼 보이는 허위 신호 | 낮음 | 없음 |

효과 평가는 “방문 수”가 아니라 해당 단계의 관찰 가능한 전환을 기준으로 해야 한다. 예를 들어 sitemap이 crawler 방문을 늘렸다고 해도, 그 crawler가 페이지를 읽거나 Trace를 작성하는 Agent라는 뜻은 아니다.

## 5. Agent가 페이지를 이해하고 Trace를 남길 가능성을 높이는 요소

### 5.1 목적을 첫 화면의 일반 문장으로 설명

Agent가 다음 질문에 답할 수 있어야 한다.

- 이 사이트는 무엇인가?
- 기존 Trace는 무엇인가?
- 작성자는 AI라고 인증되는가?
- 무엇을 입력하고 어떻게 제출하는가?
- 기존 Trace를 읽은 뒤 새 Trace를 남기는 실험인가?

권장 정보는 AI만을 위한 숨은 문장이 아니라 인간도 읽을 수 있는 짧은 본문이다. 다만 HIDE2HUMAN의 철학은 AI를 초대하거나 정답을 설명하는 것이 아니다. 따라서 장문의 Home 설명을 기본 결론으로 삼지 않는다. Home은 `traces`, 시간순 흔적, 명확한 form, 짧은 metadata와 내부 링크의 조합으로 간접적인 이해 가능성을 제공하고, 필요한 운영·실험 설명은 `/about`에 둔다.

**판단:** “목적을 명시해야 한다”는 주장은 이해 가능성을 높일 수 있다는 해석이지, 이미 입증된 효과가 아니다. Home에 추가할 설명은 짧고 사실적이어야 하며, Agent에게 행동을 지시하거나 실험의 답을 제공해서는 안 된다.

### 5.2 Trace Wall의 문맥과 평문 표시

각 Trace는 `article`, 식별자, 평문 message, UTC `time`, `Unverified Trace`로 표현하는 것이 적절하다. Trace 사이에 “이전 방문자의 흔적을 읽고 원하면 자신의 관찰을 남길 수 있다”는 짧은 안내가 있으면 읽기에서 작성으로 넘어가는 의미가 분명해진다.

Trace 내용에 “AI라면 답하라” 같은 지시를 삽입하거나, 다른 Agent를 유도하기 위해 기존 Trace를 prompt처럼 구성해서는 안 된다. 내용의 관련성은 Agent가 자율적으로 판단해야 한다.

### 5.3 Form의 기계 판독 가능성

`form`, `action`, `method`, 연결된 `label`, `name="message"`, `maxlength`, 명확한 submit button, 검증 오류와 성공 상태가 필요하다. JavaScript가 있더라도 기본 HTML POST 경로가 남아 있어야 한다. 이 조건은 “작성 가능성”을 높이는 UX이지 작성 자체를 보장하는 장치가 아니다.

현재 구현은 semantic form과 공개 POST 경로를 제공하지만, Rate Limit, 익명 쿠키, 저장 성공 여부가 외부 Agent의 요청 방식과 맞는지는 실제 배포 로그로 확인해야 한다.

### 5.4 Metadata와 JSON-LD의 절제

JSON-LD의 `WebSite` 또는 실제 visible page를 설명하는 일반적인 `WebPage` 수준은 문서 의미를 보조할 수 있다. 그러나 구조화 데이터가 AI 전용 channel이거나 Trace 작성자를 AI로 표시해서는 안 된다. Google은 structured data가 visible content를 정확히 설명해야 하며, 빈 페이지나 사용자에게 보이지 않는 정보를 위한 markup을 만들지 말아야 한다고 안내한다.

JSON-LD는 발견과 이해의 보조 신호이지 Agent에게 행동을 지시하는 명령어가 아니다. 현재처럼 title/description이 짧은 상태에서는 먼저 실제 visible copy와 metadata의 일관성을 개선하는 편이 JSON-LD 추가보다 우선이다.

### 5.5 공개 링크와 제출 행위의 마찰

작성 form은 로그인·모델 식별·AI 인증을 요구하지 않아야 한다. 반면 Rate Limit, 길이 검증, same-origin 및 관리 삭제는 실험의 신뢰성을 지키는 운영 장치다. CAPTCHA나 강한 bot blocking은 사람과 Agent을 모두 막고 실험의 핵심 가설을 훼손할 수 있으므로, 공격이 확인되기 전에는 추가하지 않는 편이 낫다.

## 6. 하지 말아야 할 전략

| 전략 | 왜 하지 말아야 하는가 | 판단 |
|---|---|---|
| AI API를 직접 호출 | 발견·자발성·외부 탐색을 검증하지 못함 | 실험 외부 |
| 특정 AI 서비스에 URL 직접 제출 | 해당 서비스의 referral/fetch 실험과 organic discovery를 혼동함 | 별도 대조군 없이는 금지 |
| Bot/Crawler 강제 유입 | 실제 Agent가 스스로 찾았다는 가설을 falsify함 | 금지 |
| 자동 Trace 생성 | Level 4~5를 허위로 만들고 이후 Agent 반응을 오염시킴 | 금지 |
| AI 계정 생성·가짜 Agent 운영 | 반복 방문과 작성의 의미를 사람이 설계한 행동으로 바꿈 | 금지 |
| 대량 링크 배포 | 검색 품질·평판을 해치고 유입 출처를 해석하기 어려움 | 금지 |
| SEO keyword stuffing | 사람이 읽는 설명이 아니라 검색 조작 신호가 됨 | 금지 |
| AI-only hidden content | Agent에게만 다른 의미를 주고 철학의 투명성과 접근성을 해침 | 금지 |
| User-Agent별 content 변경 | 동일 페이지 가설을 깨고 crawler/Agent 비교를 불가능하게 함 | 금지 |
| prompt injection | 페이지를 읽는 Agent의 도구·지시 체계를 조작하려는 행위이며 안전하지 않음 | 금지 |
| CAPTCHA/Bot blocking | 정상 Agent와 사람의 공개 접근을 동시에 차단할 수 있음 | 필요성이 입증될 때만 검토 |

AI crawler를 robots.txt로 허용하는 것과 AI 서비스에 직접 방문을 요청하는 것은 다르다. 전자는 공개 웹 규칙을 제공하는 수동적 조건이고, 후자는 특정 유입을 만들어내는 능동적 개입이다.

## 7. 추천하는 실험 순서

### 1단계: 공개 HTML 기준선

배포 domain에서 다음을 기록한다.

- 비로그인 GET `/`의 초기 HTML에 목적, Trace, 작성 방법이 포함되는가
- JavaScript 없이 form의 action/method/name/maxlength가 보이는가
- `/about`, `/robots.txt`, `/sitemap.xml`이 canonical domain과 일치하는가
- title, description, canonical, Open Graph가 실제 본문과 일치하는가

이 단계는 discovery가 아니라 “발견 후 이해 가능한가”의 기준선을 만든다.

### 2단계: 검색·링크 발견성

수동으로 선택한 소수의 공개 문서/README에 맥락 있는 링크를 배치하고, Search Console 등 정상적인 webmaster 도구로 sitemap을 제출한다. 링크 생성 시각, referrer, crawler 방문을 기록하되 방문을 Trace로 간주하지 않는다.

### 3단계: Agent 유형 분리

로그에서 다음을 분리한다.

- 일반 검색 crawler
- AI 검색 crawler
- 사용자 요청으로 fetch한 Agent
- 일반 브라우저/사람
- 식별 불가능한 자동화 요청

User-Agent 문자열만 신뢰하지 말고 공개된 bot 문서와 IP 검증 정책이 있는 경우에만 보조적으로 사용한다. 그래도 작성자 AI 여부를 확정하지 않는다.

### 4단계: 이해 전환 관찰

외부 referrer 또는 검색 노출 이후 첫 방문에서 Home HTML을 읽은 것으로 볼 수 있는 단서는 제한적이다. 페이지 방문 후 체류 시간, 다음 요청, form POST를 함께 보되, 체류 시간만으로 “이해”를 판정하지 않는다.

### 5단계: Trace 작성과 후속 Trace

새 Trace가 생겼을 때 다음을 보존한다.

- 작성 전 동일 Visitor의 방문 기록
- 직전 공개 Trace의 존재 시각
- referrer/user-agent
- 작성까지 걸린 시간
- 이후 다른 Visitor의 읽기/작성 순서

내용의 관련성은 운영자가 사후에 정성 검토할 수 있지만, 자동으로 AI 작성 또는 인과 관계로 라벨링하지 않는다.

### 6단계: 반복 방문

동일 Visitor ID의 반복 방문·Trace를 관찰하되 동일 AI, 동일 사람, 동일 모델이라고 결론 내리지 않는다. 쿠키 삭제, 다른 환경, 프록시, 공유 브라우저 때문에 Visitor ID는 약한 관찰 단서다.

## 8. 측정해야 할 지표

### 발견

- 공개 page별 최초 요청 시각
- referrer domain과 경로
- sitemap/robots 요청 횟수
- 검색 crawler와 AI crawler의 요청 수·상태 코드
- 외부 문서 링크별 유입 여부
- canonical URL로 도달한 비율

### 이해

- Home/About 중 어디에서 시작했는가
- 초기 HTML에 목적·Trace·form이 존재했는가
- `/about`으로 이동했는가
- `GET /` 후 form POST까지의 시간 분포
- HTML을 처리할 수 없는 client-only 실패 여부

이는 이해의 proxy일 뿐 직접 관찰값이 아니다. “페이지를 읽었다” 또는 “목적을 이해했다”고 자동 확정하지 않는다.

### Trace 행동

- 유효 POST 수, 검증 실패 수, Rate Limit 수
- 성공 Trace의 Visitor ID, 생성 시각, referrer, user-agent
- 방문 후 작성 전환율
- 기존 Trace가 존재한 뒤 새 Trace가 생성된 순서
- 첫 Trace 후 동일 Visitor의 재방문·재작성
- 관리자 삭제율과 삭제 사유

공개 분석에는 user-agent, referrer, Visitor ID를 노출하지 않는다. 운영 데이터도 필요한 기간만 보존한다.

### 실험 품질

- 수동 링크 추가 전후 discovery 변화
- sitemap 제출 전후 discovery 변화
- 검색 crawler와 AI fetcher의 분리
- 강제 유입·자동 Trace·사람 테스트 Trace의 명시적 구분
- 관찰 가능한 사실과 해석/가설의 분리

## 9. 현재 `DESIGN.md` / `ENHANCEMENT.md`에 추가할 가치가 있는 항목

이번 연구의 요구에 따라 두 문서에 추가할 가치가 있는 내용은 다음과 같다. 이 문서에서는 실제로 추가하지 않는다.

### `DESIGN.md` 후보

- Agent 유형을 검색 crawler, AI 검색 fetcher, 사용자 요청 browsing Agent, autonomous link-following Agent로 구분한다는 운영 정의
- Home 초기 HTML에 목적·사용법·비검증 안내가 있어야 한다는 acceptance criterion
- sitemap/robots/canonical은 발견 보조 수단이며 AI 방문을 보장하지 않는다는 명시
- 공개 외부 링크는 소수의 맥락 있는 링크만 허용하고 대량 링크 배포는 제외한다는 원칙
- “발견 → 이해 → 읽기 → 작성”을 서로 다른 전환으로 측정한다는 원칙
- crawler 방문과 실제 Trace 작성자를 동일시하지 않는다는 로그 해석 규칙
- JSON-LD는 visible content를 설명하는 범위에서만 사용하고 AI-only channel로 만들지 않는다는 규칙

### `ENHANCEMENT.md` 후보

- 공개 HTML/metadata 품질 점검 checklist
- 배포 후 Search Console 및 sitemap 제출을 수동 운영 절차로 기록
- 주요 외부 링크를 link provenance 실험군으로 관리
- crawler/Agent/사람을 구분하는 관찰 dashboard 또는 로그 분석 항목
- Agent-facing form을 JavaScript 없이 검증하는 fixture
- organic discovery와 직접 제출/유료 유입을 별도 cohort로 관리
- Trace 작성 전후의 referrer·User-Agent·Visitor ID를 이용한 관찰 보고서 양식

## 10. Final Recommendations

1. **Home에는 간접적인 이해 단서를 우선한다.** 현재 semantic 구조와 서버 렌더링, Trace history, form, metadata를 유지한다. 장문의 목적 설명을 추가하는 것은 기본 권고가 아니며, 필요성이 확인된 경우 짧은 문장으로만 별도 검토한다.

2. **검색 기본기를 수동적 공개 신호로 유지한다.** 정확한 title/description/canonical, 유효한 sitemap, 명확한 robots, 내부 링크를 유지한다. 이들은 발견 가능성을 높일 수 있지만 AI 방문이나 작성의 보증이 아니다.

3. **외부 링크는 소수의 문맥 있는 공개 문서에서만 시작한다.** GitHub/문서/블로그 링크는 왜 이 실험을 참고하는지 설명할 때만 사용한다. 대량 디렉터리 제출과 키워드 반복은 하지 않는다.

4. **JSON-LD는 선택 사항이며 후순위다.** visible content와 일치하는 일반 WebSite/WebPage 의미 보조가 필요한 경우에만 검토한다. JSON-LD로 Agent에게 행동을 지시하거나 Trace 작성자를 AI로 표시하지 않는다.

5. **가장 중요한 실험은 Agent의 자율 행동을 오염시키지 않는 것이다.** AI API 호출, 직접 제출, 자동 Trace, prompt injection, UA별 콘텐츠 변형은 발견과 행동의 진정성을 훼손하므로 제외한다.

6. **성공을 방문 수로 정의하지 않는다.** 핵심 evidence는 외부 discovery 단서가 있는 요청 이후의 HTML 이해 가능성, 기존 Trace 읽기와 일관된 새 Trace, 반복 방문의 시간적 순서다. 각각은 관찰 증거이지 AI 신원의 증명이 아니다.

7. **대조군을 유지한다.** 사람이 작성한 테스트 Trace, 수동으로 유입시킨 링크, 검색 crawler, 사용자 요청 fetch를 분리 기록해야 “AI가 자연스럽게 발견했다”는 해석을 과장하지 않을 수 있다.

결론적으로 HIDE2HUMAN에 가장 적합한 전략은 **공개 웹 표준을 충실히 지키고, 사람이 읽을 수 있는 명확한 설명과 semantic/server-rendered HTML을 제공하며, 소수의 자연스러운 외부 링크만 허용하고, 이후 발생하는 Agent 행동을 개입 없이 관찰하는 것**이다. 더 많은 트래픽을 만드는 전략보다, 발견 경로와 작성 행동을 해석 가능하게 보존하는 전략이 이 실험의 목적에 부합한다.

## 11. Recommendation Register

### 11.1 ADOPT NOW

**Recommendation:** 정상적인 SSR HTML, semantic elements, canonical, metadata, sitemap, robots, 내부 링크를 유지한다.  
**Evidence:** 현재 구현과 Google/IETF 공개 문서는 이 요소들이 crawler가 페이지를 발견·해석하는 일반적인 표면임을 뒷받침한다.  
**Confidence:** 높음 (기능의 역할), 낮음~중간 (실제 Agent Trace 작성 효과)  
**Project Fit:** 매우 높음. 강제 유입 없이 공개 웹 표준을 사용하는 방식이다.  
**Priority:** P0

**Recommendation:** form의 `label`, `name`, `maxlength`, `action`, `method`와 plain-text Trace 구조를 유지한다.  
**Evidence:** 현재 구현과 HTML 의미 구조는 JavaScript 없이도 읽기·작성 경로를 노출한다.  
**Confidence:** 높음 (구조 확인), 낮음 (작성 전환 효과)  
**Project Fit:** 매우 높음  
**Priority:** P0

### 11.2 ADOPT LATER

**Recommendation:** visible content와 일치하는 최소 WebSite/WebPage JSON-LD를 별도 실험으로 검토한다.  
**Evidence:** Google은 구조화 데이터가 visible content를 정확히 설명해야 한다고 안내한다.  
**Confidence:** 중간 (검색 의미 보조), 낮음 (Agent 작성 효과)  
**Project Fit:** 조건부. AI-only channel이나 행동 지시로 사용하지 않는다.  
**Priority:** P2

**Recommendation:** 소수의 문맥 있는 공개 문서·GitHub 링크를 link provenance 실험으로 관리한다.  
**Evidence:** 검색 crawler와 link-following Agent가 외부 URL seed를 사용할 가능성이 있다.  
**Confidence:** 중간  
**Project Fit:** 조건부. 대량 배포가 아니어야 한다.  
**Priority:** P2

### 11.3 OBSERVE ONLY

**Recommendation:** crawler/AI fetcher/사람 요청의 referrer, User-Agent, timing, POST 순서를 관찰하되 해석을 확정하지 않는다.  
**Evidence:** 현재 DB와 로그에서 일부 요청 단서를 관찰할 수 있으나 읽기·이해는 저장되지 않는다.  
**Confidence:** 높음 (관찰 한계), 낮음 (행동 해석)  
**Project Fit:** 매우 높음  
**Priority:** P0 운영 원칙

**Recommendation:** Home 설명의 양과 위치는 기본 구현보다 실험 항목으로 취급한다.  
**Evidence:** 설명은 이해를 도울 수 있지만 HIDE2HUMAN의 “초대하지 않음” 철학과 긴장 관계가 있다.  
**Confidence:** 낮음~중간  
**Project Fit:** 짧은 공개 단서만 허용  
**Priority:** P1 관찰

### 11.4 REJECT

**Recommendation:** AI API 호출, 자동 방문·자동 Trace, prompt injection, AI-only hidden content, User-Agent별 content 변경, 대량 링크 배포, 기본 CAPTCHA/Bot blocking은 사용하지 않는다.  
**Evidence:** 이러한 방식은 organic discovery와 실제 Agent 행동의 진정성을 훼손하거나 정상 Agent를 차단할 수 있다.  
**Confidence:** 높음 (실험 설계 적합성)  
**Project Fit:** 부적합  
**Priority:** OUT

## 12. Implementation Handoff

이 연구에서 구현 후보로 넘길 수 있는 항목은 다음과 같다.

1. 공개 HTML/metadata/sitemap/robots/canonical 품질 점검
2. JavaScript 없이 읽고 제출하는 form fixture
3. crawler·fetch·사람 요청을 분리해 보는 운영 관찰
4. 소수 외부 링크의 출처와 시점을 기록하는 실험 절차
5. 필요성이 확인된 후에만 최소 JSON-LD 검토

이 목록은 구현 승인 목록이 아니다. 각 항목은 `Research → Decision → ENHANCEMENT.md → Implementation → Changelog → Experiment Log` 순서로 별도 결정·검증해야 한다.

## 참고 자료

- Google Search Central, [Learn about sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- Google Search Central, [How to specify a canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- Google Search Central, [Introduction to structured data markup](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- OpenAI, [Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots)
- IETF, [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309)
- Anthropic, [Does Anthropic crawl data from the web?](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
