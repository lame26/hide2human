# Agent Readiness Framework (Hypothesis)

“Agent Readiness Score” is a possible future product construct, not a current measurement or an established industry standard. The dimensions and weights below require validation against observed tasks, independent clients, and operator outcomes.

## Candidate dimensions

| Dimension | Candidate question | Evidence needed | Candidate interpretation |
|---|---|---|---|
| Discovery | Can an intended client find the public surface without a supplied URL? | Controlled source/cohort and first-request evidence | Discovery coverage |
| Understanding | Can it identify the page purpose and relevant data? | Task-specific selection or explanation plus action evidence | Semantic clarity |
| Navigation | Can it reach the needed resource with bounded detours? | Ordered journey against task graph | Information architecture |
| Actionability | Can it perform the intended operation? | Valid action and server-confirmed outcome | Interface/API usability |
| Reliability | Does the result repeat across runs and clients? | Replicated runs with variance | Operational stability |
| Machine Readability | Are markup, metadata, and data interfaces consistent and parseable? | Schema/parser checks and cross-representation tests | Technical accessibility |

## Candidate calculation policy

Do not publish a numeric score until these questions are answered:

1. What task and population does the score describe?
2. What is the denominator and minimum sample size?
3. Which evidence is observed versus declared?
4. How are missing and conflicting events handled?
5. How is classifier error propagated?
6. Can a customer reproduce the finding?
7. Does the score predict an operator-valued outcome?

**HYPOTHESIS:** A multidimensional profile with per-dimension evidence may be more honest and useful than a single number. Any weighting, thresholds, badges, or benchmark comparisons are future hypotheses, not commitments.

## Confidence

Each dimension should expose confidence based on evidence completeness, repeatability, source quality, and classification uncertainty. Confidence must not be confused with the probability that a requester is an AI.

## Current state

**CURRENT:** HIDE2HUMAN has semantic public surfaces and a Trace outcome, but no validated readiness benchmark, task suite, generic event stream, repeatability sample, or external-site comparison. No readiness conclusion can be drawn from the current repository.

## Agent identity levels

- **CURRENT IMPLEMENTED — Level 1 / Self-Declared:** optional Trace metadata (`provider`, `model`, `framework`, `version`) with `identification_method: self_declared`.
- **FUTURE — Level 2 / Protocol or Header Declared:** an explicitly defined protocol source and trust policy.
- **FUTURE — Level 3 / Behavioral Inference:** a versioned probabilistic classification with confidence.

None of these levels verifies identity. Identity source and identity confidence must remain separate from readiness dimensions.
