# EventLens 2.9 Bilingual Edition | Production Architecture and Acceptance Boundaries

This document prevents a runnable Demo from being misrepresented as an institutional production system.

## 1. System Layers Required for Production

1. **Data connector layer:** Exchanges, disclosure platforms, licensed financial data, company IR, and internal research repositories; supports pagination, watermarks, versioning, corrections, and entitlement receipts.
2. **Document parsing layer:** PDF/XBRL/HTML, tables, notes, OCR, units/periods/currency, and consolidation scope.
3. **Identity master-data layer:** Separates issuer, security, and legal entity; handles renames, reverse mergers/restructurings, A/H/ADR identities.
4. **Retrieval-completeness layer:** Independent inventory reconciliation, citation closure, gap states, and source-health monitoring.
5. **Financial calculation layer:** Separates deterministic calculations from LLM narrative; EPS, dilution, net debt, covenants, PPA, SOTP, and similar calculations should run in testable code.
6. **Portfolio and permission layer:** Information barriers, user entitlements, real positions, portfolio aggregation, and risk budgets.
7. **Tracking and review layer:** KPI contracts, scheduler, outbox, idempotency, correction history, and thesis reopening.
8. **Audit and compliance layer:** Immutable logs, signatures, WORM, retention, data licensing, and MNPI policy.
9. **Model-operations layer:** Model pinning, regression sets, canaries, safe degradation, token/tool budgets, and peak queues.

## 2. Retrieval Acceptance Is Not "We Found Several Sources"

Use frozen historical samples and label a gold set of required documents by event type and industry. Measure:

- Required-document recall.
- Miss rate for high-impact corrections, inquiries, debt, and similar documents.
- Duplicate/mirror de-duplication accuracy.
- Correct distinction among `source_unavailable`, `partial`, and `unknown`.
- Retrieval coverage for A/H identities, old names, and renamed issuers.

## 3. LLM Runtime Acceptance

- URL citations must correspond to the supporting source content.
- Numbers, units, and periods are checked item by item.
- Unsupported claims must be downgraded.
- Output differences across repeated runs on the same frozen input must be observable.
- Model-version changes must pass a regression gate.
- High-impact conclusions require human review or a deterministic verifier.

## 4. Materiality Triage Acceptance

A NULL test is mandatory. Test disclosures where the correct answer is "no deep dive required" and measure false triggering/alert fatigue. Also test that potentially material events with missing evidence are not incorrectly classified as NULL.

## 5. Peak-Capacity Acceptance

At minimum, simulate:

- 450 raw documents / 300 de-duplicated events arriving in a burst.
- 900 raw documents / 600 de-duplicated events arriving in a burst.
- P0 and P1 events cutting into the queue simultaneously.
- API 429, timeout, and search failure.
- Analyst human-review queues becoming the bottleneck.

The output should include not only machine completion time, but also analyst-completion time and manager-approval capacity.

## 6. Compliance Boundary

The current Demo:

- Does not connect to real paid financial data.
- Does not process real MNPI.
- Contains no real portfolio positions.
- Does not provide legally sufficient institutional research-record retention.
- Does not trade automatically.

Institutional deployment requires joint approval from compliance, legal, data-vendor contract owners, and security teams.

---

## 7. Mapping to the "AI Agent Production Readiness" Requirement

This document defines the production acceptance boundary. For a concise, standalone answer to the production-readiness question, see `03_AI_Agent_Production_Readiness_Key_Issues.md`. Section 12 of the main product design document provides the full **risk -> solution -> acceptance** explanation.


---

## Bilingual interaction layer (v3.0)

The same EventLens Agent supports Chinese and English. A language switcher in the top bar controls the UI, all nine Agent-stage labels, live LLM system/stage prompts, the final report, and Research Loop follow-ups. When the user switches languages, untouched built-in sample inputs localize automatically; analyst-entered event and portfolio text is preserved verbatim so the system never silently rewrites research inputs.

Offline Demo mode carries localized synthetic outputs for both languages. In live LLM mode, requests include `language=zh|en`, and the backend selects language-specific prompts. Language selection changes presentation and generation language only; it does not change evidence rules, calculations, governance controls, or risk logic.
