# P1 구현 검토 결과 및 해소 기록

작성일: 2026-09-15

## 최초 결론

초기 검토 당시 P1/P2 구현 항목을 `ENHANCEMENT.md` 및 현재 코드와 대조했지만, P1의 핵심 기능인 Human Trace 구현은 정책 미결정으로 임의 진행할 수 없었다.

현재 `traces.visitor_id`가 `NOT NULL`이며 Visitor 통계와 연결되어 있다. Human Trace를 추가하려면 데이터베이스 스키마, 권한, 통계 집계 정책을 함께 결정해야 한다.

## 당시 구현을 중단한 이유

`ENHANCEMENT.md`에 다음 항목이 아직 미결정으로 남아 있다.

1. Human Trace를 어떤 주체 식별 방식으로 저장할 것인가
   - `visitor_id`를 `NULL` 허용으로 변경
   - 운영 Visitor ID에 연결
   - 별도의 actor 식별자 추가

2. Human Trace를 Visitor 통계에 포함할 것인가
   - `visitors.trace_count`에 포함할지
   - Unique visitor 및 Trace per visitor 통계에 포함할지
   - 공개 Visitor Trace의 Rate Limit과 분리할지

3. Human Trace 전용 Rate Limit을 둘 것인가
   - 기존 public Trace Rate Limit을 적용
   - 관리자 계정 단위의 별도 제한을 적용
   - 별도 제한 없이 관리자 권한만으로 허용

이 결정들은 migration, RPC, RLS, 관리자 API, 통계 화면에 동시에 영향을 주는 중요한 DB 및 보안 정책이다. 따라서 구현자가 임의로 선택하면 MVP 기준과 고도화 문서가 어긋날 수 있다.

## 정책 확정 및 구현 완료 상태

사용자가 다음 정책을 확정했고, 이를 기준으로 구현을 완료했다.

- `author_type`은 `VISITOR`와 `HUMAN`만 사용한다.
- Human Trace는 `visitor_id = NULL`이다.
- Human Trace는 Visitor 통계, `trace_count`, Unique visitor에 포함하지 않는다.
- Human Trace는 관리자 Auth 계정별 1시간 Rate Limit을 사용한다.
- 기존 migration은 수정하지 않고 `002_human_traces.sql`을 추가했다.
- Human과 Visitor Trace는 같은 Public Wall에서 시간순으로 표시한다.

구현 항목:

- `supabase/migrations/002_human_traces.sql`
- `/api/admin/traces`
- `HumanTraceForm`
- Public Wall 작성자 라벨
- Admin Human Trace 통계 및 Trace/visit timeline

## 현재 확인된 상태

- `DESIGN.md`: 수정하지 않음
- `ENHANCEMENT.md`: 수정하지 않음
- 기존 MVP 코드: 수정하지 않음
- 기존 Supabase migration: 수정하지 않음
- Human Trace 기능: 구현 및 migration 적용 완료
- 관리자 timeline: 구현 완료
- P2 JSON-LD 및 공개 JSON feed: 구현 완료
- `.well-known`, 외부 링크 실험: 문서상 보류

## 완료된 검증

- `npx tsc --noEmit` 통과
- `npm run build` 통과
- 비인증 Human Trace 요청은 `401`로 거부
- 빈 public Trace 입력은 `400`으로 거부
- `DESIGN.md` 변경 없음

운영 migration 적용 후 관리자 로그인으로 Human Trace 작성과 계정별 Rate Limit을 확인할 수 있다.

## 중단 사유 요약

초기 중단 사유였던 DB schema 및 보안 정책이 확정되었고, P1 구현과 migration 적용이 완료되었다.
