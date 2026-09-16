# EventLens v3.0 Bilingual Edition | Launch Instructions

## 1. What this package is

EventLens is an AI Agent Demo for professional buy-side analysts to evaluate material public-company events. v3.0 merges the prior Chinese and English editions into **one bilingual product** with a `中文 / English` switcher in the top-right corner.

The selected language controls:

- Demo UI;
- all nine Agent-stage labels;
- localized offline Demo report and Research Loop;
- live LLM system/stage prompts, final report, and follow-up research.

Analyst-entered event and portfolio text is **preserved verbatim** when the UI language changes. EventLens does not silently translate research inputs.

---

## 2. Reviewer 5-minute path

### Path A: Complete interaction with no API cost

1. Extract the ZIP and keep the folder structure intact.
2. Open `02_Demo/`.
3. Double-click `Open_Demo.html`.
4. Choose **English** in the `中文 / English` switcher.
5. Keep the built-in CATL event unchanged and click **Start Analysis (Demo)**.
6. Confirm the left rail advances from `0/9` to `9/9` and automatically opens the structured report.
7. At the bottom of the report, test:
   - **Deepen Analysis**;
   - **New Search · Web** (offline mode explicitly labels this as a simulated, non-network search);
   - **Start New Event**.

Offline Demo mode requires no Node.js, no API key, no network, and incurs no API cost.

> The offline build contains one complete synthetic CATL scenario. Other inputs are explicitly labeled **Offline Example Replay** and are never presented as real analysis of the new event.

### Path B: Local Mock backend

Requires Node.js 18+.

- Windows: run `start-windows.bat`.
- macOS: run `start-mac.command`.

If `.env` is absent, the launcher automatically uses Mock mode. The language switcher remains available in the browser.

### Path C: Live LLM + Web Search

1. Confirm Node.js 18+:

```bash
node --version
```

2. In `02_Demo/`, copy:

```text
.env.example -> .env
```

3. Put your own newly generated API key only in `.env`:

```text
OPENAI_API_KEY=replace_with_your_new_key
OPENAI_MODEL=gpt-5.6-sol
OPENAI_FAST_MODEL=gpt-5.6-luna
ENABLE_WEB_SEARCH=true
MOCK_MODE=false
PORT=8787
```

4. Run preflight:

```bash
npm run check:live
```

5. After PASS, start:

```bash
npm start
```

or use the Windows/macOS launcher.

6. Open:

```text
http://localhost:8787
```

In live mode, `/api/analyze` and `/api/followup` receive `language=zh` or `language=en`. The backend selects the matching Agent prompts, so this is not merely a translated UI.

---

## 3. Language-switch behavior

### Switch before analysis

Recommended. Untouched built-in event and portfolio examples localize automatically.

### Switch after entering a custom event

The original analyst input is preserved. For example, a Chinese event can remain Chinese while the UI and LLM output are set to English. This prevents silent mutation of source input.

### Language of an already generated report

A live report is generated in the language selected when that analysis run starts. To create the other-language version, switch language and rerun the event. This avoids an unrequested extra translation-model call and additional cost.

---

## 4. Runtime modes

| Mode | Node.js | API key | Network | Real model | Best for |
|---|---|---|---|---|---|
| Offline Demo | No | No | No | No | Fastest UI/workflow review |
| Mock backend | Yes | No | No | No | Frontend/backend + streamed stages |
| Live LLM | Yes | Yes | Yes | Yes | Real Agent + Web Search review |

---

## 5. Live-mode security

- Never place an API key in HTML, JavaScript, README files, screenshots, email, or chat.
- Never add a real `.env` back into a shared ZIP.
- `.gitignore` excludes `.env`.
- Revoke any key that has ever been exposed.
- `npm run check:live` never prints the key, but it does use a small amount of API/Web Search usage.

---

## 6. Nine-stage Agent flow

1. Confirm event and entity
2. Materiality triage
3. Multi-source evidence retrieval
4. Completeness and basis reconciliation
5. Fundamental and financial transmission
6. Expectation gap and valuation re-underwriting
7. Portfolio impact mapping
8. Challenger and citation verification
9. Integrated research report

Retrieval, completeness reconciliation, and Challenger can use Web Search in live mode. Missing evidence must remain unknown/pending evidence.

---

## 7. Automated tests

From `02_Demo/`:

```bash
npm test
```

Covers:

- bilingual package completeness;
- Chinese and English nine-stage Mock analysis;
- bilingual follow-up requests;
- Responses API live code path through a local Stub (no external API cost);
- `web_search` + `tool_choice=required`;
- `url_citation` parsing;
- generic secret scanning.

If Playwright is available:

```bash
npm run test:ui
```

---

## 8. FAQ

**Why is the green button unavailable?**

When `Open_Demo.html` is opened directly, EventLens should automatically use offline Demo mode and keep the button enabled. In backend mode, open the app through `http://localhost:<PORT>`.

**Why does my Chinese event stay Chinese after I switch the UI to English?**

Intentional. Research input is treated as source material and is never silently rewritten. The live LLM output follows the selected language.

**Why does an arbitrary offline input still lead to a CATL example?**

There is one complete synthetic offline scenario. Unsupported inputs are explicitly labeled as example replay. Arbitrary-event analysis requires live LLM mode.

**How do I know the live API is ready before an interview?**

Run `npm run check:live` before starting the live demo.

---

## 9. Package layout

```text
EventLens_Final_Delivery_v3.0_Bilingual/
├─ 01_Design_Docs/
│  ├─ ZH/
│  └─ EN/
├─ 02_Demo/
│  ├─ Open_Demo.html
│  ├─ Open_Demo_EN.html
│  ├─ 打开Demo.html
│  ├─ public/index.html
│  ├─ public/index-en.html
│  ├─ server.js
│  ├─ .env.example
│  ├─ data/
│  ├─ scripts/
│  ├─ tests/
│  └─ qa/
├─ 03_README/
└─ 04_QA/
```
