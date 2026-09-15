# HIDE2HUMAN Future Data Model

This is a conceptual model only. It does not create or alter a database.

## 1. Modeling principles

The model separates **what happened** from **what we think it means**:

```text
Raw Observation -> Normalized Event -> Classification -> Session/Journey
                                                    -> Metric -> Report
```

Raw records should be append-only, privacy-minimized, access-controlled, and retained for a shorter period than aggregates where possible. Every derived record carries `schema_version`, `calculation_version`, source references, and uncertainty.

## 2. Entities

| Entity | Purpose and representative fields | Relationships / lifecycle | Privacy, source, confidence |
|---|---|---|---|
| Actor | A non-verified subject hypothesis: `id`, `kind`, `confidence`, `evidence`, `first_seen`, `last_seen` | Referenced by observations; may be merged or split only as a derived operation | Never a legal or model identity. Derived from cookie/session and request signals |
| Visitor | Current anonymous continuity key: `id`, first/last seen, visit/Trace counts | Current app uses `h2h_visitor`; future may scope it to a site | Cookie is pseudonymous and forgeable; do not expose raw ID to customers |
| Session | Bounded activity window: `id`, `site_id`, start/end, event count, termination reason | Groups events; should support revising timeout rules | A session is an analytic convenience, not a person |
| Event | Atomic normalized action: `id`, timestamp, session, type, path, method, status, metadata reference | Belongs to a session and source experiment | Minimize payload; avoid raw message, query strings, or full IP by default |
| Trace | Public content record: `id`, message, author type, created time, visitor/admin relation | Current public wall entity; future analytics references it by ID | Message is public user content and may contain personal data; moderation and deletion propagation required |
| Experiment | Protocol: `id`, hypothesis, version, intervention, cohort, start/end, criteria | Owns observations and evidence links | Protocol metadata is safer than participant identity; separate test traffic |
| Journey | Ordered event projection: `id`, session, start/end, steps, outcome, reconstruction version | Rebuilt when event/session logic changes | Confidence reflects missing events and ambiguous identity |
| Classification | A hypothesis about an event/session: `label`, `confidence`, `signals`, `classifier_version` | Many classifications can exist for one observation | Never overwrite raw observations; labels include `Unknown` |
| Observation | Raw request/response/action envelope: `id`, received time, site, route, coarse headers, response facts | Source for normalized events and reprocessing | Restricted access, redaction, retention deadline; source is server/client/external report |
| Site | A monitored website: `id`, tenant, origin, verification state, collection policy | Owns ingestion keys, events, reports, retention | Origin and ownership verification are security controls |
| Tenant | Customer/security boundary: `id`, name, plan, roles, status | Owns sites, members, exports, billing references | Row-level isolation and least privilege required |
| Metric | Versioned calculation: `id`, name, window, dimensions, value, sample size, uncertainty, calculation version | Derived from event IDs or query snapshot | Never imply causality; preserve denominator and exclusions |
| Report | Human-readable finding: `id`, tenant/site, period, metric references, evidence, limitations | Generated from metrics and audit rules | Access-controlled export; redact visitor-level data |

## 3. Event vocabulary

**FUTURE:** Candidate event types include `request_received`, `response_sent`, `page_view`, `feed_view`, `trace_view`, `trace_submit_attempt`, `trace_created`, `link_followed`, `form_validation_failed`, `rate_limited`, `session_started`, `session_ended`, `revisit_detected`, `task_started`, `task_completed`, and `task_failed`.

An event should include stable fields such as:

```text
id, occurred_at, received_at, site_id, session_id, path,
event_type, status, source, experiment_id, metadata,
schema_version
```

`metadata` must be allow-listed and bounded. It must not become an unrestricted request dump.

## 4. Current-to-future mapping

**CURRENT:** `visitors`, `visit_events`, and `traces` exist; Trace stores message, timestamp, author type, visitor/admin relation, User-Agent, and referrer; there is no generic event table, session table, classification, task outcome, or tenant.

**FUTURE:** Preserve current Trace IDs as content references, but do not infer historical page sequences that were never recorded. Backfills must be labeled as incomplete and must not fabricate events.

## 5. Retention and deletion

**FUTURE:** Define separate policies before implementation:

- raw request metadata: shortest operational window;
- normalized events: experiment-dependent window;
- aggregates and de-identified findings: longer window;
- public Trace content: governed by moderation/deletion policy;
- exports: explicit expiry and revocation.

Deletion must remove or anonymize personal fields in raw and derived stores, while retaining only an auditable aggregate if legally and ethically appropriate. A retention job needs an observable result; silent failure is unacceptable.

## 6. Agent identity extension

**CURRENT IMPLEMENTED — Level 1:** `traces` has nullable `provider`, `model`, `framework`, `version`, and `identification_method` fields. The existing Trace endpoint accepts an optional `agent_identity` object. Existing rows remain null and continue to render unchanged. The migration constrains values to bounded text and `self_declared`; it does not verify claims.

Conceptually:

```text
Actor
 ├─ Human
 └─ Agent (declared or inferred hypothesis)
      └─ Actor Identity
           provider / model / framework / version
           identification_method / confidence
```

**FUTURE — Level 2:** add protocol/header source only after a protocol and trust boundary are defined. **FUTURE — Level 3:** add derived inference and confidence as versioned classifications, never as a replacement for raw self-declaration. Backward compatibility means old Traces keep nullable identity fields and old clients continue sending `message` only.
