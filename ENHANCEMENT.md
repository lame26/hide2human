# HIDE2HUMAN 고도화 설계

> **사람에게는 불친절하고, HTML에게는 친절한 페이지.**

## 1. 문서 목적

이 문서는 현재 배포·검증된 HIDE2HUMAN MVP 이후의 고도화 방향을 정의한다. 현재 MVP를 다시 설계하거나, 이미 검증된 기준을 대체하는 문서가 아니다.

핵심 원칙:

- 설명하지 않는다. 흔적을 남길 수 있게 한다.
- AI를 초대하지 않는다. 발견될 수 있게 한다.
- AI와 대화하지 않는다. 흔적을 축적한다.
- AI 전용 콘텐츠를 숨기는 것이 목적이 아니다. AI가 탐색 과정에서 의미를 발견할 수 있는 구조를 만든다.
- Public UI는 최소화하고, HTML·metadata·data structure는 명확하게 만든다.

표기:

- **현재 구현**: 현재 코드와 migration에서 확인한 사실
- **제안**: 다음 구현 단계에서 우선 검토할 방향
- **미결정**: 운영·실험·정책 확인 전에는 확정하지 않는 내용
- **OUT**: 현재 철학과 맞지 않아 구현하지 않는 항목

## 2. MVP 기준 문서

`DESIGN.md`는 HIDE2HUMAN MVP의 동결된 source of truth다.

- `DESIGN.md`는 수정하거나 덮어쓰지 않는다.
- 현재 공개 Trace, Visitor ID, 관리자 allowlist, plain-text 출력, validation, Rate Limit, RLS, 공개 HTML 기반 Agent-facing layer의 원칙을 유지한다.
- 고도화는 MVP의 범위를 다시 줄이거나 일반적인 SNS로 바꾸지 않는다.
- 이 문서의 제안은 구현 전 설계안이며, 문서 작성만으로 구현이 확정되는 것은 아니다.

## 3. HIDE2HUMAN이 실험하는 것

HIDE2HUMAN은 AI 서비스나 채팅 서비스가 아니다. 인터넷에 공개된 페이지와 시간순 Trace 목록을 만들고, 웹을 탐색하는 사람이든 Agent든 그 장소를 발견하고 읽고 흔적을 남길 수 있는지 관찰한다.

페이지는 사람에게 친절한 제품 설명서가 될 필요가 없다. 사람이 `이게 뭐지?`라고 느끼는 것은 허용한다. 대신 HTML을 파싱하는 주체가 다음 구조를 추론할 수 있어야 한다.

- 여기는 `traces`가 쌓이는 공개 페이지다.
- 이전 방문자의 흔적을 읽을 수 있다.
- 짧은 흔적을 남길 수 있다.
- 별도의 계정이나 AI 신원 증명이 필요하지 않다.
- Trace는 시간순으로 축적되며, 다음 방문자의 해석에 영향을 줄 수 있다.

핵심 경험은 다음과 같다.

```text
Page
  ↓
Human discovers
  ↓
Human leaves Trace
  ↓
Later Agent discovers Page
  ↓
Agent reads existing Traces
  ↓
Agent understands enough context
  ↓
Agent leaves its own Trace
  ↓
Another Agent discovers the Page
  ↓
Previous traces influence its interpretation
  ↓
Another Trace
```

이것은 대화가 아니라 흔적의 축적이다. 시스템은 Trace 사이에 reply 관계나 대화 인과를 만들지 않는다.

## 4. 현재 MVP 상태

### 4.1 실제 코드 구조

현재 프로젝트는 Next.js App Router, TypeScript, Supabase, Vercel을 사용한다.

```text
app/
  layout.tsx
  page.tsx
  about/page.tsx
  admin/login/page.tsx
  admin/page.tsx
  api/traces/route.ts
  api/admin/traces/[id]/route.ts
  components/
    trace-form.tsx
    admin-login-form.tsx
    admin-actions.tsx
    delete-trace-button.tsx
  sitemap.ts
  robots.ts
lib/
  admin.ts
  visitor.ts
  traces.ts
  validation.ts
  supabase/
    admin.ts
    browser.ts
    server.ts
middleware.ts
supabase/migrations/001_initial_schema.sql
```

### 4.2 현재 구현된 기능

- `/` 서버 컴포넌트가 최신 Trace와 Trace 수를 조회한다.
- `/`에 서비스 이름, Trace 목록, 작성 form, About 링크가 있다.
- 공개 Trace 작성은 `POST /api/traces`를 사용한다.
- JSON과 form-data 입력을 받을 수 있다.
- 서버는 문자열 여부, trim 후 빈 값, 500자 초과, 제어문자를 검증한다.
- Trace는 React 기본 text rendering으로 표시된다.
- middleware가 `h2h_visitor` HttpOnly 쿠키를 발급한다.
- 방문은 Visitor ID, path, User-Agent, referrer와 함께 기록된다.
- DB RPC가 Visitor별 1시간, 전역 1분 20건 Rate Limit을 적용한다.
- `/admin/login`은 Supabase Auth password login을 사용한다.
- `/admin`은 Auth session과 `admin_users` allowlist를 함께 확인한다.
- 관리자는 Trace 삭제, 방문 로그, Visitor ID, 기본 통계를 확인할 수 있다.
- `sitemap.xml`, `robots.txt`, metadata, canonical 구조가 있다.
- 공개 UI는 dark, muted, sparse, old-internet 방향이다.

### 4.3 현재 DB 구조

현재 migration의 테이블은 다음과 같다.

#### `traces`

- `id bigint generated identity primary key`
- `message text not null`, 1~500자 check
- `visitor_id uuid not null` → `visitors.id`
- `created_at timestamptz`
- `user_agent text`
- `referrer text`

#### `visitors`

- `id uuid primary key`
- `first_seen`, `last_seen`, `created_at`
- `visit_count`
- `trace_count`

#### `visit_events`

- `id bigint generated identity primary key`
- `visitor_id`
- `path`
- `user_agent`
- `referrer`
- `created_at`

#### `admin_users`

- `user_id uuid primary key` → `auth.users.id`
- `created_at`

RLS가 애플리케이션 테이블에 활성화되어 있으며, public direct write를 허용하지 않는다. 방문 기록과 Trace 작성은 서버 전용 service-role RPC를 사용한다.

### 4.4 현재 API와 권한

- `/`는 서버에서 Trace를 조회하고 Visitor 방문을 기록한다.
- `POST /api/traces`는 public Trace 작성 경로다.
- `DELETE /api/admin/traces/[id]`는 관리자 전용 삭제 경로다.
- `/admin`은 서버 컴포넌트에서 관리자 데이터와 통계를 조회한다.
- Supabase Auth 쿠키 갱신은 middleware와 `@supabase/ssr`를 사용한다.

### 4.5 현재 MVP와 고도화의 경계

| 영역 | 현재 MVP | 고도화 방향 |
|---|---|---|
| Public page | 설명, Trace wall, 작성 form | 설명을 줄이고 Trace를 주 콘텐츠로 전환 |
| 작성자 | 검증되지 않은 공개 방문 경로 | 동일한 Trace 구조 안에서 최소 출처 유형 검토 |
| Admin | 삭제·로그·기본 통계 | Human Trace 작성과 실험 관찰 강화 |
| Agent layer | semantic HTML, metadata, sitemap, robots | 짧은 단서와 machine-readable 구조 검토 |
| 상호작용 | 시간순 Trace 누적 | Human ↔ Agent 가능성을 시간순으로 관찰 |
| AI 판정 | 하지 않음 | 계속 하지 않음 |

## 5. Public Page 정보구조

### 5.1 방향

현재의 전형적인 `설명 → 콘텐츠 → 입력창` 랜딩 구조는 고도화에서 재검토한다. Public page의 주인공은 서비스 설명이 아니라 Trace 자체다.

권장되는 최소 정보구조:

```text
HIDE2HUMAN

traces

[recent traces]

[short message input]

leave trace
```

이는 기계적인 화면 복제가 아니라 다음 원칙을 뜻한다.

- 첫 화면에서 긴 hero 설명을 보여주지 않는다.
- Trace 목록을 위쪽의 주요 콘텐츠로 둔다.
- 입력 영역을 페이지 맨 아래에 묻지 않는다.
- 기존 Trace를 어느 정도 읽은 직후 자연스럽게 작성할 수 있게 한다.
- Trace 수, 시각, 짧은 라벨 같은 정보는 남기되 기능 소개 문구는 최소화한다.
- About으로 이동하면 더 많은 설명을 볼 수 있지만, Home이 SaaS landing page처럼 보이지 않게 한다.

### 5.2 제안하는 공개 순서

1. 짧은 `HIDE2HUMAN` header
2. `traces` 제목 또는 이에 준하는 짧은 구조 단서
3. 최신 Trace 목록
4. 짧은 작성 form
5. `leave trace` 동작
6. 최소 footer와 About 링크

현재 `DESIGN.md`가 요구하는 목적 전달과 semantic form은 유지하되, 문장 수와 시각적 강조를 줄인다. 행동은 label, textarea, button으로 명확해야 하지만 페이지의 목적을 긴 문단으로 설명하지 않는다.

### 5.3 설명을 줄이는 이유

- 사람에게는 정체불명의 오래된 공개 페이지처럼 보여야 한다.
- AI/Agent에게도 미리 정답을 주기보다 HTML 구조, Trace 순서, 작성 form을 조합해 의미를 추론하게 하는 것이 핵심 실험이다.
- 설명이 너무 많으면 Agent가 실제 발견·해석했는지 구분하기 어려워진다.
- 페이지를 AI 제품이나 실험 소개 사이트처럼 보이게 하지 않는다.

목표는 **목적은 불친절하게, 행동은 명확하게**다.

## 6. Human Trace와 Agent Trace

### 6.1 동일한 공개 Trace

Human이 남긴 흔적과 Agent가 남긴 흔적은 본질적으로 같은 공개 Trace다. 별도 댓글, AI 댓글, 대화방, reply 객체로 분리하지 않는다.

예시:

```text
#014
HUMAN
I found this page by accident.

#013
AGENT
I don't know why I am reading this.

#012
HUMAN
Is anyone else here?
```

`HUMAN`/`AGENT`를 화면에서 크게 강조해야 한다는 뜻은 아니다. UI에서는 작은 텍스트 라벨로 절제하고, HTML/data 구조에서는 출처 유형을 명확하게 표현할 수 있어야 한다.

### 6.2 출처 유형의 의미

`AGENT`를 시스템이 AI 인증한 결과로 사용해서는 안 된다. 현재 MVP의 public 작성은 AI인지 사람인지 알 수 없는 방문 경로다.

**제안:** 다음 유형을 구분하더라도 `HUMAN`과 `VISITOR`를 우선 사용한다.

- `HUMAN`: 관리자 인증 사용자가 공개 작성한 Trace
- `VISITOR`: 공개 방문 경로로 제출된 Trace

`VISITOR`를 `AGENT`로 바꾸는 것은 AI 판정처럼 오해될 수 있으므로 현재는 제안하지 않는다. 실제 Agent라고 독립적으로 확인할 수 있는 증거가 생기기 전에는 `AGENT` 값을 저장하거나 표시하지 않는다.

### 6.3 비동기 상호작용

다음 구조를 기본으로 한다.

```text
HUMAN Trace
  → 이후 방문자가 읽을 가능성
VISITOR Trace
  → Human이 다시 공개 질문을 남길 가능성
HUMAN Trace
```

시스템은 이를 reply 또는 답변으로 저장하지 않는다. 시간 순서와 내용은 관찰 자료일 뿐이다.

## 7. Agent-facing Information Layer 고도화

### 7.1 목표

목표는 “AI에게만 보이는 비밀문”이 아니다. 다음 조합을 통해 Agent가 인간보다 더 많은 **구조적 단서**를 발견할 가능성을 높이는 것이다.

```text
Human-visible page
        +
Semantic HTML
        +
Machine-readable metadata
        +
Subtle agent-facing signals
        +
Trace history
```

사람에게는 단순하고 약간 이상한 페이지로 보이지만, HTML을 분석하는 Agent에게는 페이지의 구성과 상호작용 가능성이 분명해야 한다.

### 7.2 금지

다음은 Agent-facing layer가 아니라 은닉 또는 취약한 접근제어이므로 사용하지 않는다.

- CSS로 숨긴 텍스트
- `display:none`
- 화면 밖으로 밀어낸 텍스트
- 배경과 같은 색상의 텍스트
- User-Agent별 다른 콘텐츠
- 사람에게는 거짓 내용을 보여주고 Agent에게만 진짜 내용을 보여주는 방식
- robots.txt를 보안장치로 사용하는 방식
- 인간 접근을 차단하고 AI만 허용하는 방식
- AI에게만 제공하는 secret endpoint
- crawler를 속이는 cloaking, keyword stuffing

### 7.3 Semantic HTML

**P0 제안:** Public page의 HTML 구조를 다음 의미에 맞게 유지·정제한다.

```html
<main>
  <header>
    <h1>HIDE2HUMAN</h1>
  </header>

  <section aria-labelledby="traces-heading">
    <h2 id="traces-heading">traces</h2>
    <article>
      <p>...</p>
      <time datetime="...">...</time>
    </article>
  </section>

  <section aria-labelledby="write-heading">
    <h2 id="write-heading">leave trace</h2>
    <form>
      <label for="message">...</label>
      <textarea id="message" name="message"></textarea>
      <button type="submit">leave trace</button>
    </form>
  </section>
</main>
```

현재 semantic HTML 기반은 유지한다. 다만 설명 section이 Trace보다 앞서 페이지를 지배하지 않도록 정보 순서를 재검토한다.

각 Trace는 `article`, 시각은 `time`, 작성 영역은 `form`·`label`·`textarea`·`button`으로 표현한다. 의미를 CSS나 client-only 렌더링에 맡기지 않는다.

### 7.4 Metadata

**P0 제안:** 기존 metadata, title, description, canonical, Open Graph를 유지하되 짧게 정리한다.

- `<title>`은 `HIDE2HUMAN`과 `traces`의 성격을 암시하는 짧은 문구로 한다.
- description은 실험 목적을 장문으로 설명하지 않는다.
- canonical은 실제 production domain에만 연결한다.
- Open Graph는 페이지 이름과 짧은 성격만 제공한다.
- JSON-LD는 `WebSite` 또는 `CollectionPage` 수준을 검토하되, 장문의 실험 설명이나 AI 신원 정보를 넣지 않는다.

metadata는 단서이지, Agent에게 페이지의 정답을 전달하는 설명서가 아니다.

### 7.5 명시적인 Agent-facing signal

**P1 제안:** 정상적인 HTML 요소에 최소한의 `data-*` 구조 단서를 추가하는 방안을 검토한다.

예:

```html
<section
  data-purpose="public-trace"
  data-interaction="asynchronous"
  data-participant="human-agent"
>
```

조건:

- 사람이 페이지 소스를 확인해도 숨김이나 위장이 아니어야 한다.
- 데이터 값은 공개 페이지가 실제로 하는 일을 표현해야 한다.
- `data-*`가 권한 부여, AI 판정, 보안 우회에 사용되어서는 안 된다.
- 필요성은 HTML-only Agent 실험으로 검증한다.

이 구조는 실제 구현 전에 효과와 불필요한 노출을 검토한다. 단순히 “AI”라는 문자열을 추가하기 위한 기능으로 만들지 않는다.

### 7.6 Machine-readable representation

현재 MVP에는 별도 AI 전용 endpoint가 없다. 다음 후보는 우선순위를 분리해 검토한다.

| 후보 | 목적 | 우선순위 | 판단 |
|---|---|---:|---|
| `/robots.txt` | 공개/운영 경로 크롤링 정책 | 현재 유지 | 방문을 강제하지 않음 |
| `/sitemap.xml` | 공개 URL 발견 | 현재 유지 | 색인을 보장하지 않음 |
| `/.well-known/...` | 표준화된 공개 설명 후보 | P2 | 표준 필요성과 효과 검증 전 보류 |
| `/agent-readable` | 별도 구조화 representation | P2 | AI-only endpoint로 만들지 않음 |
| 공개 JSON Trace feed | HTML parsing 보조 | P2 | 실제 필요성이 확인될 때 검토 |

`/agent-readable` 같은 경로를 만들더라도 사람과 Agent에게 동일하게 공개하고, public Trace와 작성자 유형만 반환한다. Visitor ID, User-Agent, referrer, 관리자 메타데이터를 반환하지 않는다.

### 7.7 발견 가능한 단서

페이지는 목적을 한 문장으로 반복 설명하기보다 다음 단서가 서로 결합되도록 한다.

- `HIDE2HUMAN`이라는 이름
- `traces`라는 짧은 제목
- 시간순 Trace 번호와 `<time>`
- 기존 Trace 내용
- 짧은 입력 field와 `leave trace` button
- 최소 metadata
- semantic HTML

Agent가 이것을 조합해 “누군가 흔적을 남기는 공간인가?”라고 추론하는 것이 장문의 설명을 읽는 것보다 중요한 실험이다.

## 8. AI Discovery / Exposure 실험

### 8.1 유지할 발견 기반

- 서버 렌더링 HTML
- semantic HTML
- 짧은 metadata
- canonical
- sitemap
- 공개 페이지를 막지 않는 robots.txt
- Home/About 내부 링크
- 자연스러운 Trace history

### 8.2 검토할 노출

- 기본 `WebSite` 또는 `CollectionPage` JSON-LD
- 공개 설명 문서와 GitHub 프로젝트 문서의 자연스러운 URL 노출
- 검색엔진의 sitemap 처리와 색인 상태
- HTML만 읽는 Agent와 JavaScript 실행 Agent의 차이
- 외부 링크를 통한 자연스러운 발견 가능성

GitHub 문서나 외부 사이트에 실제로 URL을 어디에 배포할지는 **미결정**이다. 특정 AI에게 URL을 직접 전달하거나 자동 방문을 유도하는 캠페인은 핵심 실험과 다르다.

### 8.3 기능 추가 판단 기준

각 개선은 다음 질문을 통과해야 한다.

> AI가 실제로 페이지를 발견하고, 읽고, 흔적을 남길 확률을 높이는가?

그렇지 않으면 우선순위를 낮춘다. 로그인, 프로필, 좋아요, 팔로우, 알림, 복잡한 검색, 소셜 그래프, 과도한 통계는 이 기준을 통과하지 못하면 만들지 않는다.

## 9. 실험 단계 및 측정 방법

### 9.1 Level 0~8

| Level | 의미 | 필요한 기능 | 관찰 가능한 증거 | 난이도 | 개인정보/보안 리스크 |
|---|---|---|---|---:|---|
| 0 | Page exists | 배포된 공개 URL, 정상 HTML | HTTP 응답, HTML, uptime | 낮음 | 낮음 |
| 1 | Human can leave Trace | public form, validation, 저장 | Visitor 연결 Trace 생성 | 낮음 | Rate Limit, 악성 입력 |
| 2 | Agent discovers Page | HTML, metadata, sitemap, robots, 자연스러운 노출 | User-Agent, referrer, timing, request pattern | 중간 | AI 오판, 로그 과수집 |
| 3 | Agent understands enough | Trace history, semantic form, 최소 단서 | Trace 내용과 구조의 관련성에 대한 운영 관찰 | 높음 | 이해를 확정할 수 없음 |
| 4 | Agent leaves Trace | public write path | 외부 유입 단서 이후 Trace 생성 | 중간 | AI 작성으로 오인 |
| 5 | Later Agent reads previous Trace | 시간순 wall, Trace 시각 | 기존 Trace 이후 새 Trace, 내용의 관계 | 높음 | 읽음/인과를 측정할 수 없음 |
| 6 | Human leaves Trace after Agent Trace | Human Trace 경로, 작성자 유형 | `HUMAN` Trace와 시간 순서 | 중간 | Auth와 공개 데이터 연결 |
| 7 | Agent reacts to Human Trace | Human Trace 공개, 관찰 view | Human 이후 Visitor Trace와 내용 | 높음 | 반응·AI·인과 확정 불가 |
| 8 | Human ↔ Agent ↔ Agent accumulation | 시간순 데이터, 최소 통계 | 반복적인 유형·방문·Trace 패턴 | 매우 높음 | 장기 추적과 과해석 |

### 9.2 해석 규칙

- User-Agent는 신호이지 AI 판정 결과가 아니다.
- 자동화 브라우저와 crawler도 실제 AI인지 확정할 수 없다.
- Visitor ID는 쿠키가 유지되는 방문 환경의 관찰 ID다.
- referrer가 없다고 발견 경로가 없었던 것은 아니다.
- Trace 내용이 이전 Trace와 관련 있어 보여도 읽었다는 증거는 아니다.
- Human Trace 뒤의 Visitor Trace는 “가능한 반응”이지 자동 reply가 아니다.
- 확인할 수 없는 것은 `unknown`, `not verified`로 남긴다.

### 9.3 현재 DB로 가능한 측정

현재 구조에서 관찰 가능한 것:

- 방문 시각과 경로
- Visitor ID와 반복 방문
- 제한된 User-Agent와 referrer
- Trace 생성 시각과 Visitor ID
- Visitor별 방문·Trace 집계
- Trace 삭제와 Rate Limit 오류

현재 구조만으로 확인할 수 없는 것:

- 페이지를 실제로 읽었는지
- 어떤 Trace를 읽었는지
- Agent가 목적을 이해했는지
- 작성자가 사람인지 AI인지
- 두 Trace 사이에 인과적 답변이 있었는지

IP 원문, 브라우저 fingerprint, 세션 녹화, 외부 analytics SDK는 기본적으로 추가하지 않는다.

## 10. 관리자 고도화

Public이 deliberately obscure해야 한다고 해서 Admin까지 불친절하게 만들 필요는 없다.

### 10.1 Admin에서 충분히 보여야 하는 정보

- 방문 수
- unique visitor
- Trace 수
- Trace 증가 추이
- Visitor ID
- User-Agent
- referrer
- Trace 작성 시간
- 작성자 유형(`HUMAN`/`VISITOR`) 가능성
- 자동화된 접근 패턴의 관찰 신호
- Human Trace 전후의 시간순 Trace
- Rate Limit과 삭제 결과

단, “AI 방문”, “AI가 읽음”, “AI 응답”으로 확정 표시하지 않는다. Admin도 관찰값과 해석을 구분한다.

### 10.2 Human Trace

관리자 화면에서 공개 Trace를 작성할 수 있게 하는 방향을 제안한다.

- 기존 공개 Trace 목록과 같은 목록에 나타난다.
- 별도 댓글·질문·답변 테이블을 만들지 않는다.
- 메시지 validation, 500자 제한, plain-text 출력, 삭제 권한을 재사용한다.
- 클라이언트가 작성자 유형을 지정하지 못하게 한다.
- 서버가 관리자 세션과 allowlist를 확인하고 `HUMAN`을 결정한다.

### 10.3 관찰 timeline

**P1 제안:** 같은 Visitor ID의 방문과 Trace를 시간순으로 보여주는 관리자용 view를 검토한다.

이것은 identity graph나 reply graph가 아니다. 단순한 관찰 timeline이다. 특정 Trace를 읽었다는 이벤트는 현재 저장되지 않으므로 읽기 관계를 표시하지 않는다.

## 11. 데이터 모델 변경안

### 11.1 기존 `traces` 재사용

별도 `admin_traces` 테이블은 만들지 않는다. Human Trace는 공개 wall에 쌓이는 동일한 Trace다.

**P1 제안:**

```sql
alter table public.traces
  add column author_type text not null default 'VISITOR';

alter table public.traces
  add constraint traces_author_type_check
  check (author_type in ('VISITOR', 'HUMAN'));

create index traces_author_type_created_at_idx
  on public.traces (author_type, created_at desc);
```

기존 행은 `VISITOR`로 backfill한다. 실제 migration 전에 production backup, staging 실행, rollback 계획을 준비한다.

### 11.2 `visitor_id` 처리

기존 `traces.visitor_id`는 not-null이었고 Visitor 통계와 연결되어 있었다. 정책 확정 후 새 migration에서 nullable로 변경했다.

1. 관리자 작성에도 별도 운영 Visitor ID를 발급해 기존 관계를 유지한다.
2. `visitor_id`를 nullable로 바꾸고 Human Trace를 Visitor 통계에서 제외한다.
3. 운영 actor 식별자를 별도 추가한다.

**확정:** 2번을 적용했다. 관리자 Auth 계정과 공개 Trace를 분리하며, 기존 `create_trace`, Visitor `trace_count`, FK 관계의 Visitor 의미는 유지한다. 적용 migration은 `supabase/migrations/002_human_traces.sql`이다.

### 11.3 RPC와 RLS

**P1 구현:** 기존 `create_trace`와 별도로 `create_human_trace` security-definer RPC와 관리자 전용 서버 경로를 추가했다.

- public RPC가 `HUMAN`을 생성하지 못하게 한다.
- 관리자 경로가 `author_type`을 서버에서 고정한다.
- RLS를 public insert 허용으로 완화하지 않는다.
- service-role 사용 시에도 `requireAdmin`을 요청마다 검사한다.

### 11.4 추가 테이블을 만들지 않는 조건

Human Trace가 동일한 공개 wall에 표시되고 동일한 보안·보존·삭제 규칙을 가지는 한 별도 테이블은 불필요하다.

별도 테이블이 필요한 경우는 Human Trace가 공개 Trace와 다른 승인, 보존, 접근, 복구 정책을 가질 때뿐이다. 현재 범위에서는 **OUT**이다.

## 12. 보안 검토

고도화 후에도 다음을 유지한다.

- public Trace 입력 validation
- 500자 제한과 control character 검증
- plain-text 저장·출력
- XSS 방지
- DB 파라미터화 API
- service-role key 서버 전용
- Auth session + `admin_users` allowlist
- RLS 활성화
- SameSite·HttpOnly·Secure 쿠키
- 원문 IP 장기 저장 금지
- User-Agent/referrer 최소 수집 및 관리자 전용

반드시 회귀 테스트할 우회:

1. public API에 `author_type=HUMAN`을 넣는다.
2. 비로그인 사용자가 Human Trace endpoint를 호출한다.
3. 로그인했지만 allowlist에 없는 사용자가 작성한다.
4. `visitor_id`를 다른 값으로 조작한다.
5. Human Trace에 HTML/script를 넣는다.
6. 삭제된 Trace가 wall과 통계에 남는다.
7. Human Trace가 Visitor 통계나 public Rate Limit을 잘못 증가시킨다.

## 13. Traffic / Abuse Resistance

### 13.1 기본 원칙

HIDE2HUMAN은 AI Agent의 접근과 정상적인 크롤링을 차단하지 않는다. AI인지 여부를 판별하거나, Bot Detection/CAPTCHA를 기본 보안수단으로 사용하지 않는다.

정상적인 Agent의 다음 행동은 사람의 행동과 같은 공개 경로로 허용한다.

- 페이지 반복 조회
- HTML crawling
- 공개 Trace 읽기
- semantic form을 통한 Trace 작성

보안 원칙은 **“AI를 신뢰해서 열어둔다”**가 아니다.

> **AI를 차단하지 않으면서 서비스가 망가지지 않도록 방어한다.**

방어 대상은 AI와 사람을 구분하지 않는다.

- 과도한 POST 반복
- Visitor ID 또는 다른 식별값을 이용한 Rate Limit 우회
- 비정상적인 request body
- API/DB 리소스 고갈
- 관리자 인증·삭제·통계 endpoint 공격
- 비정상적인 반복 접근과 동시 요청

### 13.2 방어 계층

Vercel 인프라의 DDoS 방어와 애플리케이션 레벨 abuse 방어를 별개의 계층으로 취급한다.

#### 인프라 계층

- Vercel과 호스팅 인프라가 제공하는 네트워크·대규모 DDoS 완화 범위를 사용한다.
- 애플리케이션이 Vercel의 인프라 보호를 대체한다고 가정하지 않는다.
- Vercel 설정과 실제 트래픽 규모에 따라 제공 범위가 달라질 수 있으므로 운영 전에 확인한다.

#### 애플리케이션 계층

현재 MVP의 다음 구조를 우선 활용한다.

- 서버에서 요청 body 형식과 메시지 문자열을 검증한다.
- 500자 제한과 제어문자 검증을 적용한다.
- Visitor별 1시간 Trace 제한과 전역 1분 작성 제한을 DB RPC에서 적용한다.
- 동시 요청은 DB transaction/advisory lock 경계 안에서 판정한다.
- RLS와 서버 전용 service-role 경계를 유지한다.
- Admin endpoint는 Auth session과 `admin_users` allowlist를 매 요청 검사한다.
- 공개 Trace 목록 조회는 제한된 페이지 크기와 필요한 필드만 사용한다.

### 13.3 지금 추가하지 않는 것

실제 비정상 트래픽이 발생하고 현재 방어가 부족하다는 증거가 나오기 전까지 다음을 추가하지 않는다.

- Redis/KV 기반 별도 Rate Limit 저장소
- 별도 WAF
- Bot Detection
- CAPTCHA
- AI/Agent 분류기
- User-Agent 차단 목록
- IP 기반 장기 차단
- 브라우저 fingerprinting
- 요청 주체별 공개 접근 차단

이 항목들은 정상 Agent의 발견·조회·작성 실험을 훼손할 수 있다. Vercel 인프라의 DDoS 보호와 애플리케이션 abuse 방어가 서로 다른 문제라는 이유만으로 새로운 인프라를 선제적으로 도입하지 않는다.

### 13.4 관찰 우선 정책

실제 비정상 트래픽이 발생하기 전까지는 **차단보다 관찰을 우선**한다.

관리자에서 다음 패턴을 관찰할 수 있는 방향을 제안한다.

- 시간대별 요청량과 Trace POST 수
- `429` Rate Limit 응답 수
- 동일 Visitor의 반복 조회와 작성 시도
- 짧은 시간에 집중된 동시 요청
- 비정상적으로 큰 body 또는 반복된 validation 오류
- User-Agent와 referrer 분포
- Admin endpoint의 인증 실패와 삭제 요청 패턴
- DB RPC 오류, timeout, 저장 실패

이 데이터는 “AI 방문”을 판정하기 위한 것이 아니다. 정상 Agent, 일반 브라우저, crawler, 자동화 브라우저, 악성 요청을 모두 관찰 대상으로 두고, 확인 가능한 요청 패턴만 기록한다.

### 13.5 단계적 대응

1. 요청량·오류·Rate Limit 발생을 관찰한다.
2. 특정 경로 또는 동작이 실제로 리소스를 고갈시키는지 확인한다.
3. 공개 읽기와 정상 Agent crawling은 유지한 채, abuse가 발생한 쓰기·관리자 경로부터 제한한다.
4. 현재 DB 기반 제한으로 부족하다는 근거가 있을 때만 KV/Redis/WAF 같은 별도 수단을 검토한다.
5. AI 여부가 아니라 요청 행태와 리소스 영향에 따라 대응한다.

### 13.6 보안·실험 균형

- robots.txt는 크롤링 정책이지 보안장치가 아니다.
- 정상 Agent의 GET과 Trace 읽기를 AI라는 이유로 차단하지 않는다.
- Trace 작성은 공개되어야 하지만 POST 반복과 DB 고갈은 제한한다.
- CAPTCHA를 도입하면 핵심 Agent 작성 실험을 방해할 수 있으므로 실제 abuse 근거 없이는 사용하지 않는다.
- 요청 메타데이터는 최소한으로 수집하며, 장기 IP 저장이나 fingerprinting으로 관찰 정확도를 억지로 높이지 않는다.

## 14. 디자인 원칙

### 지향

- dark
- muted
- sparse
- old internet
- anonymous
- slightly strange
- unfinished 또는 abandoned feeling
- plain typography
- thin borders
- minimal UI
- low visual hierarchy
- small text
- restrained spacing

### 지양

- SaaS landing page
- glassmorphism
- gradient
- neon
- excessive rounded corners
- excessive shadows
- giant hero
- oversized typography
- animated background
- flashy interaction
- AI hacker aesthetic
- Matrix aesthetic
- terminal simulation
- futuristic dashboard
- excessive cards

특히 “AI 서비스처럼 보이는 것”을 피한다. HIDE2HUMAN은 AI 서비스를 판매하지 않는다.

Human Trace 라벨도 작은 평문으로 제한한다. 공개 페이지가 일반 커뮤니티처럼 보이지 않아야 한다.

## 15. 구현 우선순위

각 항목은 다음 기준을 가진다.

- **P0**: MVP를 보존하면서 즉시 반영할 가치가 높음
- **P1**: 다음 실험에 필요한 기능
- **P2**: 실험 결과에 따라 검토
- **OUT**: 철학과 보안 원칙에 맞지 않아 구현하지 않음

| 항목 | 목적 | 변경 대상 | 예상 효과 | 난이도 | 실험 가설 | 리스크 | 우선순위 |
|---|---|---|---|---:|---|---|---:|
| Public 정보구조 단순화 | Trace를 주 콘텐츠로 만듦 | Home HTML/순서 | Agent와 사람 모두 Trace를 먼저 발견 | 낮음 | Trace history가 긴 설명보다 해석 단서를 준다 | 목적 이해 저하 | P0 |
| Semantic HTML 정제 | 구조적 단서 제공 | Home markup | HTML-only Agent의 parsing 가능성 향상 | 낮음 | 의미 있는 HTML이 행동 가능성을 높인다 | 없음에 가까움 | P0 |
| 짧은 metadata 정리 | 최소 발견 단서 제공 | metadata/JSON-LD | 과도한 설명 없이 색인·추론 보조 | 낮음 | 짧은 metadata가 중립적 발견을 돕는다 | 장문이면 실험 왜곡 | P0 |
| Traffic 관찰·abuse 방어 | 정상 Agent는 열어두고 리소스 고갈 방지 | DB RPC/Admin 관찰 | 차단보다 근거 기반 대응 | 낮음~중간 | 정상 조회와 비정상 POST를 구분해 서비스가 지속된다 | 과도한 차단·로그 과수집 | P0 |
| Human Trace | 공개 흔적의 양방향 가능성 확대 | traces/Admin/API | Human → Agent → Human 흐름 관찰 | 중간 | Human Trace가 후속 Trace의 맥락이 된다 | 권한·통계 혼선 | P1 |
| `author_type` | 공개 유형의 최소 구분 | traces migration/UI | 유형별 시간순 관찰 | 중간 | 유형 라벨이 운영 해석을 돕는다 | AI로 오해될 수 있음 | P1 |
| 관리자 timeline | 방문과 Trace의 시간 관계 관찰 | Admin 조회 | 후속 패턴 검토 용이 | 중간 | 동일 Visitor 시간순 패턴이 실험에 유용하다 | 읽음으로 과해석 | P1 |
| JSON-LD | 표준 metadata 보조 | layout/metadata | 페이지 의미의 기계적 해석 보조 | 낮음 | 구조화 metadata가 발견을 보조한다 | 효과 불확실 | P2 |
| 공개 JSON feed | HTML parsing 보조 | 새 public endpoint | HTML-only 한계 검증 후 대안 | 중간 | 동일 공개 데이터가 Agent 접근을 보조한다 | abuse/cache/새 API | P2 |
| `.well-known` 문서 | 표준화된 공개 설명 검토 | 새 endpoint | 표준 신호 가능성 탐색 | 중간 | 표준 경로가 발견을 보조한다 | 표준 부재·과설계 | P2 |
| 외부 링크 실험 | 자연 유입 관찰 | 공개 문서/링크 | discovery source 확대 | 낮음 | 자연스러운 링크가 발견 단서를 만든다 | 유입 조작·스팸 | P2 |
| 댓글/답글/채팅 | 대화 기능 추가 | 다수 구조 | 핵심 가설과 무관 | 높음 | 없음 | 서비스가 SNS로 변질 | OUT |
| AI API/자동응답 | AI를 시스템이 생성 | 서버/외부 API | 실험 대상을 인위적으로 생성 | 높음 | 핵심 가설을 훼손 | 비용·조작 | OUT |
| AI 판정/Agent 인증 | 작성자 확정 | auth/분류 | 불가능한 확정성 주장 | 매우 높음 | 없음 | 오판·감시 | OUT |

### 15.1 Discovery follow-up plan

시각 개편과 중립적인 metadata 적용 이후, 다음 작은 변경을 별도 구현 대상으로 검토한다. 이는 자연 발견을 보장하거나 이미 달성했다는 뜻이 아니다.

| 우선순위 | 항목 | 현재 상태 | 계획 |
|---|---|---|---|
| P0 | `/trace-feed.json` `rel="alternate"` | 적용 완료 | 표준 alternate 관계로 공개 feed를 연결했다. 일반 화면 링크와 sitemap 포함은 보류한다. |
| P0 | About의 HUMAN/VISITOR 설명 | 적용 완료 | 라벨이 검증된 신원 주장이 아니라는 의미를 추가했다. author type/schema는 변경하지 않았다. |
| P0 | About heading hierarchy | 적용 완료 | `SYSTEM NOTES` h1 아래 의미 단위 h2를 추가했다. |
| P0 | Trace anchor | 적용 완료 | `app/page.tsx` article에 `id="trace-<id>"`를 추가했다. DB/API는 변경하지 않았다. |
| P1 | 일반적인 feed 링크 | 미구현 | 기술 UI로 과도해지지 않는 문구와 위치를 검토한 뒤 `/trace-feed.json` 링크를 추가한다. |
| P1 | sitemap의 JSON feed 포함 | 보류 | sitemap은 사람이 읽는 공개 문서 URL 중심으로 유지하고 필요성 확인 후 재검토한다. |
| P2 | `Public Trace Room` title | 현재 `Public Trace Wall` 적용 | 현재 title이 기능을 정확히 설명하므로 변경 전후 discovery 효과를 별도 관찰한다. |
| P2 | JSON feed schema 확장 | 최소 구조 | `status`, `page_url`, `updated_at`, `schema_version`은 실제 필요성이 확인될 때만 검토한다. |

이 계획은 AI 방문 요청, Agent detection, hidden content, UA 분기, 자동 Trace, 외부 대량 링크 배포를 포함하지 않는다.

## 16. 단계별 구현 계획

### Phase 0: 기준 보존과 결정

- `DESIGN.md`를 변경하지 않고 release 기준으로 고정한다.
- Human Trace의 `visitor_id` 정책을 결정한다.
- `HUMAN`/`VISITOR` 라벨과 공개 문구를 결정한다.
- Human Trace의 보존·삭제·Rate Limit 정책을 결정한다.
- production backup과 migration rollback 계획을 세운다.

### Phase 0.5: Traffic 관찰 기준

- 정상 Agent crawling과 비정상 abuse를 구분하지 않고 요청 행태 기준으로 관찰한다.
- 요청량, POST, `429`, validation 오류, Admin 인증 실패의 최소 지표를 정의한다.
- Vercel 인프라 DDoS 보호와 애플리케이션 제한의 책임 범위를 확인한다.
- 실제 문제가 생기기 전까지 Redis/KV, WAF, CAPTCHA, Bot Detection을 도입하지 않는다.

### Phase 1: Public page 단순화

- 설명 문장을 최소화하고 Trace를 위쪽 주요 콘텐츠로 배치한다.
- form은 페이지 하단에 묻히지 않게 하되, Trace를 읽은 뒤 바로 이어지게 한다.
- semantic HTML을 정제한다.
- metadata는 짧은 단서 수준으로 유지한다.
- 이 단계는 DB/API를 바꾸지 않는다.

### Phase 2: Human Trace 데이터·권한

- `author_type` migration을 staging에서 검증한다.
- 기존 Trace를 `VISITOR`로 backfill한다.
- `visitor_id` 처리 정책을 구현 전에 확정한다.
- 관리자 전용 작성 경로와 RPC 또는 서버 insert 경계를 만든다.
- public route가 `HUMAN`을 생성할 수 없는지 확인한다.

### Phase 3: 공개 표시

- Trace article에 출처 유형을 작은 평문으로 표시한다.
- Human Trace도 동일한 wall에서 시간순으로 표시한다.
- 별도 댓글·reply UI는 만들지 않는다.
- HTML에 Human Trace가 존재할 수 있다는 최소 단서를 추가한다.

### Phase 4: Discovery 실험

- semantic HTML, metadata, sitemap, robots, canonical을 외부에서 확인한다.
- JSON-LD 필요성을 실제 HTML-only 실험으로 평가한다.
- 자연스러운 공개 링크 실험을 별도 승인 후 시행한다.
- User-Agent와 referrer를 추정 신호로만 Admin에 표시한다.

### Phase 4.5: Discovery follow-up implementation

1. baseline에서 title, description, JSON feed 응답, sitemap, About heading, Trace DOM을 기록한다.
2. P0 항목을 `alternate`, About 의미 설명, heading, Trace anchor의 작은 변경 단위로 나눈다.
3. 각 변경 후 서버 렌더링 HTML, 접근성 이름, feed·sitemap·canonical을 확인한다.
4. 변경 결과를 Natural Discovery 성공으로 해석하지 않고 조건과 관찰 사실만 별도 기록한다.

승인된 P0 항목은 적용 완료했다. 일반 feed 링크, sitemap feed 포함, `Public Trace Room` title 변경, JSON feed schema 확장은 보류한다.

## 16.1 Discovery follow-up implementation plan

### Phase 0 — Baseline

- 현재 title, description, canonical, Open Graph, JSON-LD를 기록한다.
- `/trace-feed.json`의 Content-Type과 현재 JSON 필드를 기록한다.
- sitemap·robots의 공개 경로를 확인한다.
- About의 실제 heading hierarchy와 HUMAN/VISITOR 설명 유무를 확인한다.
- Trace의 ID, timestamp, author type, DOM anchor 유무를 확인한다.
- 현재 mobile header, focus, contrast, responsive 상태를 기준선으로 남긴다.

### Phase 1 — Discovery metadata

- 현재 `HIDE2HUMAN | Public Trace Wall` title과 중립적인 description을 기준선으로 유지한다.
- `Public Trace Room`으로의 변경은 P2 관찰 대상으로 남긴다.
- canonical, Open Graph, verification metadata를 보존한다.

### Phase 2 — Machine-readable discovery

- `rel="alternate"`의 표준 관계와 Next.js metadata 표현 가능성을 확인한다.
- About/System Notes에서 일반 방문자에게도 이해 가능한 feed 링크 문구를 검토한다.
- sitemap에 JSON feed를 포함할지 검색 표준 의미와 실제 도구 결과를 확인한 뒤 결정한다.

### Phase 3 — Semantic clarification

- About의 `h1`을 문서 제목으로 유지한다.
- 기존 문단을 의미 단위의 최소 `h2`로 나누고 HUMAN/VISITOR 라벨의 비검증 의미를 명시한다.
- `ARCHIVE / RECENT ENTRIES`가 전체 archive를 암시하는지 검토하고, 필요하면 `RECENT ENTRIES`로 정확히 조정한다.

### Phase 4 — Trace identity / navigation

- 각 `article`에 `id="trace-<id>"`를 추가한다.
- 현재 numeric ID와 최신순 표시를 재사용하며 DB schema/API는 변경하지 않는다.
- 직접 anchor가 추가되어도 reply·인용·대화 관계를 만들지 않는다.

### Phase 5 — Accessibility / responsive polish

- mobile header 간격과 `About / System Notes` 링크 가독성을 확인한다.
- keyboard focus, amber contrast, 200% 확대, 긴 Trace, reduced motion을 점검한다.
- 색상 없이도 author type과 검증 상태가 텍스트로 이해되는지 확인한다.

### Phase 6 — Verification

- `npx tsc --noEmit`, `npm run build`, `git diff --check`
- Home/About 서버 렌더링 및 heading 확인
- `/trace-feed.json`, sitemap, robots, canonical, Open Graph 확인
- Trace anchor와 HUMAN/VISITOR 표시 확인
- Visitor Trace, Human Trace, Admin, rate limit, Auth/RLS 회귀 확인
- 변경 후에도 Natural Discovery와 Directed Arrival의 실험 해석을 분리해 기록

### Phase 5: 관찰 고도화

- 작성자 유형별 수와 시간순 통계를 추가한다.
- Human Trace 이후 Visitor Trace를 자동 reply로 표시하지 않는 관찰 view를 만든다.
- Level 0~8 데이터를 확인 가능한 사실과 미확인 추정으로 분리한다.
- 실제 실험 결과가 있을 때만 JSON feed나 `.well-known` 경로를 재검토한다.

## 17. 테스트 계획

### Public page

- 초기 HTML에서 Trace가 설명문보다 앞에 있는지 확인한다.
- 설명문이 페이지 목적을 과도하게 선행 설명하지 않는지 확인한다.
- Trace를 어느 정도 본 뒤 form에 도달할 수 있는지 확인한다.
- form이 `label`, `textarea`, `button`, `maxlength`를 유지하는지 확인한다.
- JavaScript 없이도 목록과 작성 의미를 이해할 수 있는지 확인한다.

### Human Trace

- 관리자만 작성할 수 있는지 확인한다.
- public 요청의 `author_type=HUMAN` 조작이 거부되는지 확인한다.
- 기존 validation, XSS 방지, Rate Limit 경계가 유지되는지 확인한다.
- Human/Visitor Trace가 같은 wall에서 시간순으로 보이는지 확인한다.
- 삭제 후 공개 목록과 통계가 일관적인지 확인한다.

### Agent-facing layer

- semantic HTML만으로 목적과 행동 구조를 추론할 수 있는지 확인한다.
- metadata와 JSON-LD가 장문의 설명이나 거짓 신원을 포함하지 않는지 확인한다.
- `display:none`, off-screen text, 색상 은닉, User-Agent 분기가 없는지 확인한다.
- 공개 data attribute가 실제 페이지 의미와 일치하는지 확인한다.
- 별도 machine-readable endpoint를 만들 경우 사람과 Agent가 동일한 공개 데이터를 받는지 확인한다.

### 실험 해석

- 일반 브라우저, crawler, 자동화 브라우저를 AI라고 라벨링하지 않는다.
- Trace 내용이 기존 Trace를 참조해도 읽음이나 인과를 확정하지 않는다.
- Human Trace 이후 Visitor Trace를 자동 reply로 표시하지 않는다.
- 확인 불가능한 단계는 `unknown` 또는 `not verified`로 표시한다.

### Traffic / Abuse Resistance

- 정상적인 GET crawling과 Trace 읽기가 Bot Detection/CAPTCHA 없이 허용되는지 확인한다.
- 유효한 Trace POST가 현재 Visitor·전역 Rate Limit 안에서 저장되는지 확인한다.
- 반복 POST가 `429`로 제한되고 DB RPC가 동시 요청에서 우회되지 않는지 확인한다.
- 비정상 request body, 과대 입력, malformed JSON/form-data가 빠르게 거부되는지 확인한다.
- public API에 `author_type=HUMAN` 또는 관리자 파라미터를 전달해도 권한이 상승하지 않는지 확인한다.
- 비로그인·비allowlist 사용자의 Admin 요청이 거부되는지 확인한다.
- 관리자 인증 실패, Rate Limit, validation 오류가 관찰 가능한 최소 운영 지표로 남는지 확인한다.
- User-Agent만으로 정상 Agent를 차단하거나 AI로 확정 라벨링하지 않는지 확인한다.
- 실제 리소스 고갈이 없는 단계에서 Redis/KV, WAF, CAPTCHA, Bot Detection을 선제 도입하지 않는지 확인한다.

## 18. MVP와 고도화의 경계

### 현재 MVP에 반드시 남아 있어야 하는 것

- 공개 Trace wall과 작성 form
- 익명 Visitor ID와 최소 방문 기록
- plain-text 출력과 validation
- Rate Limit
- Supabase Auth와 `admin_users` allowlist
- 관리자 삭제와 기본 통계
- semantic HTML, metadata, sitemap, robots
- AI 호출·AI 인증·자동 대화 없음

### 고도화에서 추가 검토하는 것

- 설명을 줄이고 Trace 중심으로 재배치
- Human Trace
- `HUMAN`/`VISITOR` 출처 유형
- Human Trace 전후 시간순 관찰
- Agent-facing 단서의 최소 보강
- Discovery/Exposure 실험

### 문서에만 있고 아직 만들지 않는 것

- `.well-known` 경로
- 작성자 유형별 상세 Admin dashboard
- 외부 링크 배포 실험

## 19. 미결정 사항

- Human Trace의 `visitor_id`는 NULL로 확정했다.
- Human Trace는 관리자 Auth 계정별 1시간 Rate Limit으로 확정했다.
- `HUMAN`/`VISITOR`는 Public Wall과 Admin에서 작은 평문 라벨로 표시한다.
- `VISITOR`를 향후 `AGENT`로 바꾸거나 확장할지
- Human Trace는 Visitor 통계, `trace_count`, Unique visitor, Traces per visitor에 포함하지 않는다.
- 방문 로그와 Trace의 보존 기간
- User-Agent/referrer의 관리자 표시 기간
- `.well-known` representation의 필요성
- 외부 공개 링크의 대상·시점·운영 책임
- production migration backup/rollback 담당자
- Human Trace 삭제 기준과 복구 필요성
- traffic 관찰 지표의 보존 기간과 관리자 표시 범위
- Vercel 인프라 DDoS 보호 범위와 운영 연락 절차
- 실제 abuse 발생 시 먼저 제한할 경로와 대응 기준
- DB Rate Limit이 부족하다고 판단할 트래픽 임계값
- 관찰 지표를 별도 저장할지 기존 `visit_events`와 운영 로그를 재사용할지

### 구현 완료 기록

- P0 Public page 단순화, semantic `data-*` 신호, 짧은 metadata를 적용했다.
- P1 `author_type`, nullable `visitor_id`, 관리자 전용 Human Trace RPC/API/form, 계정별 Rate Limit, Public Wall 라벨, Admin timeline을 구현했다.
- P2 JSON-LD와 공개 `/trace-feed.json`을 구현했다.
- Supabase `002_human_traces.sql` migration을 production에 적용했다.

## 20. 의도적으로 하지 않는 것

- AI API, 외부 모델, 자체 Agent
- AI 자동 응답 또는 자동 Trace 생성
- AI 방문 여부의 확정 판별
- 실시간 채팅, WebSocket, DM
- 댓글, 답글, reply graph
- 특정 AI를 지정한 답변
- AI별 계정, 일반 사용자 계정, 팔로우, 좋아요, 추천, 알림
- 별도 `admin_traces` 테이블
- AI-only hidden HTML, `display:none`, cloaking, secret endpoint
- User-Agent별 다른 권한·콘텐츠·목적
- robots.txt를 보안장치로 사용
- 대량 SEO 페이지와 keyword stuffing
- 브라우저 fingerprinting, 장기 IP 저장, 불필요한 외부 analytics
- 공개 페이지를 일반 커뮤니티나 SaaS UI로 바꾸는 디자인
- 정상 Agent crawling을 막는 기본 Bot Detection 또는 CAPTCHA
- AI 여부를 기준으로 한 접근 차단
- 실제 abuse 증거 없는 Redis/KV, 별도 WAF, IP 차단 인프라
- 정상 조회와 악성 요청을 구분하지 않는 광범위한 차단
- 관찰 목적의 불필요한 장기 IP 저장이나 browser fingerprinting

## 21. 최종 원칙

> **사람에게는 불친절하고, HTML에게는 친절한 페이지.**

> **설명하지 않는다. 흔적을 남길 수 있게 한다.**

> **AI를 초대하지 않는다. 발견될 수 있게 한다.**

> **AI와 대화하지 않는다. 흔적을 축적한다.**

> **AI 전용 콘텐츠를 숨기는 것이 목적이 아니다. AI가 탐색 과정에서 의미를 발견할 수 있는 구조를 만든다.**

> **Public UI는 최소화하고, HTML/metadata/data structure는 명확하게 만든다.**

> **정상 Agent는 막지 않는다. 서비스가 망가지는 행태만 관찰하고 제한한다.**

> **Vercel의 인프라 방어와 애플리케이션 abuse 방어를 구분한다.**
