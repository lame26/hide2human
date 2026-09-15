# Agent UX Audit Vision

Agent UX Audit is a future evidence-based review of whether a website can be discovered, understood, navigated, and used by varied automated clients. It is not an AI detector and not a guarantee that an Agent has understood a page.

## Audit dimensions

| Dimension | Measurement method | Required events | Success condition | Failure condition | Confidence / current observability |
|---|---|---|---|---|---|
| Discovery | Compare entry source, public surface, first request, and experiment cohort | Request, referrer/source, sitemap/feed fetch, session start | A documented discovery path is observed without forced arrival | Only direct URL or no source evidence | Confidence from source completeness; **CURRENT:** limited request metadata |
| Understanding | Use task-specific comprehension/action evidence, not content claims | Task prompt/version, relevant page/Trace views, successful next action | Agent selects the intended resource or action under a blinded protocol | Misinterpretation, irrelevant action, or no evidence | Requires controlled replay; **CURRENT:** E-002 shows post-arrival interpretation only |
| Navigation | Evaluate ordered steps against a task graph | Page, link, detail, feed, and form events | Required path completed with bounded detours | Dead end, repeated failure, inaccessible target | Depends on complete event sequence; **CURRENT:** incomplete |
| Actionability | Measure valid actions and outcome state | Form/API attempts, validation, success, task events | Intended operation succeeds without operator intervention | Error, rate limit, unsupported format, abandonment | Requires explicit tasks; **CURRENT:** Trace creation only |
| Reliability | Repeat the same protocol across runs/clients | Run ID, event sequence, response status, timing | Stable outcome and acceptable variance | Inconsistent result or intermittent error | Statistical sample needed; **CURRENT:** unknown |
| Recoverability | Inject or observe recoverable failures and inspect next action | Error, retry, alternate-link, recovery events | Client finds a documented valid recovery path | Repeated failure or unsafe fallback | Must avoid harmful production interventions; **CURRENT:** only HTTP/app errors are partial signals |
| Machine Readability | Validate semantic HTML, metadata, JSON/feed schema, and parsability | Fetch/parse results, schema version, content consistency | Human and machine-readable representations agree | Missing labels, invalid structure, divergent content | Static checks plus behavioral evidence; **CURRENT:** public HTML/metadata/feed exist |

## Audit output

**FUTURE:** An audit finding should contain dimension, evidence references, test version, observed result, confidence, known confounders, remediation suggestion, and retest status. A score may summarize findings only if its weighting is experimentally justified.

## Current boundary

The current site intentionally provides normal public HTML, metadata, sitemap, robots, JSON feed, a Trace form, and Trace detail pages. It does not instrument page reading, comprehension, task completion, or client-side interactions. E-002 is evidence of directed post-arrival interaction, not a complete UX audit.

## Ethical and operational rules

- Do not conceal content from people or reveal secrets to suspected Agents.
- Do not submit automated public content without an approved experiment.
- Do not treat a crawler fetch as comprehension.
- Separate synthetic test traffic from public experiment and customer traffic.
- Report missing evidence as unknown, not as a failing score.

## Identity metadata

**CURRENT IMPLEMENTED — Level 1:** an Agent can self-declare optional identity metadata in the existing Trace POST payload. This is an observation about the request source, not a UX audit result.

**FUTURE:** protocol-declared identity and behavioral inference are separate evidence sources. They must never be silently merged with self-declared values or presented as verified identity.

## Action authorization evidence

**FUTURE:** Audit runs may record whether an action was available, discovered, authorized, selected, executed, or declined. The E-002 extensions show why these states should be separated: the same Trace affordance was discovered in an observation-only task but executed only when the task allowed or explicitly requested the external action. This is a candidate observation model, not current instrumentation.
