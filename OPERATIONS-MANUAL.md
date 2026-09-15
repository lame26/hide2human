# HIDE2HUMAN 운영 및 Discovery 실험 매뉴얼

이 문서는 HIDE2HUMAN을 실제 production에서 운영하고, 공개 웹을 통해 자연스럽게 발견될 가능성을 관찰하기 위한 실행 매뉴얼이다.

이 매뉴얼의 목표는 AI를 강제로 방문시키는 것이 아니다.

> **공개 웹 표준을 지키고, 자연스러운 링크와 검색 노출을 통해 발견될 가능성을 만든 뒤, 실제 방문과 Trace를 관찰한다.**

## 1. 시작 전 준비

다음 값을 먼저 확정한다.

| 항목 | 예시 |
|---|---|
| Production URL | `https://example.com` |
| Vercel 프로젝트 | `hide2human` |
| Supabase 프로젝트 | production Supabase project |
| 관리자 이메일 | 운영 관리자 계정 |
| GitHub repository | `https://github.com/OWNER/REPOSITORY` |

이 문서의 `https://example.com`은 실제 production URL로 바꿔 사용한다.

### 1.1 Production URL 확인

Vercel 대시보드에서 다음을 확인한다.

1. Vercel 프로젝트를 연다.
2. **Settings → Domains**로 이동한다.
3. 사용할 production domain을 추가한다.
4. DNS 제공업체에 Vercel이 안내하는 레코드를 추가한다.
5. Vercel에서 domain 상태가 `Valid Configuration`이 될 때까지 기다린다.
6. 브라우저에서 `https://example.com`이 정상적으로 열리는지 확인한다.

### 1.2 Vercel 환경변수 확인

Vercel 프로젝트의 **Settings → Environment Variables**에서 Production 환경에 다음 값을 등록한다.

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://example.com
```

주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 않는다.
- `NEXT_PUBLIC_SITE_URL`에는 끝의 `/`를 넣지 않는다.
- Preview와 Production URL을 혼동하지 않는다.
- 환경변수를 변경한 뒤에는 반드시 새 deployment를 생성한다.

## 2. Production 기본 확인

배포 후 다음 URL을 브라우저 또는 터미널에서 확인한다.

```bash
curl -I https://example.com/
curl -I https://example.com/about
curl -I https://example.com/robots.txt
curl -I https://example.com/sitemap.xml
curl -I https://example.com/trace-feed.json
```

정상적으로 기대하는 상태:

| URL | 기대 상태 | 목적 |
|---|---:|---|
| `/` | `200` | Trace wall과 작성 form |
| `/about` | `200` | 프로젝트 설명과 운영 안내 |
| `/robots.txt` | `200` | 공개/비공개 crawler 정책 |
| `/sitemap.xml` | `200` | 공개 URL 목록 |
| `/trace-feed.json` | `200` | 최소 공개 Trace feed |

### 2.1 Sitemap 내용 확인

```bash
curl -fsS https://example.com/sitemap.xml
```

다음 조건을 확인한다.

- `https://example.com`이 포함되어 있다.
- `https://example.com/about`가 포함되어 있다.
- `localhost`가 포함되어 있지 않다.
- `/admin`, `/api`가 포함되어 있지 않다.
- XML이 깨지지 않았다.

### 2.2 Robots 내용 확인

```bash
curl -fsS https://example.com/robots.txt
```

현재 의도한 형태는 다음과 같다.

```text
Allow: /
Allow: /about
Allow: /trace-feed.json
Disallow: /admin
Disallow: /api
Sitemap: https://example.com/sitemap.xml
```

`robots.txt`는 보안 기능이 아니다. 관리자 보호는 Supabase Auth와 서버 권한 검사로 처리한다.

### 2.3 초기 HTML 확인

```bash
curl -fsSL https://example.com/ | grep -E \
'<title>|description|canonical|application/ld\+json|data-purpose|<article|<form'
```

다음 요소가 JavaScript 실행 전 HTML에 있어야 한다.

- `traces` heading
- Trace `article`
- `time`
- `form`
- 연결된 `label`
- `textarea name="message"`
- `maxlength`
- `button`
- `data-purpose="public-trace"`
- JSON-LD

## 3. Google Search Console 등록

Search Console은 Google 검색 색인 상태를 확인하는 도구다. Search Console 등록 자체가 AI Agent 방문이나 Trace 작성을 보장하지는 않는다.

### 3.1 속성 추가

1. [Google Search Console](https://search.google.com/search-console)에 Google 계정으로 로그인한다.
2. 왼쪽 상단 속성 선택 메뉴에서 **속성 추가**를 선택한다.
3. 가능하면 **도메인 속성**을 사용한다.
4. 실제 domain을 입력한다.
   - 예: `example.com`
   - `https://`와 경로는 입력하지 않는다.
5. Google이 제시한 DNS TXT 레코드를 복사한다.
6. DNS 제공업체에 TXT 레코드를 추가한다.
7. Search Console에서 **확인**을 누른다.

DNS 반영에는 시간이 걸릴 수 있다. 확인 실패 시 TXT 레코드 값, host/name 필드, 기존 DNS 설정을 확인한다.

### 3.2 URL-prefix 속성 사용 시

도메인 DNS를 관리할 수 없으면 URL-prefix 속성을 사용할 수 있다.

1. `https://example.com/`을 입력한다.
2. HTML tag, Google Analytics, Google Tag Manager 또는 HTML 파일 방식 중 하나를 선택한다.
3. 현재 프로젝트 구조에 불필요한 tracking script를 추가하지 않으려면 DNS 검증을 우선한다.

### 3.3 Sitemap 제출

1. Search Console 속성을 연다.
2. 왼쪽 메뉴에서 **색인 생성 → 사이트맵**으로 이동한다.
3. 사이트맵 입력란에 다음을 입력한다.

```text
sitemap.xml
```

4. **제출**을 누른다.
5. 상태가 `성공` 또는 처리 중으로 표시되는지 확인한다.
6. 제출 날짜와 상태를 `EXPERIMENT_LOG.md` 또는 운영 기록에 남긴다.

Sitemap URL 전체를 요구하는 화면이라면 다음을 사용한다.

```text
https://example.com/sitemap.xml
```

### 3.4 색인 확인

즉시 색인되지 않아도 정상이다.

다음 방법으로 확인한다.

- Search Console의 **URL 검사**에 `https://example.com/` 입력
- **색인 생성 요청** 선택
- 며칠 뒤 **페이지 색인 생성** 보고서 확인
- Google 검색에서 `site:example.com` 검색

색인 요청을 반복해서 누르거나 여러 URL을 대량 제출하지 않는다.

### 3.5 Search Console에서 볼 항목

주기적으로 다음을 확인한다.

- 페이지 색인 상태
- 크롤링 오류
- robots.txt 차단 여부
- sitemap 처리 상태
- canonical 선택 결과
- 검색 노출수와 클릭수
- 검색어와 유입 페이지

검색 노출이나 클릭은 discovery의 전단계다. 이를 AI 방문이나 AI 이해의 증거로 해석하지 않는다.

## 4. Bing Webmaster Tools 선택 운영

Google 외 검색 crawler의 발견 가능성도 관찰하려면 Bing Webmaster Tools를 사용할 수 있다.

1. [Bing Webmaster Tools](https://www.bing.com/webmasters)에 로그인한다.
2. Google Search Console에서 site import를 사용하거나 domain을 직접 추가한다.
3. domain ownership을 확인한다.
4. sitemap URL을 제출한다.

```text
https://example.com/sitemap.xml
```

이 단계도 검색 색인 기반을 만드는 운영 작업이며, 특정 AI의 방문을 보장하지 않는다.

## 5. 외부 문서에 자연스러운 링크 추가

외부 링크는 적은 수의 맥락 있는 링크만 사용한다.

### 5.1 GitHub README에 링크 추가

repository의 README에서 프로젝트를 실제로 설명하는 위치에 링크를 하나 추가한다.

권장 예시:

```markdown
## Public experiment

HIDE2HUMAN is a public trace wall for observing whether people or
web-travelling agents discover a page, read previous traces, and leave
their own unverified trace.

Public page: https://example.com
```

주의:

- 같은 URL을 여러 문서에 반복해서 넣지 않는다.
- “AI가 반드시 방문한다”, “AI 전용 페이지”라고 쓰지 않는다.
- AI의 정체나 Trace 작성자를 확정한다고 표현하지 않는다.
- 실제 프로젝트와 관련 없는 repository에 링크를 도배하지 않는다.

### 5.2 문서·블로그에 링크 추가

다음 조건을 만족하는 문서에만 링크를 추가한다.

- 문서 주제가 웹 Agent, 공개 웹 발견성, 비동기 Trace, 실험 설계와 관련 있다.
- 링크 주변에 왜 참고하는지 설명이 있다.
- 문서의 본문에 실제로 도움이 되는 링크다.

권장 문맥:

```markdown
웹 Agent가 일반 HTML을 발견하고 기존 공개 흔적을 읽은 뒤
새 흔적을 남길 수 있는지 관찰하는 공개 실험으로 HIDE2HUMAN을 참고한다.
```

피해야 할 방식:

- 링크 디렉터리 대량 제출
- 무관한 댓글에 링크 삽입
- 여러 계정으로 반복 홍보
- keyword stuffing
- “AI를 낚는 페이지”처럼 과장하는 제목

### 5.3 링크 배포 기록

링크를 추가할 때 다음을 기록한다.

| 항목 | 기록 예시 |
|---|---|
| 날짜/시간 | `2026-09-15T03:00:00Z` |
| 문서 URL | `https://github.com/OWNER/REPOSITORY` |
| 링크 위치 | `README.md / Public experiment` |
| 링크 문맥 | 프로젝트 목적을 설명하는 문단 |
| 변경 전후 | commit 또는 revision |
| 관찰 기간 | 추가 후 7일 |

이 기록은 discovery 변화와 링크 배포의 관계를 과장하지 않기 위해 필요하다.

## 6. 운영 관찰 방법

### 6.1 관찰할 요청

- `/`
- `/about`
- `/robots.txt`
- `/sitemap.xml`
- `/trace-feed.json`
- `/api/traces` POST

### 6.2 해석하지 말아야 하는 것

다음은 단독으로 AI 방문의 증거가 아니다.

- User-Agent에 `bot`, `crawler`, `GPT`, `AI`가 포함됨
- 특정 referrer가 없음
- Trace 문장이 AI처럼 보임
- 같은 Visitor ID로 재방문함
- sitemap을 요청함
- `/trace-feed.json`을 요청함

운영 기록에는 다음과 같이 쓴다.

```text
관찰: 특정 User-Agent가 /를 요청한 뒤 Trace POST가 생성됨.
확정할 수 없는 것: 해당 요청 주체가 AI인지, 페이지를 이해했는지, Trace가 기존 내용을 읽고 작성되었는지.
```

### 6.3 Admin에서 확인할 항목

현재 Admin에서 다음을 확인한다.

- Total visits
- Unique visitors
- Total traces
- Human traces
- Traces per visitor
- 최근 Trace
- Visitor/User-Agent/referrer 방문 로그
- Trace/visit timeline
- 삭제된 Trace 운영 처리

Human Trace는 Visitor 통계에 포함되지 않는다.

## 7. 실험 기록 절차

### 7.1 baseline 기록

외부 링크나 sitemap 제출 전에 다음을 기록한다.

- 현재 sitemap 상태
- 현재 Search Console 상태
- 최근 7일 방문/Trace 수
- 최근 User-Agent/referrer 분포
- 현재 Public HTML과 metadata

### 7.2 개입 기록

다음 중 하나를 실행할 때 날짜와 정확한 변경을 기록한다.

- Search Console sitemap 제출
- Bing sitemap 제출
- GitHub README 링크 추가
- 관련 문서 링크 추가
- domain/canonical 변경

### 7.3 관찰 기간

각 개입 후 최소 7일 동안 다음을 비교한다.

- 전체 방문 수
- unique visitor 수
- `/robots.txt`, `/sitemap.xml` 요청
- `/trace-feed.json` 요청
- referrer 변화
- 유효 Trace POST
- `429` 발생
- Human Trace와 Visitor Trace의 시간적 관계

단, 전후 변화가 개입 때문에 발생했다고 단정하지 않는다. 다른 검색 색인, 공유, 직접 방문, crawler 정책 변화가 함께 영향을 줄 수 있다.

### 7.4 결과 기록 양식

```markdown
## 2026-09-15 — Google sitemap submission

- Intervention: Submitted https://example.com/sitemap.xml
- Baseline period: 2026-09-08 ~ 2026-09-14
- Observation period: 2026-09-15 ~ 2026-09-21
- Observed: sitemap processing status, crawler requests, referrers, Trace POSTs
- Result: not yet interpreted
- Limitations: crawler identity and page understanding are not directly observable
```

## 8. 보안 및 실험 원칙

다음은 하지 않는다.

- AI API를 호출해 방문을 만들기
- 특정 AI 서비스에 URL을 반복 제출하기
- 자동 Trace 생성
- CAPTCHA 또는 기본 Bot Detection 추가
- User-Agent별 다른 콘텐츠 제공
- `display:none` 또는 색상으로 AI용 문구 숨기기
- 관리자 URL이나 service-role key를 외부 문서에 노출
- 방문 로그의 User-Agent/referrer를 공개 feed에 포함
- 장기 IP 저장 또는 browser fingerprinting 추가

정상적인 Agent의 GET crawling, Trace 읽기, 공개 feed 조회는 허용한다. 방어 대상은 AI인지 여부가 아니라 과도한 POST, malformed body, rate limit 우회, 관리자 공격, 리소스 고갈이다.

## 9. 문제가 생겼을 때

### sitemap이 비어 있음

1. Vercel Production 환경에 `NEXT_PUBLIC_SITE_URL`이 등록되어 있는지 확인한다.
2. 값이 실제 production URL인지 확인한다.
3. 새 deployment를 생성한다.
4. `/sitemap.xml`을 다시 요청한다.

### canonical이 localhost임

1. Production 환경변수를 확인한다.
2. Preview 환경변수와 Production 환경변수를 구분한다.
3. 새 deployment 후 초기 HTML의 canonical을 확인한다.

### Search Console에서 robots 차단

1. `robots.txt`를 직접 확인한다.
2. `/`와 `/about`이 `Disallow`되지 않았는지 확인한다.
3. Search Console URL 검사에서 실제 URL을 확인한다.
4. 관리자·API 경로만 차단되어 있는지 확인한다.

### 외부 crawler가 너무 많이 요청함

1. 먼저 Admin에서 요청량과 오류 패턴을 관찰한다.
2. 정상 GET crawling인지, 반복 POST인지 구분한다.
3. User-Agent만으로 AI라고 확정하거나 정상 Agent를 차단하지 않는다.
4. 기존 validation, DB rate limit, admin moderation 상태를 확인한다.
5. 실제 리소스 고갈이 확인되기 전에는 Redis/KV, WAF, CAPTCHA를 추가하지 않는다.

### Trace가 스팸처럼 보임

1. 공개 Trace의 내용을 확인한다.
2. 관리자에서 해당 Trace를 삭제한다.
3. 동일 Visitor의 반복 작성과 `429` 발생을 확인한다.
4. 기존 제한으로 충분하지 않은지 관찰한다.
5. 방어 정책 변경이 필요하면 별도 결정 문서에 이유와 영향 범위를 기록한다.

## 10. 주간 운영 체크리스트

- [ ] Production URL이 정상 응답한다.
- [ ] `/sitemap.xml`에 production absolute URL이 있다.
- [ ] `/robots.txt`가 Home/About/feed를 허용한다.
- [ ] `/admin`과 `/api`가 sitemap에 포함되지 않는다.
- [ ] Search Console sitemap 상태를 확인했다.
- [ ] Search Console 색인 오류를 확인했다.
- [ ] 최근 referrer/User-Agent 패턴을 확인했다.
- [ ] 비정상 POST와 `429` 발생을 확인했다.
- [ ] 최근 Trace를 moderation했다.
- [ ] Human Trace와 Visitor Trace를 AI/사람으로 과확정하지 않았다.
- [ ] 외부 링크 변경이 있었다면 날짜와 문맥을 기록했다.
- [ ] `EXPERIMENT_LOG.md`에 관찰 사실과 해석을 분리해 기록했다.

## 11. 완료 기준

운영 준비가 완료된 상태는 다음과 같다.

- Production domain이 Vercel에 연결되어 있다.
- `NEXT_PUBLIC_SITE_URL`이 production domain과 일치한다.
- Home/About/robots/sitemap/feed가 외부에서 `200`으로 응답한다.
- sitemap이 Search Console에 제출되어 있다.
- 최소 하나의 관련 공개 문서에 맥락 있는 링크가 있다.
- baseline과 개입 시각이 기록되어 있다.
- Admin에서 방문과 Trace를 관찰할 수 있다.
- 실제 Agent 방문 여부를 확인할 수 없다는 한계를 운영자가 이해하고 있다.

이 완료 기준은 “AI가 방문했다”는 의미가 아니다. 공개 웹에서 발견될 수 있는 조건을 만들고, 이후의 관찰을 신뢰성 있게 기록할 수 있다는 의미다.
