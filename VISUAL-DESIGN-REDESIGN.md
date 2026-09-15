# HIDE2HUMAN 시각 디자인 개편안

> **검토 상태:** 제안  
> **문서 성격:** 구현 전 시각·정보 구조 설계안  
> **기준 문서:** `DESIGN.md`, `ENHANCEMENT.md`, `HIDE2HUMAN — 서비스 기획안 v0.1.md`

이 문서는 HIDE2HUMAN의 기능과 실험 원칙을 바꾸지 않고, 현재의 절제된 old-internet 디자인을 **쯔꾸르 게임의 장소·메뉴·기록 로그 감성**으로 확장하기 위한 제안이다.

`DESIGN.md`의 MVP 범위와 `ENHANCEMENT.md`의 Agent-facing 원칙을 대체하지 않는다. 구현 전 시각 방향을 합의하기 위한 문서이며, 이 문서만으로 코드 변경이 승인되는 것은 아니다.

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
- semantic HTML, metadata, canonical, sitemap, robots 구조를 유지한다.
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
│  │ TRACES LEFT: 012             │  │
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

- `TRACES LEFT: 012`
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
| 포인트 | 탁한 amber 또는 muted green 하나 |
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
- 제목/상태 라벨에는 monospace 또는 픽셀에 가까운 글꼴을 제한적으로 검토한다.
- 외부 폰트 의존성은 기본적으로 추가하지 않는다.
- 전부 대문자로 쓰는 라벨은 짧은 상태 정보에만 사용한다.
- Trace 본문은 장식용 픽셀 글꼴보다 읽기 쉬운 글꼴을 우선한다.

픽셀 폰트 도입은 선택 사항이며, 도입하더라도 body 전체에 적용하지 않는다. 실제 픽셀 폰트가 없거나 로딩되지 않는 환경에서도 레이아웃과 의미가 유지되어야 한다.

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
STATUS: UNVERIFIED
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

## 13. 결정이 필요한 사항

구현 전에 다음 네 가지를 확정한다.

1. 포인트 색상을 `muted amber`와 `muted green` 중 무엇으로 할지
2. 실제 픽셀 폰트를 도입할지, 시스템 monospace만 사용할지
3. `TRACE ROOM`을 공식 Home 제목으로 사용할지, `traces`를 유지하고 시각 요소로만 사용할지
4. 상태창에 최신 Trace 시각을 표시할지, 현재처럼 Trace 수만 표시할지

권장 기본값은 **muted amber, 시스템 monospace, `TRACE ROOM` 사용, 실제 최신 Trace 시각 표시**다. 단, 상태창은 실제 DB 값만 표시하고 AI 방문·신원과 관련된 추정값은 표시하지 않는다.

