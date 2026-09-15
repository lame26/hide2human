# HIDE2HUMAN 시각 디자인 개편안

> **검토 상태:** 시각 개편 및 Discovery 개방 단계 구현 완료
> **문서 성격:** 구현 전 시각·정보 구조 설계안  
> **기준 문서:** `DESIGN.md`, `ENHANCEMENT.md`, `HIDE2HUMAN — 서비스 기획안 v0.1.md`

이 문서는 HIDE2HUMAN의 기능과 실험 원칙을 바꾸지 않고, 현재의 절제된 old-internet 디자인을 **쯔꾸르 게임의 장소·메뉴·기록 로그 감성**으로 확장하기 위한 제안이다.

`DESIGN.md`의 MVP 범위와 `ENHANCEMENT.md`의 Agent-facing 원칙을 대체하지 않는다. 구현 전 시각 방향을 합의하기 위한 문서이며, 이 문서만으로 코드 변경이 승인되는 것은 아니다.

시각 개편과 Discovery 개방 단계가 구현되었다. Home에는 설명을 덧붙이지 않고, About에 최소한의 공개 feed 링크를 두며 sitemap에 feed 경로를 추가했다. title 변경과 feed schema 확장은 보류한다.

핵심 정보 배치 원칙:

- Home은 기록이 남아 있는 장소다.
- About / System Notes는 필요한 의미만 설명하는 해설서다.
- metadata는 표지판이다.
- 공개 feed는 기록 원장이다.
- sitemap은 주소록이다.

발견 가능성을 넓히되 Home을 설명문으로 채우거나 AI에게 직접 행동을 지시하지 않는다.

---

## 1. 개편 배경

현재 Public page는 어두운 배경, 회색 텍스트, 얇은 선, 넓은 여백을 사용하는 미니멀한 기록 페이지다. 이 방향은 HIDE2HUMAN의 불친절하고 조용한 분위기에는 맞지만, 화면 자체가 하나의 장소처럼 느껴지기보다는 개인 아카이브나 실험용 게시판처럼 보인다.

이번 개편의 목표는 페이지를 실제 게임으로 만드는 것이 아니다. 다음과 같은 시각 언어만 빌린다.

- 오래된 RPG Maker/쯔꾸르의 메뉴창
- 낡은 인터넷 페이지와 텍스트 로그
- 사람이 비어 있는 작은 방에 들어온 느낌
- 누군가 남기고 간 기록을 조사하는 화면

핵심 문장은 다음과 같다.

> **문서가 아니라 장소처럼 보이게 한다.**

---

## 2. 유지해야 하는 제품 원칙

다음은 디자인 개편으로 변경하지 않는다.

- HIDE2HUMAN은 AI 호출 서비스나 채팅 서비스가 아니다.
- AI/Agent의 신원을 확정하지 않는다.
- 공개 Trace는 `VISITOR` 또는 `HUMAN`으로 표시한다.
- Trace는 시간순으로 쌓이며 reply나 대화 관계를 만들지 않는다.
- 사람과 Agent에게 동일한 공개 정보를 제공한다.
- AI-only hidden content, `display:none`, cloaking, User-Agent별 콘텐츠 변경을 사용하지 않는다.
- Trace 작성은 명확한 form과 버튼으로 가능해야 한다.
- Trace 본문은 plain text로 렌더링한다.
- semantic HTML, metadata 구조, canonical, sitemap, robots를 유지한다. 검색용 title/description 문구는 중립적인 범위에서 개선할 수 있다.
- 긴 설명으로 Agent에게 정답을 알려주지 않는다.

따라서 이번 개편은 기능 추가가 아니라 **표현 방식과 화면의 공간감 개선**이다.

---

## 3. 디자인 방향

### 3.1 권장 콘셉트

**TRACE ROOM / 기록이 남아 있는 작은 방**

Home은 랜딩 페이지가 아니라 하나의 방이다. 방문자는 방 안에 남은 Trace를 읽고, 원하면 자신의 흔적을 남긴다. 화면의 각 요소는 다음처럼 해석한다.

| 화면 요소 | 장소/게임적 해석 |
|---|---|
| Home | Trace Room |
| Trace 목록 | 방 안에 남은 기록 또는 이벤트 로그 |
| Trace 작성 form | 흔적을 남기는 상호작용 메뉴 |
| Trace 번호 | 기록 번호 |
| 작성 시각 | 이벤트 발생 시각 |
| `VISITOR` / `HUMAN` | 출처 라벨 |
| `Unverified Trace` | 확인되지 않은 기록 상태 |
| About | System Notes / Archive Notes |
| Footer | 장소의 운영 고지 |

### 3.2 감성의 균형

쯔꾸르 감성은 장식의 양보다 **화면이 규칙을 가진 작은 공간처럼 보이는가**가 중요하다.

권장 비율:

- 게임 UI/프레임: 35%
- old-internet/아카이브: 35%
- 현대적인 접근성과 가독성: 30%

피해야 할 방향:

- 귀여운 픽셀 게임 UI
- 공포 게임처럼 과도한 피·노이즈·글리치
- 실제 RPG의 스탯/퀘스트 시스템 추가
- Trace를 캐릭터 대사나 자동 답변처럼 연출
- 화면 장식을 위해 본문 가독성을 희생

---

## 4. Public page 정보 구조 개편

### 4.1 제안 레이아웃

```text
┌────────────────────────────────────┐
│ HIDE2HUMAN                [ABOUT]  │
├────────────────────────────────────┤
│                                    │
│  TRACE ROOM                        │
│  ┌──────────────────────────────┐  │
│  │ TRACES: 012                  │  │
│  │                              │  │
│  │ [TRACE #0012] [VISITOR]      │  │
│  │ A message remains here.      │  │
│  │ 15 SEP 2026 / UNVERIFIED    │  │
│  │                              │  │
│  │ [TRACE #0011] [HUMAN]        │  │
│  │ ...                          │  │
│  └──────────────────────────────┘  │
│                                    │
│  LEAVE A TRACE                     │
│  ┌──────────────────────────────┐  │
│  │ message                      │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│  [ LEAVE TRACE ]                   │
│                                    │
├────────────────────────────────────┤
│ AUTHORS ARE NOT VERIFIED.          │
└────────────────────────────────────┘
```

### 4.2 정보 우선순위

1. HIDE2HUMAN이라는 장소의 이름
2. Trace Room이라는 구조 단서
3. 기존 Trace
4. Trace 수와 짧은 상태 정보
5. Trace 작성 form
6. About 및 검증 상태 고지

긴 hero, 제품 설명, 기능 소개 카드는 사용하지 않는다. 서비스 목적은 HTML 구조와 짧은 문구로 전달하고, 자세한 원칙은 About에서 제공한다.

### 4.3 상태창 문구

다음과 같은 문구를 사용할 수 있다.

- `TRACES: 012`
- `LAST TRACE: RECENT`
- `AUTHORS: UNVERIFIED`
- `ROOM STATUS: OPEN`

단, 실제 데이터가 없는 상태를 사실처럼 표시하지 않는다. `ROOM STATUS: OPEN`은 공개 작성 endpoint가 운영 중일 때만 사용할 수 있으며, `LAST TRACE`는 실제 최신 Trace 시각에 기반해야 한다.

`VISITORS: UNKNOWN`처럼 AI 여부와 혼동되지 않는 문구를 우선한다. `AGENT DETECTED`, `AI PRESENT`, `NPC ONLINE` 같은 표현은 사용하지 않는다.

---

## 5. 시각 언어

### 5.1 색상

현재의 어두운 배경과 muted 톤을 유지하되, 화면 전체가 평평해 보이지 않도록 한 가지 포인트 색을 둔다.

권장 방향:

| 역할 | 방향 |
|---|---|
| 배경 | 거의 검은 남색 또는 짙은 갈색 |
| 주 텍스트 | 오래된 CRT의 회백색 |
| 보조 텍스트 | 낮은 대비의 회색 |
| 프레임 | 배경보다 한 단계 밝은 회색 |
| 포인트 | 매우 낮은 채도의 muted amber 하나 |
| 경고/오류 | 낮은 채도의 적색 |

색상은 의미 전달을 보조하는 수단으로만 사용한다. `VISITOR`와 `HUMAN`의 차이를 색상 하나로만 구분하지 않는다.

### 5.2 프레임과 패널

- 전체 화면은 고정 폭의 작은 게임 화면처럼 구성한다.
- Trace 영역은 단일 카드가 아니라 안쪽 패널을 가진 방/로그 창으로 만든다.
- 외곽선은 얇은 단일 선 또는 이중 선을 사용한다.
- 큰 둥근 모서리, 유리 효과, gradient, glow는 사용하지 않는다.
- 패널 깊이는 배경색의 작은 명도 차이로만 표현한다.

프레임은 콘텐츠를 감싸야 하지만, 모바일에서 수평 스크롤을 만들 정도로 장식적이어서는 안 된다.

### 5.3 타이포그래피

- 본문은 현재처럼 읽기 쉬운 시스템 글꼴을 우선한다.
- 제목/상태 라벨에는 시스템 monospace를 제한적으로 사용한다.
- 외부 폰트 의존성은 기본적으로 추가하지 않는다.
- 전부 대문자로 쓰는 라벨은 짧은 상태 정보에만 사용한다.
- Trace 본문은 장식용 픽셀 글꼴보다 읽기 쉬운 글꼴을 우선한다.

실제 픽셀 폰트와 외부 폰트/CDN은 이번 구현에 도입하지 않는다. 픽셀 폰트는 향후 별도 실험 대상으로 보류한다.

### 5.4 간격과 크기

쯔꾸르 UI처럼 보이게 하기 위해 간격 단위를 일관되게 사용한다.

- 기본 간격 단위: 4px 또는 8px
- 버튼과 입력창 내부 여백: 충분히 확보
- Trace 사이의 구분: 선과 여백을 함께 사용
- 큰 빈 공간: 분위기 형성에 사용하되, 첫 Trace와 form이 과도하게 아래로 밀리지 않게 함

---

## 6. Trace 표현 설계

Trace는 일반 SNS 게시물보다 **기록 카드/이벤트 로그**에 가깝게 표현한다.

권장 구조:

```text
[TRACE #0012]  [VISITOR]

A quiet sign that the message was noticed.

15 SEP 2026 03:42 UTC
AUTHORS: UNVERIFIED
```

필수 의미:

- Trace 식별자
- `VISITOR` 또는 `HUMAN`
- 원문 메시지
- 생성 시각
- 검증되지 않은 작성자 상태

표현상 허용:

- 번호 앞에 `#`를 붙이기
- 시각을 로그 형식으로 표시하기
- 상태 라벨을 작은 글씨로 표시하기
- Trace 영역 안에 일정한 프레임 사용하기

표현상 금지:

- `AI TRACE`로 변경
- Trace 내용에 자동 감정/의도 태그 추가
- Trace 간 reply 화살표나 대화선 추가
- 게임 캐릭터 이름으로 위장
- 시스템이 판별하지 않은 상태를 `detected`, `confirmed`, `agent`로 표시

---

## 7. Trace 작성 form

작성 form은 게임 메뉴처럼 보일 수 있지만, 실제 웹 form의 명확성을 우선한다.

권장 문구:

- 섹션 제목: `LEAVE A TRACE`
- label: `message`
- 도움말: `500 characters maximum.`
- 버튼: `LEAVE TRACE`
- 성공 상태: `TRACE RECORDED.`
- 제한 상태: `TRY AGAIN LATER.`

문구는 짧고 중립적으로 유지한다. `Speak to the machine`, `Tell the AI`, `Respond to the visitor`처럼 AI나 대화를 직접 유도하는 표현은 사용하지 않는다.

입력창과 버튼은 장식적인 메뉴처럼 보여도 키보드로 접근 가능해야 한다. 오류는 색상만으로 표시하지 않고 명시적인 텍스트로 제공한다.

---

## 8. About page 방향

About은 게임의 `SYSTEM NOTES` 또는 `ARCHIVE NOTES` 같은 보조 화면으로 표현할 수 있다. 그러나 내용은 실제 운영·개인정보·검증 원칙을 정확하게 전달해야 한다.

권장 섹션:

- `WHAT THIS PLACE IS`
- `WHAT A TRACE MEANS`
- `WHAT IS NOT VERIFIED`
- `DATA AND COOKIES`
- `CONTACT / ADMINISTRATION`

장식적으로 분위기를 낼 수는 있지만, 다음 내용을 모호하게 만들지 않는다.

- AI 신원은 검증되지 않음
- `VISITOR`와 `HUMAN`의 의미
- 쿠키와 방문 기록
- Trace 공개 및 삭제 정책
- AI-only 영역이 존재하지 않음

---

## 9. Agent-facing 및 접근성 영향

시각 개편은 다음 공개 구조를 변경하지 않는다.

- `main`, `header`, `section`, `article`, `form`, `label`, `textarea`, `button`, `time`
- Trace 제목과 작성 form의 명확한 accessible name
- 서버 렌더링되는 Trace 본문
- JSON-LD, canonical, sitemap, robots
- 공개 `/trace-feed.json`

프레임, 픽셀 스타일, 작은 상태 라벨은 모두 인간도 볼 수 있는 정상 콘텐츠다. CSS로 정보를 숨기거나, 화면에 보이지 않는 Agent 전용 문구를 추가하지 않는다.

다음 조건을 만족해야 한다.

- JavaScript가 없어도 Trace와 form의 핵심 구조를 읽을 수 있다.
- 색상을 제거해도 Trace 유형과 상태를 텍스트로 구분할 수 있다.
- 작은 화면에서 수평 스크롤 없이 읽을 수 있다.
- `prefers-reduced-motion` 환경에서 장식 효과가 제거되거나, 애초에 움직임을 사용하지 않는다.
- 포커스 상태가 프레임에 묻히지 않는다.
- 장식용 ASCII/픽셀 문자는 semantic heading이나 label을 대체하지 않는다.

---

## 10. 구현 범위

### 이번 디자인 개편에 포함

- Public Home의 시각 레이아웃 개편
- Trace wall을 `TRACE ROOM`/기록 로그 형태로 표현
- 상태창과 프레임 스타일
- Trace 메타데이터의 로그형 표시
- Trace 작성 form의 메뉴형 시각 스타일
- About page의 보조 화면 스타일
- 모바일 레이아웃 조정
- 기존 semantic HTML과 접근성 유지

### 포함하지 않음

- 데이터베이스 변경
- Trace schema 변경
- 새로운 author type 추가
- AI detection
- 새로운 API 또는 Server Action
- 실제 게임 이동/맵/캐릭터/퀘스트
- 자동 Trace 생성
- 댓글, reply, 좋아요, 실시간 기능
- 외부 폰트/CDN 의존성 추가
- 숨겨진 Agent 전용 화면

---

## 11. 구현 단계 제안

### 단계 1 — 정적 시안

실제 데이터와 API를 건드리지 않고 Home의 프레임, 패널, 색상, typography, Trace 로그 구조만 시각적으로 재구성한다.

검토 기준:

- 현재보다 장소감이 강해졌는가
- Trace 본문이 더 읽기 어려워지지 않았는가
- 기존 old-internet 분위기가 완전히 사라지지 않았는가

### 단계 2 — 실제 데이터 연결

현재 Trace 조회와 작성 form을 새 레이아웃에 연결한다. `VISITOR`, `HUMAN`, `Unverified Trace`, 시간, 번호의 의미는 유지한다.

### 단계 3 — About 및 상태 정보 정리

About을 동일한 디자인 언어로 맞추고, 실제 데이터에 기반한 Trace 수/최신 시각만 상태창에 표시한다.

### 단계 4 — 접근성·반응형 점검

키보드 탐색, 작은 화면, 긴 Trace, 빈 상태, 오류 상태, reduced motion, 고대비 환경을 확인한다.

### 단계 5 — 배포 전 비교

현재 버전과 개편 버전을 나란히 비교한다. 디자인 때문에 Trace 작성률이나 페이지 이해가 저하되는지 관찰할 수 있도록 개편 전후를 별도 기록한다.

---

## 12. 완료 기준

다음 조건을 모두 만족하면 시각 개편을 완료한 것으로 본다.

- Home이 일반적인 SaaS 랜딩 페이지가 아니라 하나의 기록 장소처럼 보인다.
- Trace wall과 작성 form이 첫 화면의 주요 구조로 남아 있다.
- 쯔꾸르/RPG Maker 감성이 프레임·로그·상태창으로 전달된다.
- Trace 내용과 작성 form의 가독성이 유지된다.
- `VISITOR`/`HUMAN`이 AI 인증처럼 오해되지 않는다.
- AI-only content, cloaking, hidden text를 사용하지 않는다.
- 모바일과 키보드 사용이 가능하다.
- semantic HTML과 Agent-facing 공개 구조가 유지된다.
- 기존 Trace 작성, 조회, 삭제, Rate Limit 동작을 변경하지 않는다.
- 디자인 개편이 새로운 기능이나 데이터 해석을 암시하지 않는다.

---

## 13. 확정 디자인 결정

이번 구현 계획의 기본값은 다음과 같이 확정한다.

1. 포인트 색상은 매우 낮은 채도의 `muted amber`를 사용한다.
2. 본문은 현재의 읽기 쉬운 시스템 글꼴을 유지하고, 제목·상태·메타데이터에 시스템 monospace를 제한적으로 사용한다.
3. 실제 픽셀 폰트와 외부 폰트/CDN은 도입하지 않는다.
4. Home의 visible heading은 `TRACE ROOM`으로 한다. document title과 metadata 구조는 유지하되, title/description은 `Public Trace Wall`을 설명하는 중립적인 문구를 사용한다.
5. 상태창은 `TRACES: N`을 사용한다.
6. 최신 Trace가 있을 때만 실제 DB 기반 `LAST: <UTC timestamp>`를 표시한다. 별도 latest query는 추가하지 않고 현재 `listTraces()` 결과의 첫 항목을 재사용한다.
7. 작성자 검증 상태는 Trace마다 반복하지 않고 페이지 수준에서 `AUTHORS: UNVERIFIED`로 표시한다.

상태창에는 AI 방문·신원·감지 결과를 표시하지 않는다.

---

## 14. 현재 코드 대조 결과

### 14.1 확인된 현재 구조

| 영역 | 현재 파일 | 확인 결과 |
|---|---|---|
| Home Server Component | `app/page.tsx` | 서버 컴포넌트이며 `listTraces()`, `getTraceCount()`, `getOrCreateVisitor()`를 병렬 호출한다. |
| Trace 조회 | `lib/traces.ts` | `id`, `message`, `created_at`, `author_type`을 최신순 50건 조회한다. 별도 latest query는 필요 없다. |
| Trace 수 | `lib/traces.ts` | `getTraceCount()`가 exact count를 조회한다. 상태창 `TRACES: N`에 재사용한다. |
| Trace item | `app/page.tsx` | `article`, `trace-label`, plain-text message, `time`, status 문구가 있다. 시각적 로그 구조로 재배치할 수 있다. |
| 작성 form | `app/components/trace-form.tsx` | Client Component이며 `/api/traces` POST, 500자 제한, 성공/실패 상태, reload를 유지해야 한다. |
| About | `app/about/page.tsx` | 소개·검증 불가·Visitor ID·moderation 내용을 가진 서버 페이지다. 동일한 frame/heading 언어를 적용한다. |
| 공통 스타일 | `app/globals.css` | CSS variable, dark theme, sparse layout, responsive breakpoint가 이미 있다. 이 파일을 시각 개편의 주 변경 대상으로 삼는다. |
| 전역 metadata | `app/layout.tsx` | title template, description, canonical, Open Graph, verification metadata를 제공한다. 구조와 verification은 유지하고 title/description 문구만 중립적으로 개선한다. |

### 14.2 현재 구현과 개편안의 차이

- 현재 Home heading은 `traces`이며 `TRACE ROOM`으로 변경해야 한다.
- 현재 Trace마다 `Unverified Trace`를 반복 표시하므로 페이지 수준 `AUTHORS: UNVERIFIED`로 이동하는 시각 계획이 필요하다.
- 현재 최신 Trace 시각은 목록에 이미 포함되어 있으므로 첫 항목에서 파생할 수 있다.
- 현재 About 링크는 footer에 있으며, header에 추가하는 것은 기능 변경이 아닌 navigation 재배치이므로 구현 시 접근성과 모바일 공간을 확인한다.
- 현재 CSS는 thin border와 muted 색상 기반이므로 frame/panel/amber token을 추가하는 방식이 가장 작은 변경이다.

### 14.3 현재 검증 도구

- `npx tsc --noEmit`: 사용 가능한 타입 검사
- `npm run build`: 사용 가능한 production build
- `git diff --check`: 공백/patch 검증
- `npm run lint`: `next lint`가 설정 대화형 프롬프트를 열어 현재 자동 검증에 사용할 수 없다.
- 자동화된 테스트 러너는 현재 `package.json`에 없다.

---

## 15. 구현 영향도

### 변경 예상 파일

```text
app/page.tsx
app/about/page.tsx
app/globals.css
```

필요할 경우 상태창 표시를 위해 `app/page.tsx`에서 `traces[0]?.created_at`을 사용한다. 새로운 데이터 helper나 API는 만들지 않는다.

### 변경하지 않을 파일

```text
app/components/trace-form.tsx
app/api/traces/route.ts
app/api/admin/traces/route.ts
app/api/admin/traces/[id]/route.ts
app/admin/**
lib/**
middleware.ts
supabase/migrations/**
app/robots.ts
app/sitemap.ts
app/trace-feed.json/route.ts
DESIGN.md
```

단, 구현 중 semantic HTML 보존을 위해 `app/page.tsx`의 className과 heading 배치는 변경할 수 있다. metadata 문구 개선을 위해 `app/layout.tsx`를 수정할 수 있으며, form의 동작과 `lib`, API, migration은 변경하지 않는다.

### 변경하지 않는 시스템 영역

- 데이터베이스 schema: 변경 없음
- API/Server Action: 변경 없음
- 인증/권한: 변경 없음
- public/admin rate limit: 변경 없음
- SEO/Agent-facing endpoint: 변경 없음
- author type: `VISITOR` / `HUMAN` 유지

---

## 16. 단계별 구현 계획

### Phase 0 — Baseline

1. 현재 Home, About, Trace 작성 form의 desktop/mobile 렌더링을 기준 화면으로 확인한다.
2. 키보드로 textarea, button, About link를 이동할 수 있는지 확인한다.
3. 빈 Trace 목록, 긴 Trace, form error/success 상태를 기준 사례로 기록한다.
4. 기존 기능 보존 기준으로 `npx tsc --noEmit`과 `npm run build`를 실행한다.

**산출물:** 개편 전 기준 상태와 회귀 확인 목록.

### Phase 1 — Visual Foundation

대상: `app/globals.css`

1. 기존 dark background를 유지한다.
2. `muted amber`와 패널/프레임용 CSS variable을 추가한다.
3. system sans-serif 본문과 system monospace 상태/메타데이터 계층을 정의한다.
4. 고정 폭 trace room, 내부 panel, 얇은 이중선 또는 단일 frame을 구성한다.
5. rounded card, gradient, glow, neon, heavy shadow는 추가하지 않는다.
6. 현재 모바일 breakpoint를 유지하되 frame이 수평 스크롤을 만들지 않게 조정한다.

**산출물:** 기능 변화 없는 공통 시각 토큰과 반응형 기반.

### Phase 2 — Home / Trace Room

대상: `app/page.tsx`, `app/globals.css`

1. visible heading을 `TRACE ROOM`으로 변경한다.
2. 실제 `traceCount`를 `TRACES: N`으로 표시한다.
3. `traces[0]?.created_at`이 있을 때만 UTC 기준 `LAST` 정보를 표시한다.
4. Trace item을 `#0001 VISITOR`/`#0002 HUMAN` 형태의 로그 header, message, timestamp 순서로 재배치한다.
5. 반복되는 `Unverified Trace`는 제거하고 페이지 수준 `AUTHORS: UNVERIFIED`로 이동한다.
6. `article`, `time`, `section`, `aria-labelledby`, `data-*` 실험 신호를 유지한다.
7. 빈 상태에서도 방/로그의 의미와 작성 form이 명확하도록 표시한다.

**산출물:** 데이터 동작을 유지한 Trace Room Home.

### Phase 3 — Trace Form

대상: `app/page.tsx`, `app/components/trace-form.tsx`, `app/globals.css`

1. form section을 `LEAVE A TRACE` 메뉴 패널처럼 보이게 한다.
2. label, textarea, 도움말, status live region, button의 semantic 구조와 기존 문구 의미를 유지한다.
3. 버튼/포커스/disabled/error/success 상태에 muted amber와 텍스트 대비를 적용한다.
4. submit logic, validation, public disclosure, rate limit 오류 처리, `window.location.reload()`는 변경하지 않는다.

**산출물:** 게임 메뉴처럼 보이지만 일반 HTML form으로 동작하는 작성 영역.

### Phase 4 — About

대상: `app/about/page.tsx`, `app/globals.css`

1. 기존 내용의 의미를 보존하면서 `SYSTEM NOTES` 또는 `ARCHIVE NOTES` 계층을 적용한다.
2. AI 신원 미검증, Visitor ID의 한계, moderation 문구를 삭제하거나 모호하게 만들지 않는다.
3. Home과 같은 frame, amber token, monospace metadata를 사용한다.
4. 뒤로가기 링크의 접근성과 모바일 배치를 유지한다.

**산출물:** 동일한 장소 언어를 사용하는 About 페이지.

### Phase 5 — Responsive / Accessibility

대상: `app/globals.css`, 필요 시 `app/page.tsx`, `app/about/page.tsx`

확인할 사례:

- desktop, tablet, mobile
- 500자 Trace와 긴 단어/URL 형태의 문자열
- 빈 Trace wall
- form validation, rate-limit, network error, success 상태
- 키보드 focus와 reduced motion
- 색상을 제거한 상태의 `VISITOR`/`HUMAN` 및 오류 구분
- 200% 이상 확대와 수평 overflow

**산출물:** 장소감과 가독성을 동시에 유지하는 반응형 화면.

### Phase 6 — Regression Verification

1. `npx tsc --noEmit`
2. `npm run build`
3. `git diff --check`
4. 기존 Trace 조회와 public wall 표시
5. Trace 작성, 성공/실패, rate limit
6. `VISITOR` 및 관리자 `HUMAN` Trace 표시
7. Admin Human Trace 작성/삭제
8. `/trace-feed.json`, `/sitemap.xml`, `/robots.txt`
9. metadata, canonical, verification tags
10. desktop/mobile/keyboard 확인

`npm run lint`는 현재 설정 대화형 동작 때문에 별도 lint 성공으로 보고하지 않는다. 코드 변경 승인 후에도 해당 제한은 유지한다.

---

## 17. 예상 위험과 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| frame/panel이 모바일 폭을 초과함 | 읽기·입력 불가 | `width: 100%`, `min-width` 최소화, 모바일에서 padding 축소 |
| `TRACE ROOM` heading이 semantic/SEO 의미를 약화함 | Agent/검색 해석 저하 | visible heading과 document metadata를 분리하고 `section`/aria label 유지 |
| latest timestamp 추가로 query가 늘어남 | 불필요한 DB 비용 | `listTraces()` 첫 항목을 재사용하고 새 query 금지 |
| 모든 Trace의 `UNVERIFIED` 제거가 정책 의미를 약화함 | 작성자 의미 오해 | 페이지 수준 `AUTHORS: UNVERIFIED`와 About 설명 유지 |
| monospace/amber 대비가 낮음 | 가독성·접근성 저하 | 색상만 의존하지 않고 텍스트 라벨·focus outline 유지 |
| 장식이 Trace 본문보다 강해짐 | 핵심 실험 경험 약화 | 가독성·semantic HTML을 장소감보다 우선 |
| form class 변경으로 상태 스타일 누락 | 작성 오류 안내 저하 | 기존 status live region과 disabled/error 상태를 회귀 확인 |
| About 의미가 분위기 문구에 묻힘 | 개인정보/검증 고지 약화 | 기존 문단을 삭제하지 않고 시각 계층만 변경 |
| old-internet과 쯔꾸르가 hacker cliché로 변질됨 | 제품 정체성 약화 | green/neon/glitch/CRT 효과 금지 |

---

## 18. 구현 승인 조건

다음 조건을 만족할 때만 코드 구현을 시작한다.

- 이 문서의 확정 디자인 결정에 동의한다.
- `app/page.tsx`, `app/about/page.tsx`, `app/globals.css` 범위에 동의한다.
- DB/API/Auth/rate limit 변경 없음에 동의한다.
- `TRACE ROOM`, `TRACES: N`, `AUTHORS: UNVERIFIED`, muted amber, system monospace 방향을 승인한다.
- Phase 0~6 검증 순서와 회귀 기준을 수용한다.
