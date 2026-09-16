# EventLens 2.9 Bilingual Edition | Material Event Impact Analysis Agent

**Version:** 3.0 Bilingual Edition  
**Target users:** Buy-side equity analysts, research leads, and portfolio managers  
**Team assumption:** 15 analysts covering consumer, healthcare, technology, new energy, and other sectors; each analyst tracks roughly 20-30 stocks at a time.  
**Demo objective:** Run at least one complete scenario from **event input -> 9-stage Agent workflow -> structured report -> deeper follow-up / new search**.

---

## 1. Problem Definition

After a public company discloses a material event, the investment team often has only 2-4 hours to answer three questions:

1. **What changed in the company's fundamentals?**
2. **Relative to prior expectations and valuation, which assumptions must be updated?**
3. **Which exposures in the current portfolio and related holdings require review?**

The bottleneck is not simply slow report writing. The entire research chain lacks a reusable and auditable quality floor:

- Information is scattered across filings, exchanges, company IR, media, sell-side research, industry data, and internal research notes.
- The most dangerous failure is not only citing something incorrectly; it is also **missing a relevant filing entirely**.
- Analysts vary significantly in the breadth and depth of event analysis.
- Earnings seasons create extreme bursts, with many material disclosures arriving on the same evening.
- A one-off report does not create a monitoring loop.
- A single-company view does not give a PM a portfolio-level impact map.
- Excessive standardization can suppress analyst alpha, so the system should provide a **standardized minimum bar while preserving individual judgement as the upside**.

EventLens is not positioned as an automatic price-direction predictor. It is designed to:

> **Turn a material event into an institutional-grade research draft that is traceable, challengeable, extensible, and overridable by a human analyst.**

---

## 2. Product Principles

### 2.1 Do not reduce the output to a simple bullish/bearish label

The output should cover, at minimum: event facts, fundamentals, earnings quality, balance sheet and solvency, expectation gap, valuation, portfolio impact, counterarguments, evidence gaps, and the next data points to monitor.

### 2.2 Separate facts, inferences, assumptions, and unknowns

- **Fact:** Explicitly provided by the user or supported by a traceable source.
- **Inference:** An interpretation derived from facts.
- **Assumption:** A parameter the analyst must explicitly accept, such as valuation multiples, scenario inputs, probabilities, or ranges.
- **Unknown:** Data that is unavailable, unverified, or not legally permitted for use.

### 2.3 Retrieval and completeness are separate workflows

The first retrieval pass asks, **"What relevant material can we find?"** The second, independent completeness pass asks, **"What might the first pass have missed?"** The second pass should specifically look for corrections, exchange inquiries, financing, guarantees, pledges, disposals, equity incentives, regulatory penalties, and M&A performance commitments that could overturn the initial thesis.

### 2.4 The report is not the end of the workflow

A research input box remains available below the report:

- **Deepen Analysis:** Continue decomposing causality, valuation assumptions, and counterarguments using the current report context.
- **New Search - Web:** Start a fresh public-evidence retrieval pass.
- **Start New Event:** Clear the current context and begin a new event.

### 2.5 Humans make investment decisions; Agents raise the quality floor

The system does not automatically place trades. Analysts can preserve their own model branches, override system assumptions, and leave evidence of independent review.

---

## 3. Core Interaction: A Three-State Research Workbench

### State A | Confirm Event

The page emphasizes one primary task: describe the event.

Optional context:

- Company and event description.
- Portfolio context. In an institutional deployment this should come from an authorized position system, not manual entry.
- The pre-event internal model or thesis version.

Primary CTA: **Start Analysis**.

### State B | Analysis in Progress

The left rail persistently displays the nine workflow stages. The current stage is highlighted and completed stages switch to a completed state. The main panel explains what the current stage is doing and shows a concise stage summary.

The interface must transition immediately after the CTA is clicked; there should be no interval where the user feels that the button did nothing.

### State C | Structured Report + Research Loop

After 9/9 stages complete, the right panel automatically becomes the structured research report. The research input remains available below the report for deeper analysis or a new search.

---

## 4. Nine-Stage Agent Architecture

```text
User event
  |
  v
01 Confirm event and entity
  |
  v
02 Materiality triage
  |
  v
03 Multi-source evidence retrieval -------------------+
  |                                                   |
  v                                                   |
04 Completeness and accounting-basis reconciliation   |
  |                                                   |
  v                                                   |
05 Fundamental and financial transmission             |
  |                                                   |
  v                                                   |
06 Expectation gap and valuation re-underwriting      |
  |                                                   |
  v                                                   |
07 Portfolio impact mapping                           |
  |                                                   |
  v                                                   |
08 Challenger + Verifier -----------------------------+
  |
  v
09 Integrated research report
  |
  v
Deepen analysis / New search / New event
```

### 01 Confirm Event and Entity

Goal: extract only the issuer, market, timing, event type, and facts explicitly present in the user's input. Do not silently fill missing numbers from general knowledge.

For A/H/ADR structures, separate `issuer` from `security`; a ticker cannot be treated as the company's only identity.

### 02 Materiality Triage

Suggested levels:

- **P0:** Potential default, major regulation, control change, serious fraud, liquidity crisis, or another issue requiring immediate escalation.
- **P1:** Likely to change earnings forecasts, valuation, or the portfolio thesis.
- **P2:** Worth recording but not worth a full deep-dive.
- **NULL:** The correct answer is no material change; archive quietly.
- **HOLD:** Evidence is insufficient, but the event may be material. Do not misclassify as NULL.

NULL events should produce a short card and be silently archived, with sampling for QA, to reduce alert fatigue.

### 03 Multi-Source Evidence Retrieval

A production retrieval layer should include:

- Official exchange and disclosure sources such as SSE/SZSE/CNINFO/HKEX or equivalent sources for the target market.
- Company website, investor relations, and earnings-call materials.
- Licensed institutional data such as Wind, Bloomberg, or sell-side research when contractual use is permitted.
- Reliable media and industry datasets.
- Internal models, meeting notes, and prior research within the user's authorization scope.

**Current Demo:** In real-LLM mode, EventLens uses the OpenAI Responses API `web_search` tool as its public-web retrieval entry point. Offline and Mock modes use synthetic data.

### 04 Completeness and Basis Reconciliation

This stage is not a second copy of the same search query. It is an independent missed-evidence detector focused on:

- Corrections and supplemental disclosures.
- Exchange inquiry letters and responses.
- Debt financing and covenant terms.
- Guarantees, equity pledges, and controlling-shareholder fund occupation.
- M&A consideration, purchase price allocation, goodwill, and performance commitments.
- Former company names, pre-restructuring entities, and multiple A/H security identities.
- Time-sequenced relationships between a report and subsequent corrections.

Completeness should not be binary. At minimum, the state should support: `complete / partial / unknown / source_unavailable`.

### 05 Fundamental and Financial Transmission

Coverage should include:

- **Revenue:** Volume, price, mix, geography, and segments.
- **Profit:** Gross margin, operating expenses, tax, minority interest, and one-off items.
- **Cash:** Operating cash flow, receivables, inventory, and capex.
- **Balance sheet:** Net debt, restricted cash, maturity gaps, and covenants.
- **Financing:** Equity issuance, convertible dilution, and refinancing.
- **M&A:** Consideration, PPA, goodwill, and earn-outs/performance commitments.
- **FX:** Separate transaction gains/losses from OCI/translation effects.
- **Governance red flags:** Related-party transactions, customer concentration, cash/wealth-management products, controlling-shareholder fund flows, and similar issues.

If segment disclosure is sufficient, the workflow may proceed to SOTP. If segment boundaries or segment earnings are insufficient, the system should explicitly refuse false precision.

### 06 Expectation Gap and Valuation Re-underwriting

The core question is not whether the news sounds positive or negative. It is:

> **Relative to what the market and the internal model expected before the event, what has changed and which assumptions must now move?**

Possible inputs:

- A frozen pre-event internal model.
- Consensus and sell-side estimate revision history.
- Northbound flows, short interest, turnover/crowding, or similar price-in context where legally and contractually available.
- Historical comparable events.

If these inputs are unavailable, the system must say that the price-in level cannot be determined. It should never fabricate a statement such as "70% is already priced in."

### 07 Portfolio Impact Mapping

The issuer is not the end of the analysis. A production system should map the same event to:

- The event subject.
- Upstream and downstream companies.
- Competitors.
- Potential beneficiaries and losers.
- Unknown exposures.
- Different funds, strategies, and permission domains.

The portfolio view should display both net contribution and gross absolute contribution so that offsetting positive/negative exposures do not hide risk.

### 08 Challenger + Verifier

The Challenger is tasked with attacking the current thesis. The Verifier checks claims one by one.

Recommended runtime controls:

- Citations must resolve to real source locations.
- Numbers, currency, period, consolidation basis, and growth basis should be checked separately.
- Unsupported claims are downgraded.
- Conflicting sources move the item to HOLD or human review.
- Model upgrades must pass regression tests and canary checks to prevent silent changes in judgement.

In real mode, the current Demo performs another public Web Search during the Challenger stage and returns URL citations. General semantic entailment verification remains a production requirement; the Demo does not pretend that this is fully solved.

### 09 Integrated Research Report

Minimum structure:

1. Executive judgement.
2. Event decomposition.
3. Fundamentals and financials.
4. Expectation gap and valuation.
5. Portfolio impact.
6. Counterarguments and invalidation conditions.
7. Evidence gaps.
8. Next validation steps.

---

## 5. Research Loop: Turn a One-Off Report into Continuous Research

After the report is generated, the analyst can continue with:

### Deepen Analysis

The backend carries the current report and recent follow-up history, then answers new causal, valuation, or risk questions without regenerating the entire report.

### New Search - Web

A fresh public-search chain retrieves new evidence and appends it to the current research thread rather than overwriting the original report. Typical questions include:

- Was a correction filed after the initial report?
- Is there an exchange inquiry letter?
- Do debt, guarantees, or pledges change the conclusion?
- Is there public evidence that weakens the current overseas-growth thesis?

### Production Follow-Through

```text
Event -> Thesis -> Tracking item -> New data -> Automatic comparison -> Reopen thesis -> Review
```

The deliverable Demo implements post-report research interaction and an API for follow-up. Scheduled monitoring, notification queues, and persistent review workflows remain production-layer capabilities.

---

## 6. Earnings-Season Burst, Cost, and Capacity Design

A 15-person team must design for simultaneous arrivals during peak periods such as April and August, not for average throughput.

A production capacity model should explicitly parameterize:

- Expected token and tool-call budget per event.
- RPM, TPM, and model concurrency slots.
- Reserved capacity for P0 events.
- Maximum concurrent in-flight cases per analyst.
- Manager review queue.
- Cache and de-duplication hit rates.
- Degradation order.

Recommended degradation order under overload:

1. Preserve P0/P1 issuer facts and hard-risk screening.
2. Reduce historical-comparable depth.
3. Delay low-relevance second-order portfolio propagation.
4. Produce short cards for P2 events.
5. Quietly archive NULL events and sample them for review.

The business case should not be expressed only as "time saved." A pilot should measure net analyst hours released, human review rate, material defect rate, missed-evidence rate, thesis-reopen rate, license/model/platform costs, and the percentage of released capacity that creates real value.

---

## 7. Compliance and Data Governance

A production system must additionally implement:

- Information barriers between research/investment and public-fund/separate-account domains as required by the institution.
- Input controls for MNPI and non-public expert-call notes.
- Action-level licensing for paid data: read, store, index, embed, external inference, and export.
- Server-side identity and least privilege.
- Tamper-evident audit logs, signatures, WORM storage, and retention policies.
- Legal/compliance confirmation for research-record requirements and data export.

**The current Demo's browser JSON, Mock data, and local logs must not be described as compliant institutional recordkeeping.**

---

## 8. A-Share / Hong Kong Disclosure Grammar

The event classifier should understand local disclosure stages and patterns, including:

- Earnings guidance -> preliminary results -> formal annual/interim report -> correction.
- Exchange inquiry letters and responses.
- Trading halts and resumptions.
- Share-sale rules and buybacks.
- Equity-incentive expense.
- Government subsidies.
- Goodwill, earn-outs, and performance commitments.
- VIE structures.
- Unaudited interim reports.
- Multiple A/H securities for the same issuer.
- Refinancing, convertible bonds, guarantees, and pledges.

Point-in-time analysis must preserve what was knowable at the time. A later correction must not be backfilled into an older snapshot as if it had already been available.

---

## 9. Human-AI Collaboration and Alpha Protection

The standard framework should define the minimum analytical floor, not force every analyst into the same view.

Recommended mechanisms:

- Ask the analyst to record an independent initial view before unlocking the AI draft for high-impact events.
- Record whether the analyst opened source documents, recalculated key figures, or changed assumptions rather than merely recording "approved."
- Use historical internal examples only when authorization, event type, and point-in-time constraints permit.
- Preserve personal model branches.
- Classify post-mortems into **AI error / human error / data error / assumption error**.
- Route feedback into the regression set of the responsible module, not into an unconsumed comment field.

---

## 10. Demo Technical Architecture

### 10.1 Offline Mode

```text
Open_Demo.html
  |
  v
Browser-local state machine
  |
  v
Fixed 9-stage workflow + synthetic scenario
  |
  v
Report + deeper analysis / simulated new search
```

No Node.js, API key, or network is required. This mode is intended for product demonstration.

### 10.2 Mock Backend Mode

```text
Browser -> Node server.js -> data/mock_stage_outputs.json
```

This mode validates the real request/streaming state machine without incurring API cost.

### 10.3 Real LLM Mode

```text
Browser
  |
  | /api/analyze (NDJSON)
  v
Node.js Orchestrator
  |
  v
OpenAI Responses API
  |-- GPT-5.6 Sol: complex financial, valuation, and report stages
  |-- GPT-5.6 Luna: lighter stages
  `-- web_search: retrieval, completeness, Challenger, and new search
  |
  v
Structured report + URL sources
```

The API key exists only in the backend `.env` file and never enters the HTML.

The implementation uses the Responses API `web_search` tool rather than the legacy `web_search_preview` integration.

---

## 11. What the Current Demo Implements vs. What Production Still Requires

| Capability | Current 2.9 English Demo | Production requirement |
|---|---|---|
| Input -> 9 stages -> report | Implemented | Service deployment and persistence |
| Post-report deeper analysis | Implemented | Authorized historical context and version control |
| New search | Real API mode supports Web Search; offline mode is explicitly simulated | Official exchange/Wind/Bloomberg/internal connectors |
| Independent completeness pass | Separate LLM + Web Search stage | Independent inventories, watermarks, cursors, and missed-document gold standards |
| Broad financial dimensions | Covered in prompts/report framework | Structured finance engine, accounting rules, deterministic validation |
| Portfolio mapping | User-provided portfolio context supported | Real portfolio aggregation, permission domains, derivatives risk |
| Automatic follow-up review | Designed; Research Loop interaction implemented | Scheduler, database, notifications, idempotency |
| Peak queue / ROI | Designed | Real load testing and operational parameters |
| Compliance records | Boundaries documented | Information barriers, licensing, WORM, legal approval |
| General PDF/XBRL/OCR | Not implemented | Dedicated parsing and quality evaluation |

---

## 12. Production Readiness: Key AI Agent Practice Issues

This section directly answers: **For a public-company material-event analysis Agent, what must be considered before moving from a Demo into a fund company's production environment?**

A Demo can prove that **input -> Agent processing -> structured output** is a viable product flow. Production difficulty, however, is not solved by writing a longer prompt. The system must make **data, orchestration, model reliability, permissions/compliance, capacity/cost, human review, and continuous operations** measurable, degradable, and auditable.

### 12.1 Data Access: Solve "See Everything" Before "Understand Everything"

**Scenario risk:** Missing one correction, exchange response, debt filing, or regulatory document can overturn an otherwise well-written conclusion.

**Production requirements:**

- Build multi-source connectors for exchanges/disclosure platforms, company IR, licensed financial data, reliable media, and internal research repositories.
- Normalize PDF, HTML, XBRL, scans, tables, notes, units, periods, currency, and consolidation scope.
- Maintain issuer/security/entity master data for renames, restructurings, and A/H/ADR identities.
- Separate first-pass retrieval from an independent completeness-reconciliation pass.
- Monitor inventories, watermarks, cursors, and source health. If a source is unavailable, return `unknown/source_unavailable` rather than pretending no relevant filing exists.

**Acceptance:** Build point-in-time historical gold sets and measure recall, missed-critical-document rate, duplicate rate, and degradation behavior when a source is unavailable.

### 12.2 Agent Orchestration: Every Agent Needs a Contract and a Stop Condition

**Scenario risk:** A single mega-prompt allows facts, inference, valuation, and portfolio actions to contaminate one another and makes root-cause analysis difficult.

**Production requirements:**

- The Orchestrator manages decomposition, routing, state, and budget; it should not secretly perform the analysis itself.
- Retrieval, completeness, finance, valuation, portfolio, Challenger, and Verifier nodes have explicit responsibilities.
- Each node has structured input/output schemas, timeout, retry limits, and failure states.
- Downstream nodes consume a validated fact table rather than separate model memories of the same facts.
- Token, tool-call, time, and cost budgets are enforced. When a budget is exhausted, the workflow may return a partial result instead of searching indefinitely.

**Acceptance:** Node unit tests, end-to-end state-machine tests, fault injection, and dependency tracing should show which stage and which evidence changed a conclusion.

### 12.3 LLM Reliability: "Looks Like Research" Is Not the Same as Correct

**Scenario risk:** Financial prose is persuasive by nature. Citation hallucination, accounting-basis errors, and unsupported causal claims can be hidden by polished writing.

**Production requirements:**

- Bind critical facts to precise source locations, not only URLs.
- Re-check numbers, units, currency, period, consolidation scope, YoY/QoQ basis with deterministic code.
- Execute finance and valuation calculations in testable code where possible; use the LLM to explain and frame assumptions.
- Downgrade unsupported claims to inference or pending verification.
- Send conflicting sources to HOLD or human review.
- Keep the Challenger as independent as practical from the primary analysis path.

**Acceptance:** Claim-level citation correctness, numeric accuracy, unsupported-claim rate, conflict-handling rate, and expert blind review.

### 12.4 Non-Determinism and Model Version Governance

**Scenario risk:** Repeated runs may produce different narratives; provider upgrades can silently change the output or core judgement.

**Production requirements:**

- Pin model version, system prompt, tool configuration, evidence snapshot, and analysis timestamp.
- Persist runtime version, prompt/policy version, evidence hashes, and output summary.
- Run frozen regression sets and canaries before model changes.
- Diff critical conclusions and require human approval above a threshold.
- Dual-model or dual-path review can help on high-impact events, but majority voting must not be mistaken for fact verification.

**Acceptance:** Critical-field stability on frozen inputs, regression failure rate, canary difference rate, and rollback drills.

### 12.5 Materiality Triage: Decide Whether an Event Deserves Deep Analysis

**Scenario risk:** If every low-value filing produces a long report, alert fatigue will bury the P0/P1 risks.

**Production requirements:**

- Use P0/P1/P2/NULL/HOLD triage.
- Archive NULL events with short cards and sampled review.
- Route potentially material but incomplete cases to HOLD, not NULL.
- Allow hard-risk rules for liquidity, control, regulation, and default to override normal ranking.

**Acceptance:** In addition to material-event precision/recall, run a NULL test measuring correct silence, false positives, and material false negatives.

### 12.6 Earnings-Season Bursts, Cost, and Degradation

**Scenario risk:** Fifteen analysts covering roughly 300-450 company relationships may receive many disclosures on the same evening during April and August, compressing the 2-4 hour response window.

**Production requirements:**

- Budget tokens, tool calls, search calls, and estimated cost per event.
- Manage RPM, TPM, model slots, search concurrency, parsing queues, and human review queues together.
- Reserve capacity for P0/P1.
- Cache identical filing parses and de-duplicate shared events across analysts.
- Define overload degradation: preserve issuer facts/hard-risk screening -> reduce historical depth -> delay second-order propagation -> P2 short cards -> NULL silence.
- Measure not only machine SLA but whether humans can finish review inside the decision window.

**Acceptance:** Replay earnings-season bursts and report P50/P95 latency, queue depth, timeout rate, per-event cost, and human-review backlog.

### 12.7 Human in the Loop: Prevent Automation Bias and Preserve Alpha

**Scenario risk:** A polished, cited AI draft can reduce skepticism. Over-standardization can also remove legitimate analyst differentiation.

**Production requirements:**

- For important events, capture an independent analyst view before exposing the AI draft.
- Track whether sources were opened, key numbers were recalculated, and assumptions were changed rather than only recording "approved."
- Standardize analytical dimensions while allowing personal model branches and alternative valuation frameworks.
- Route AI/human/data/assumption failure reasons back into module-specific evaluation sets.
- Use internal few-shot examples only when permissions and point-in-time constraints are satisfied.

**Acceptance:** Independent-view completion rate, key-number recomputation rate, AI override rate and reasons, material-defect discovery rate, and preservation of analyst branches.

### 12.8 Permissions, MNPI, Paid Data, and Auditability

**Scenario risk:** The Agent may encounter separate-account holdings, internal research, expert calls, potential MNPI, or licensed Wind/Bloomberg content. A technically correct answer may still be unusable if the data handling is impermissible.

**Production requirements:**

- Server-side information barriers across research/investment, public-fund/separate-account, and strategy domains as required.
- Attach permission domain, source license, and allowed actions (`read/store/index/embed/external inference/export`) to each evidence object.
- Block and escalate suspected MNPI, leaked documents, or unapproved expert-call notes.
- Keep API keys, positions, and internal documents out of the frontend.
- Use signed, tamper-evident/WORM audit records with explicit retention policies.
- Compliance and legal teams must confirm applicable regulatory and vendor-contract requirements; the Demo cannot substitute for that conclusion.

**Acceptance:** Unauthorized-access testing, cross-domain contamination tests, MNPI drills, vendor-license matrix review, and audit-integrity verification.

### 12.9 Continuous Research Loop

**Scenario risk:** Event reports often depend on unverified assumptions. Without a future trigger, the report quickly becomes disposable.

**Production requirements:**

- Convert key assumptions into structured tracking items: metric, period, unit, threshold, source, owner, and thesis version.
- Compare new actuals automatically with the original assumption.
- Re-run only affected nodes and reopen the thesis when a trigger fires.
- Process duplicate data idempotently and preserve correction history.
- Create a new reviewed version rather than silently overwriting the old conclusion.

**Acceptance:** Trigger accuracy, duplicate-notification rate, correction handling, thesis-reopen success rate, and latency from data arrival to review.

### 12.10 Production Monitoring and Continuous Evaluation

**Scenario risk:** Data sources, models, prompts, tools, and analyst behavior all change after launch.

**Production requirements:**

- Monitor source health, parser failures, search failures, model 429/5xx, tokens/cost, latency, stage failures, and human queues online.
- Maintain offline gold sets stratified by sector and event type.
- Feed analyst overrides, overturned conclusions, and tracking outcomes back to the responsible module.
- Evaluate retrieval, facts, calculations, expectation gaps, portfolio mapping, NULL behavior, human review, and stability rather than only report style.
- Support safe fallback to rules/manual workflow whenever production metrics breach thresholds.

**Acceptance:** Launch thresholds and ongoing SLOs for critical recall, claim support, numeric accuracy, P95 latency, per-event cost, human material-defect rate, NULL false-positive/false-negative rate, and model-version regression results.

### 12.11 Release Logic from Demo to Production

EventLens should not be released because the Demo can call an LLM and generate a complete report. Production release must meet four groups of gates:

| Gate | What must be proven |
|---|---|
| **Research correctness** | Critical evidence retrieval, facts/numbers/basis, counterevidence, and valuation inputs meet an expert-approved quality bar |
| **System reliability** | Peak concurrency, timeout recovery, idempotency, versioning, and degradation work under a real SLA |
| **Compliance and security** | Permission domains, MNPI handling, paid-data licensing, audit, and retention are approved by institutional compliance/legal teams |
| **Human-AI effectiveness** | The system releases analyst capacity and improves response consistency without materially increasing defects or automation bias |

A production pilot should use **point-in-time historical replay + limited real shadow mode + parallel human workflow**. First prove that the system does not miss material events, does not create false certainty, and can fail safely. Then expand coverage gradually rather than treating Agent output as an investment decision.

---

## 13. Demo Acceptance Criteria

The deliverable must satisfy all of the following:

1. Double-clicking `Open_Demo.html` runs the offline Demo.
2. The green CTA immediately enters the running state.
3. The nine stages advance visibly in the left rail.
4. A complete report appears automatically after 9/9.
5. **Deepen Analysis** works after the report.
6. **New Search** is explicitly simulated offline and uses the backend in real mode.
7. **Start New Event** clears the current context.
8. The Mock backend can run all nine stages and the follow-up API.
9. The real API code path can be verified with a local Stub without spending API credits.
10. The package must contain no real API key or real `.env` file.

Automated tests are under `02_Demo/tests/`. QA results are under `04_QA/TEST_REPORT.md`.


---

## Bilingual interaction layer (v3.0)

The same EventLens Agent supports Chinese and English. A language switcher in the top bar controls the UI, all nine Agent-stage labels, live LLM system/stage prompts, the final report, and Research Loop follow-ups. When the user switches languages, untouched built-in sample inputs localize automatically; analyst-entered event and portfolio text is preserved verbatim so the system never silently rewrites research inputs.

Offline Demo mode carries localized synthetic outputs for both languages. In live LLM mode, requests include `language=zh|en`, and the backend selects language-specific prompts. Language selection changes presentation and generation language only; it does not change evidence rules, calculations, governance controls, or risk logic.
