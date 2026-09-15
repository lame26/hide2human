# Monetization Hypotheses

Pricing, packaging, and willingness to pay are unvalidated hypotheses. No prices are fixed in this document.

Agent identity metadata is not a verification product promise. **CURRENT IMPLEMENTED — Level 1** stores optional self-declarations only. Protocol-declared and inferred identity remain future research and must not be sold as verified identity.

| Model | Customer | Value | Charging unit hypothesis | Advantages | Risks / barriers | Technical needs | Validation |
|---|---|---|---|---|---|---|---|
| Free | Curious developers and small sites | Basic agent-like traffic and unknown/known breakdown | One site, limited history/events | Distribution and learning | Low retention, support cost, misleading free metrics | Safe collection, basic dashboard, quotas | Landing test and activation interviews |
| Pro | Individual site operators | Deeper journeys, filters, exports, alerts | Site or event-volume tier | Clear self-serve upgrade path | Classification uncertainty may reduce trust | Sessionization, metric lineage, export controls | Paid pilot and repeated weekly use |
| Business | Product/content teams | UX audit, task runs, reports, remediation tracking | Site + task suite/report volume | Higher actionable value | Requires reliable evidence and support | Audit runner, findings, roles, reports | Before/after remediation study |
| Agency | Agencies managing multiple clients | Multi-site comparison and branded reports | Workspace/site bundle | Aggregation and distribution | Tenant isolation and client data boundaries | Multi-tenant RBAC, scoped exports, white-label report | Agency design partner |
| Enterprise | Large organizations | API, governance, custom retention/reporting | Contracted volume/features | Larger value and budget | Procurement, security, compliance, SLA | SSO, audit logs, isolation, API, support | Security review and paid proof of concept |
| Report sale | Teams needing one assessment | One-off external audit | Per report or engagement | Simple initial purchase | Not recurring, labor-intensive | Evidence collection and report workflow | Concierge pilot |
| Affiliate / partner | Agencies or infrastructure partners | Referral or implementation revenue | Referral/commission | Extends reach | Conflict of interest, weak fit | Partner tracking and disclosures | Partner interviews |
| Advertising | Broad site audience | Sponsored placement | Impression/click | Familiar model | Conflicts with privacy and trust; low relevance | Ad system and policy controls | Generally defer unless evidence supports it |

## Guardrails

Do not monetize raw Visitor IDs, individual-level surveillance, unsupported AI labels, or undisclosed message content. Enterprise pricing must not imply higher certainty; it may buy governance, volume, support, and integrations.

## Validation sequence

1. Demonstrate technical collection and replay.
2. Observe an operator making a real remediation decision.
3. Repeat the decision across sites or tasks.
4. Test a paid pilot before defining tiers or prices.
