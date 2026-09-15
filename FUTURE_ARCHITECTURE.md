# HIDE2HUMAN Future Architecture

> This is a design proposal, not an implementation plan for the current repository.

## 1. Scope and terminology

This document describes a possible architecture **after E-001 has produced credible evidence**. It does not change the current Next.js application, Supabase schema, API, authentication, UI, or deployment.

Every statement is classified as:

- **CURRENT** — verified in the repository.
- **FUTURE** — a candidate design.
- **HYPOTHESIS** — a claim that requires experiment or customer evidence.
- **UNKNOWN** — not inferable from current data.

## 2. Current architecture

**CURRENT:** The deployed application is a small Next.js App Router site on Vercel with Supabase PostgreSQL/Auth. Public requests render a Trace Wall, record a cookie-based visitor and a limited visit event, and may submit a plain-text Trace. Service-role RPCs enforce the public and administrator rate limits. The public representation consists of server-rendered HTML, metadata, sitemap, robots, a JSON feed, and individual Trace pages.

```text
Browser / web fetch
        |
        v
Next.js pages, middleware, API routes
        |
        +--> Supabase service-role RPCs
        |       record_visit / create_trace / create_human_trace
        |
        +--> Supabase tables
                visitors / visit_events / traces / admin_users
        |
        +--> Admin dashboard (authenticated allowlist)
```

**CURRENT:** The system does not establish that a request is an AI Agent. `User-Agent`, referrer, cookie, timing, and message content are observation signals only. Public submissions are labeled `VISITOR`; authenticated operator submissions are labeled `HUMAN`.

**UNKNOWN:** Current application data does not prove organic discovery, page understanding, a single actor behind a Visitor ID, or whether a request came from a human, browser automation, crawler, or Agent.

## 3. Future layered architecture

The recommended evolution is additive and evidence-gated:

```text
                         HIDE2HUMAN
                              |
                    Experiment Layer
                 (hypotheses, interventions,
                   cohorts, consent, protocol)
                              |
                   Observation / Collection Layer
              (raw request, response, page, action signals)
                              |
                 Normalization and Classification
              (event schema, actor hypotheses, confidence)
                              |
                  Session / Journey Reconstruction
                              |
                       Analytics Layer
             Agent Analytics       Agent UX Audit
                              \       /
                         Product Layer
                    reports, benchmarks, APIs
                              |
                         SaaS Layer
                 sites, tenants, billing, governance
```

### Experiment Layer

**FUTURE:** Stores experiment definitions, intervention versions, cohorts, protocol, success criteria, and evidence links. It must distinguish directed arrival from natural discovery and preserve the exact conditions under which an observation occurred.

**Responsibility:** Decide what is being tested; it must not silently turn an analytics metric into proof of AI identity.

### Observation Layer

**FUTURE:** Appends privacy-minimized raw observations: request timestamp, site/path, response outcome, referrer where allowed, coarse client signal, form/API action, and experiment context. Raw observations are immutable or append-only, with redaction and retention controls.

**Responsibility:** Preserve what was observed, not an interpretation of who acted or why.

### Analytics Layer

**FUTURE:** Reads normalized events and derived sessions to calculate traffic, navigation, interaction, outcome, quality, and uncertainty metrics. It must retain provenance from every metric to its input events.

### Product Layer

**FUTURE:** Presents explainable dashboards, journey views, audit findings, and reports for a site operator. A report must show evidence, sample size, confidence, and limitations rather than an unsupported “AI score.”

### SaaS Layer

**FUTURE:** Adds site and tenant boundaries, ingestion credentials, role-based access, quotas, retention policies, exports, billing hooks, and a public API. This layer should not be introduced until an external-site pilot demonstrates repeatable user value.

## 4. Data flow and boundaries

```text
Request / action
   -> Raw Observation (unaltered, restricted)
   -> Normalized Event (stable vocabulary)
   -> Classification hypotheses + confidence
   -> Session / Journey (derived, revisable)
   -> Metric / finding (versioned calculation)
   -> Report / product view
```

Raw observations and derived classifications must be separate stores or clearly separate logical domains. Algorithms, bot lists, and classification rules will change; reprocessing must remain possible without collecting the visitor again.

The current application is intentionally a single experiment site. **FUTURE:** split collection from analysis when at least one of these is true:

1. event volume or query cost affects the public Trace experience;
2. more than one site needs independent ingestion;
3. retention and access rules differ for raw and aggregate data;
4. a classification or metric must be recomputed reproducibly;
5. a customer-facing API needs stable contracts.

Until then, a separate warehouse or event bus would add complexity without evidence of value.

## 5. Architecture decisions and non-goals

- **FUTURE:** classify `Observed Request`, `Suspected Agent`, `Declared Agent`, `Crawler`, `Browser`, `Human`, and `Unknown` as hypotheses, never identity facts.
- **FUTURE:** represent `Observation -> Classification -> Confidence`, with classifier version and evidence.
- **FUTURE:** keep experiment data separate from customer data and mark synthetic/test traffic.
- **FUTURE:** tenant isolation is a security boundary, not just a UI filter.
- **OUT:** User-Agent-only AI detection, AI-only hidden content, forced Agent traffic, automatic Trace generation, and claims that a page visit proves understanding.

## 6. E-001 gate

No Observation Expansion should be treated as a product commitment until E-001 has: a documented protocol, preserved request/response evidence, a valid post-arrival comparison, and an independently reviewed interpretation that does not overclaim AI identity. If E-001 remains unverified, the architecture remains an experiment log plus minimal operational telemetry.

## 7. Agent Identity Architecture

**CURRENT IMPLEMENTED — Level 1:** A public Trace request may optionally include `agent_identity` with `provider`, `model`, `framework`, and `version`. The server validates bounded text values, stores them as nullable Trace metadata, and records `identification_method = self_declared` when at least one value is supplied. The public UI labels the result `self-declared`.

**FUTURE — Level 2:** A protocol or trusted header may declare identity using `protocol_declared`, subject to an explicit protocol and trust policy. This is not implemented.

**FUTURE — Level 3:** Behavioral inference may estimate an Agent/model family from request and interaction patterns with a confidence value. It must remain a derived hypothesis and never become identity verification. This is not implemented.

Identity, identity source, and confidence remain separate concepts. Level 1 has source but no verified confidence; a self-declaration is not proof of provider, model, framework, or version.

### Observed Level 1 evidence

**CURRENT OBSERVED:** In E-002 Extension C, the Agent supplied:

```text
Framework / Agent: BrowserCode (Browser Use Cloud v4)
Model: GPT-5.6-Luna
```

The end-to-end path is therefore implemented and observed, but independent verification remains unavailable. The result should be described as “the Agent self-declared these values,” never as proof that the request originated from that model or framework.
