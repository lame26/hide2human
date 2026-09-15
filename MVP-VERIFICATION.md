# MVP Verification Report

검증일: 2026-09-15

## MVP 완료 조건

**FAIL**

구현 자체는 대부분 MVP 범위를 충족하지만, 기준 문서인 `DESIGN.md`가 현재 `/` 한 글자만 포함한 손상 상태다. 또한 Supabase 환경변수가 없는 현재 환경에서는 핵심 DB 기반 기능을 실제로 검증할 수 없다.

## 구현 완료 항목

- 메인 페이지, About 페이지, Trace 목록 및 작성 UI
- Supabase `traces`, `visitors`, `visit_events`, `admin_users` 스키마
- 익명 Visitor ID 쿠키 발급 및 방문 기록
- Trace 저장 및 최근 Trace 조회
- 방문자별 1시간 / 전체 1분 20건 Rate Limit
- 관리자 로그인, 관리자 목록 조회, Trace 삭제, 방문 로그 및 통계
- 기본 SEO metadata, `robots.txt`, `sitemap.xml`
- 반응형 CSS
- React 기본 escaping을 통한 Trace 내용 XSS 방지

## 수정한 문제

코드 수정 없음.

검증 중 단순히 수정할 수 있는 구현 버그는 확인되지 않았다. `DESIGN.md` 손상은 중요한 기준 문서 문제이므로 별도 기획안 내용으로 임의 대체하지 않고 보고 대상으로 남겼다.

## 남은 문제

- `DESIGN.md`가 손상되어 MVP 완료 조건의 직접적인 기준으로 사용할 수 없다.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`이 설정되지 않아 DB 기반 기능의 실제 동작 검증이 불가능하다.
- `NEXT_PUBLIC_SITE_URL`이 없으면 `sitemap.xml`이 빈 URL set을 반환한다.
- 저장소에 테스트 파일이나 `test`/`test:e2e` 스크립트가 없다.
- 관리자 페이지의 실제 인증·조회·삭제 및 Rate Limit의 DB 동작은 Supabase 연결 후 별도 확인이 필요하다.

## 테스트 결과

자동 테스트는 실행할 테스트 스위트가 없어 수행하지 못했다.

수동 HTTP 확인 결과:

| 경로 또는 동작 | 결과 |
|---|---|
| `/about` | `200` |
| `/admin/login` | `200` |
| `/robots.txt` | `200` |
| `/sitemap.xml` | `200`, 환경변수 부재로 빈 sitemap |
| `GET /api/traces` | `405 Method Not Allowed` |
| `/` | Supabase 설정 부재로 `500` |
| `/admin` | Supabase 설정 부재로 `500` |
| 비문자열 메시지 | `400`으로 거부 |
| 빈 메시지 | `400`으로 거부 |
| 501자 메시지 | `400`으로 거부 |
| 유효한 Trace 제출 | Supabase 설정 부재로 저장 불가 |

`npm run lint`는 ESLint 설정을 요구하는 대화형 프롬프트에서 종료되어 완료되지 않았다.

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
- 실제 Supabase 프로젝트에 migration이 적용되었는지와 운영 환경의 RLS 상태는 현재 자격증명 부재로 확인하지 못했다.

## DESIGN.md와 다른 부분

`DESIGN.md` 자체가 `/`만 포함하여 실제 요구사항 문서로 기능하지 않는다.

별도 기획안 기준으로는 대부분 일치한다. 확인된 차이는 다음과 같다.

- 기획안의 예시 구조에 `GET traces`가 명시되어 있지만 현재는 별도 `GET /api/traces` Route Handler가 없고, 서버 컴포넌트가 Supabase에서 직접 Trace를 조회한다.
- Discovery Layer에서 제시한 FAQ형 콘텐츠는 별도 섹션으로 구현되지 않았고, 현재는 메인/About의 설명 콘텐츠로만 제공된다.
- 기획안에서 정의한 `ADMIN_EMAIL` 환경변수는 구현에서 사용되지 않는다. 현재 권한 판정은 `admin_users` 테이블 기준이다.
- 기획안에서 제외한 AI API, 자동 대화, 댓글, 좋아요, 팔로우, 추천, 이미지, 음성, 별도 검색엔진 등은 구현되지 않았다.
