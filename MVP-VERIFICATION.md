# MVP Verification Report

검증일: 2026-09-15 (Human Trace migration 적용 후 재검증)

## MVP 완료 조건

**PASS with environment-dependent follow-up**

복구된 `DESIGN.md`의 구현 MVP 완료 조건과 코드 구조는 일치한다. Supabase 환경변수가 설정되었고 `002_human_traces.sql`이 production Supabase에 적용되었다. 주요 공개 경로와 권한 경계는 로컬 production server에서 재검증했다.

## 구현 완료 항목

- 메인 페이지, About 페이지, Trace 목록 및 작성 UI
- Supabase `traces`, `visitors`, `visit_events`, `admin_users` 스키마
- 익명 Visitor ID 쿠키 발급 및 방문 기록
- Trace 저장 및 최근 Trace 조회
- 방문자별 1시간 / 전체 1분 20건 Rate Limit
- 관리자 로그인, 관리자 목록 조회, Trace 삭제, 방문 로그 및 통계
- 기본 SEO metadata, `robots.txt`, `sitemap.xml`
- 반응형 CSS
- Human Trace(`HUMAN`)와 Visitor Trace(`VISITOR`)의 동일 wall 표시
- 관리자 전용 Human Trace 작성 API/form과 계정별 제한
- JSON-LD와 공개 `/trace-feed.json`
- React 기본 escaping을 통한 Trace 내용 XSS 방지
- `/about`의 Visitor ID 목적 및 공개 Trace 운영 안내
- JavaScript 없이도 동작하는 semantic Trace 제출 form 및 form-urlencoded 요청 처리

## 수정한 문제

- middleware에서 신규 Visitor 쿠키를 request와 response 양쪽에 올바르게 반영하도록 수정했다.
- Trace form에 `action`/`method`를 추가하고 API가 JSON과 form-urlencoded 본문을 모두 처리하도록 수정했다.
- `/about`에 Visitor ID 목적, 신원 증명이 아님, 공개 Trace 운영 안내를 추가했다.

## 남은 확인 사항

- production의 `NEXT_PUBLIC_SITE_URL`이 실제 배포 도메인인지 확인해야 canonical/sitemap 절대 URL이 올바르다. 현재 로컬 검증 환경은 localhost URL이다.
- 저장소에 테스트 파일이나 `test`/`test:e2e` 스크립트가 없다.
- 실제 운영 관리자 세션으로 Human Trace 작성 성공과 동일 계정 재작성 `429`를 확인할 수 있다.
- 실제 외부 Agent discovery, Trace 작성, 재방문은 아직 관찰되지 않았다.

## 테스트 결과

자동 테스트는 실행할 테스트 스위트가 없어 수행하지 못했다.

수동 HTTP 확인 결과:

| 경로 또는 동작 | 결과 |
|---|---|
| `/about` | `200` |
| `/admin/login` | `200` |
| `/robots.txt` | `200` |
| `/sitemap.xml` | `200`, 로컬 `NEXT_PUBLIC_SITE_URL` 기준 |
| `GET /api/traces` | `405 Method Not Allowed` |
| `/` | `200`, Supabase 연결 및 공개 Trace 조회 |
| `/admin` | 비인증 요청은 로그인 경로로 제한 |
| `/trace-feed.json` | `200`, 공개 Trace와 최소 metadata 반환 |
| `/api/admin/traces` 비인증 POST | `401` |
| 비문자열 메시지 | `400`으로 거부 |
| 빈 메시지 | `400`으로 거부 |
| 501자 메시지 | `400`으로 거부 |
| 유효한 JSON/form Trace 제출 | validation 및 권한 경계 확인; 운영 계정 작성은 별도 세션 확인 |

`npm run lint`는 ESLint 설정을 요구하는 대화형 프롬프트에서 종료되어 완료되지 않았다.

복구된 `DESIGN.md` 기준의 semantic form 조건에 맞춰 form-urlencoded 입력 검증 경로는 `400` 응답으로 확인했다.

## Build 결과

`npm run build` 성공.

Next.js가 Supabase 브라우저 번들에 대해 Edge Runtime Node API 사용 경고를 출력했으나 build 자체는 통과했다.

## 보안상 확인된 사항

- 사용자 Trace는 React JSX로 렌더링되어 HTML이 직접 실행되지 않는다.
- 입력은 문자열 여부, 공백, 최대 500자, 제어문자를 검증한다.
- Service-role key는 서버 전용 모듈에서만 사용되며 `.next/static` 클라이언트 번들에서 확인되지 않았다.
- Trace 및 방문 정보는 서버의 service-role 경로로만 접근한다.
- Supabase RLS는 네 개 테이블 모두 활성화되어 있다.
- 관리자 접근은 Supabase 인증 사용자와 `admin_users` 등록 여부를 함께 확인한다.
- Trace와 방문 로그의 user-agent/referrer는 최대 500자로 제한된다.
- Rate Limit은 DB 함수와 트랜잭션 advisory lock으로 처리된다.
- `002_human_traces.sql`이 production Supabase에 적용되었음을 확인했다.

## DESIGN.md와 다른 부분

복구된 `DESIGN.md` 기준으로 구현은 대부분 일치한다. 확인된 차이는 다음과 같다.

- `GET /api/traces`는 별도 공개 API로 구현하지 않고 Home 서버 컴포넌트가 직접 최신 Trace를 조회한다. 이는 DESIGN.md가 허용한 구현 방식이다.
- JSON-LD와 공개 `/trace-feed.json`이 추가되었으며, `.well-known`과 외부 링크 배포는 보류 상태다.
- `ADMIN_EMAIL` 환경변수는 사용하지 않으며, 설계에 정의된 `admin_users` allowlist를 권한 기준으로 사용한다.
- AI API, 자동 대화, 댓글, 좋아요, 팔로우, 추천, 이미지, 음성, 별도 검색엔진 등 의도적으로 제외된 기능은 구현되지 않았다.
