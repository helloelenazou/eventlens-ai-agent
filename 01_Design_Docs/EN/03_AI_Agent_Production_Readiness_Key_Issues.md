# EventLens 2.9 Bilingual Edition | Key AI Agent Production-Readiness Issues

> **Prompt addressed:** Based on the chosen "public-company material event impact analysis" scenario, explain the key AI Agent practice issues that must be considered before moving into production.

This is the standalone review version of Section 12 in the main product design document. It is not a generic discussion of LLMs; it maps production issues directly to the EventLens institutional-research use case.

## One-Page Conclusion

Moving from Demo to production is not about adding more Agents. Ten areas must become **measurable, degradable, auditable, and human-overridable**:

1. **Data and retrieval completeness:** Multi-source connectors, PDF/XBRL/OCR/table-note parsing, entity master data, and an independent completeness pass.
2. **Agent orchestration and boundaries:** Node responsibilities, schemas, stop conditions, token/tool budgets, and failure states.
3. **LLM reliability and verification:** Claim-level citations, deterministic numeric/accounting-basis checks, unsupported-claim downgrades, and an independent Challenger.
4. **Non-determinism and model governance:** Freeze model/prompt/evidence snapshots; use regression sets, canaries, output diffs, and rollback.
5. **Materiality triage and NULL tests:** Avoid generating long reports for every disclosure and reduce alert fatigue.
6. **Peak capacity, cost, and degradation:** Design RPM/TPM, concurrency, P0 reservation, and human queues for April/August earnings-season bursts.
7. **Human in the loop and alpha protection:** Independent initial judgement, recomputation traces, personal model branches, and AI/human error attribution.
8. **Permissions, MNPI, data licensing, and audit:** Information barriers, action-level permissions, WORM/signed records, and compliance approval.
9. **Continuous monitoring loop:** Event -> thesis -> tracking item -> new data -> comparison -> reopen thesis -> review.
10. **Production monitoring and continuous evaluation:** Retrieval, claim support, numeric accuracy, NULL behavior, cost, latency, queues, model regression, and safe fallback.

## Why These Issues Are Especially Important Here

EventLens serves a 15-person buy-side research team. Each analyst tracks 20-30 stocks, and the decision window after a material event is often only 2-4 hours. The domain has four defining properties:

- Missing one critical document can be more damaging than writing one sentence incorrectly.
- Conclusions must be explained relative to pre-event expectations and real portfolio exposure, not merely news sentiment.
- Earnings season is a burst-concurrency problem, not an average-throughput problem.
- Errors can influence real capital decisions, so traceability, permissions, and human review are core product requirements rather than back-office extras.

## Production Design and Acceptance Matrix

| AI Agent production issue | EventLens-specific risk | Production design | Core acceptance metric |
|---|---|---|---|
| Data / retrieval | Missed correction, inquiry, or debt filing | Multi-source retrieval + independent inventory/citation-closure reconciliation | Critical-document recall, miss rate |
| Agent orchestration | Different Agents use conflicting numbers | Validated fact table, structured schemas, node budgets | Stage success, dependency traceability |
| Hallucination / citation | Citation exists but does not support the claim | Claim-level verifier + deterministic numeric/basis checks | Citation correctness, unsupported-claim rate |
| Non-determinism | Same input drifts; model upgrade changes judgement | Version pinning, regression, canary, diff | Critical-field stability, regression-failure rate |
| Triage | Low-value events create long reports | P0/P1/P2/NULL/HOLD + NULL test | NULL false positive/negative, material FN |
| Peak / cost | Hundreds of events arrive together | RPM/TPM/concurrency budgets, caching, P0 reserve, degradation | P95 latency, queue depth, cost/event |
| Human-AI collaboration | Automation bias; alpha gets flattened | Independent view, manual recomputation, personal branches | Override rate, material-defect discovery |
| Security / compliance | MNPI, separate-account positions, licensed data misuse | Server-side barriers, action permissions, WORM audit | Unauthorized-access tests, audit integrity |
| Research loop | Assumptions are never revisited | Tracking contracts + thesis reopen | Trigger accuracy, review latency |
| Production operations | Data/model/prompt changes over time | Online monitoring + offline gold sets + safe fallback | SLO, regression results, degradation success |

## Recommended Rollout Sequence

**Phase 1 | Shadow mode:** Read real authorized data but do not produce the official research record. Run in parallel with the human process and establish missed-evidence and material-defect baselines.

**Phase 2 | Analyst assist:** Allow drafts and the Research Loop, but require human confirmation for all P0/P1 conclusions. No automatic trading.

**Phase 3 | Team production:** Connect real portfolios, internal models, and tracking systems. Enable information barriers, permission domains, immutable audit, and earnings-season elastic capacity.

**Phase 4 | Continuous operations:** Require regression/canary testing for model upgrades. Continuously feed analyst overrides and subsequent outcomes into evaluation sets.

## Release Principle

A production system must prove:

> **It does not miss material events, does not manufacture false certainty, fails safely, and lets a human see and overturn the Agent's basis.**

Success cannot be measured only by faster report generation. It must cover research correctness, system reliability, compliance/security, and human-AI effectiveness.

For more detail, see:

- `01_EventLens_Product_Design_v3.0_EN.md`, Section 12.
- `02_Production_Architecture_and_Acceptance_Boundaries.md`.


---

## Bilingual interaction layer (v3.0)

The same EventLens Agent supports Chinese and English. A language switcher in the top bar controls the UI, all nine Agent-stage labels, live LLM system/stage prompts, the final report, and Research Loop follow-ups. When the user switches languages, untouched built-in sample inputs localize automatically; analyst-entered event and portfolio text is preserved verbatim so the system never silently rewrites research inputs.

Offline Demo mode carries localized synthetic outputs for both languages. In live LLM mode, requests include `language=zh|en`, and the backend selects language-specific prompts. Language selection changes presentation and generation language only; it does not change evidence rules, calculations, governance controls, or risk logic.
