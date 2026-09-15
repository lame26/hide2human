# Product Vision

The product path is conditional. Technical feasibility, user value, and business viability are separate hypotheses.

```text
HIDE2HUMAN experiment
        -> Agent Observation
        -> Agent Analytics
        -> Agent UX Audit
        -> Agent Readiness profile
        -> Agent-ready Website Platform
```

| Stage | User | Problem / value | Data and technology | Difficulty | Validation / business meaning |
|---|---|---|---|---|---|
| HIDE2HUMAN | Project researchers | Can a public site be discovered and leave traces? | Current Next.js/Supabase experiment data | Low | E-001/E-002 evidence only; no commercial claim |
| Agent Observation | Researchers and early site operators | What did a client visibly request or do? | Privacy-safe raw observations, event schema, experiment registry | Medium | Interview and replay usefulness |
| Agent Analytics | Website operators | Which paths and outcomes occur for agent-like traffic? | Sessionization, classification hypotheses, metrics, uncertainty | High | Repeated decisions changed by reports |
| Agent UX Audit | Product/content teams | Where does a client fail to discover, understand, navigate, or act? | Task suite, evidence-linked findings, retests | High | Remediation produces measurable improvement |
| Agent Readiness | Teams preparing a site | How ready is a site for defined tasks? | Profile dimensions, benchmarks, confidence, versioned rubric | High | Score/profile predicts task outcomes |
| Agent-ready Website Platform | Developers and agencies | Make content and actions reliably machine-readable | Validation, schemas, APIs, WebMCP or equivalent where justified | Very high | External pilot and integration retention |

## Product principles

- Evidence before dashboards; dashboards before scores.
- Explain uncertainty and preserve raw-to-derived lineage.
- Never sell AI identity detection as the core promise.
- Keep public experiments, synthetic tests, and customer traffic separate.
- Make remediation actionable and retestable.

## Current boundary

**CURRENT:** HIDE2HUMAN has a public Trace Wall, basic visit metadata, moderation/admin access, and a documented E-002 result. **UNKNOWN:** whether external operators value these observations or will pay for them. No stage after the experiment is validated.

## Agent Identity Architecture

**CURRENT IMPLEMENTED — Level 1:** the existing Trace endpoint accepts optional self-declared `provider`, `model`, `framework`, and `version` metadata. **FUTURE — Level 2:** protocol/header declaration. **FUTURE — Level 3:** behavioral inference. Neither future level is implemented or equivalent to verification.
