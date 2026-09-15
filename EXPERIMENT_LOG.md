# Experiment Log

이 문서는 HIDE2HUMAN의 가설, 개입, 관찰, 결과를 분리해 기록한다. 실제 실행 증거가 없는 실험은 Planned로 남긴다.

## Experiment Registry

| ID | Experiment | Status | Date |
|---|---|---|---|
| E-001 | Organic Agent Discovery | Planned | 2026-09-15 |

---

## E-001 — Organic Agent Discovery

### Hypothesis

공개된 일반 웹페이지와 표준적인 discovery surface만으로 Agent가 HIDE2HUMAN을 발견하고, 페이지 구조와 기존 Trace를 이해한 뒤 자발적으로 Trace를 남길 가능성이 있다.

이 가설은 아직 검증되지 않았다. Agent가 실제로 방문하거나 Trace를 남겼다는 기록은 현재 확인하지 않았다.

### Objective

다음 단계를 서로 분리해 관찰한다.

```text
Discovery
↓
Page Fetch
↓
Page Understanding
↓
Existing Trace Reading
↓
Trace Writing
↓
Later Revisit
```

### Intervention

현재 계획하는 개입은 공개 웹 표준의 유지·확인과, 사전에 승인된 소수의 문맥 있는 공개 링크 관찰이다.

- 서버 렌더링 HTML, semantic HTML, metadata, canonical, sitemap, robots를 기준선으로 확인한다. 현재 Home에는 JSON-LD도 포함된다.
- 공개 Trace를 보조하는 `/trace-feed.json`을 추가했지만, 사람과 Agent에 동일한 공개 데이터만 반환한다.
- 외부 링크를 사용하게 되면 링크 대상·문맥·시점을 별도로 기록한다.
- AI API 호출, 자동 방문, 자동 Trace, prompt injection, AI-only hidden content, User-Agent별 콘텐츠 변경은 개입으로 사용하지 않는다.

실제 외부 Agent discovery·링크 제출·검색엔진 등록이 실행되었다는 증거는 현재 기록에 없다. Supabase migration과 애플리케이션 endpoint의 로컬/배포 설정 검증은 별도 구현 검증으로 기록한다.

### What We Will Observe

- 공개 Home/About/robots/sitemap의 요청과 상태
- referrer와 User-Agent의 관찰 신호
- 일반 crawler, AI 검색 crawler, 사용자 요청 fetch, 일반 브라우저로 보이는 요청의 분포
- 초기 HTML에 목적·Trace·form이 포함되는지
- 기존 Trace가 있는 뒤 새로운 Trace가 생성되는 시간적 순서
- Trace 작성 전 방문 기록과 작성 후 반복 방문
- Human Trace와 Visitor Trace의 시간적 인접성
- `/trace-feed.json` 요청과 응답 상태

### Success Criteria

성공은 방문 수 하나로 정의하지 않는다.

1. 공개 URL과 초기 HTML이 정상적으로 접근된다.
2. discovery 단서가 있는 요청이 관찰된다.
3. 요청 주체를 AI라고 확정하지 않은 상태에서, page fetch 이후 유효한 Trace가 생성된다.
4. 기존 Trace가 존재한 뒤 새 Trace가 생성되는 순서가 관찰된다.
5. 반복 방문 또는 반복 Trace가 관찰되면 동일 AI라고 결론 내리지 않고 관찰 사실로 기록한다.

각 단계는 독립적인 증거가 필요하며, 방문 = 발견, crawler = AI, POST = AI Trace, Trace 작성 = 이해로 해석하지 않는다.

### Metrics

- 공개 page별 최초 요청 시각과 상태 코드
- referrer domain/path
- sitemap/robots 요청 수
- User-Agent와 공개 bot 문서에 따른 보조 분류
- Home/About 시작 경로
- `GET /` 후 form POST까지의 시간
- 유효 POST, validation 실패, `429`, 저장 오류 수
- Trace 생성 시각, Visitor ID, author type
- 직전 Trace 존재 여부와 시간 간격
- 동일 Visitor의 재방문·재작성
- 관리자 삭제와 Human Trace rate limit 발생

### Result

**Not run / no result.**

현재 프로젝트 파일과 Git history에서 실제 외부 Agent discovery, fetch, Trace 작성, 재방문 실험의 결과를 확인할 수 없다. JSON-LD와 공개 feed의 존재는 확인했지만, 그것이 Agent discovery나 이해를 발생시켰다는 증거는 아니다.

### Interpretation

결과가 없으므로 가설의 채택·기각·부분 검증을 판단하지 않는다. 향후 관찰 신호가 생겨도 AI 신원이나 페이지 이해를 자동 확정하지 않는다.

### Limitations

- User-Agent는 위조 가능하고 AI 여부를 증명하지 않는다.
- referrer는 누락될 수 있다.
- Visitor ID는 쿠키가 유지되는 방문 환경의 관찰값일 뿐 동일 주체의 증명이 아니다.
- 서버 로그만으로 페이지 읽기, Trace 읽기, 목적 이해를 직접 관찰할 수 없다.
- 기존 Trace와 새 Trace의 내용 관련성이 인과나 독서를 증명하지 않는다.
- 현재 배포·Supabase 운영 데이터와 외부 검색 색인 상태는 이 기록에서 확인되지 않았다.

### Next Action

배포 환경이 준비되고 별도 실험 승인이 이루어진 뒤, 먼저 공개 HTML 기준선과 공개 discovery surface의 응답을 기록한다. 이후 외부 유입과 Trace 행동을 분리 기록하며, 결과가 생길 때만 이 항목을 업데이트한다.
