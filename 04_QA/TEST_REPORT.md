# EventLens v3.0 Bilingual — Test Report

## Scope

This QA pass validates the merged Chinese/English product rather than two independent forks.

## Automated code/API results

Run from `02_Demo/`:

```bash
npm test
```

Result: PASS.

Validated:

- required bilingual files exist;
- no real `.env` is bundled;
- generic API-key/private-key scan passes;
- current `web_search` tool is used; legacy `web_search_preview` is absent;
- Chinese Mock path completes 9/9 stages and returns a Chinese-language report payload;
- English Mock path completes 9/9 stages and returns an English-language report payload;
- Chinese and English follow-up requests pass through the same backend with `language=zh|en`;
- the real Responses API code path is exercised with a local Stub in both languages;
- retrieval stages require Web Search when enabled;
- `url_citation` parsing succeeds;
- live preflight checks main model, fast model, Web Search, and citation parsing without printing the key.

## Browser/UI results

Run:

```bash
npm run test:ui
```

Result: PASS in the QA environment.

Validated:

- Chinese surface renders with `中文` selected;
- English surface renders with `English` selected;
- language controls are clickable;
- English offline scenario runs from input -> 9/9 -> full report;
- Research Loop follow-up works after the report;
- JavaScript page errors: 0;
- 375px Chinese layout has no page-level horizontal overflow and both language controls remain visible.

The QA environment blocks ordinary localhost/file navigation inside browser automation, so the language-navigation target is verified by UI click/function tests while each localized surface is rendered independently. Backend bilingual behavior is separately exercised end-to-end through HTTP tests.

## Language behavior

- Untouched built-in defaults localize when switching language.
- User-entered research input is designed to remain verbatim rather than being silently translated.
- Live analysis requests carry `language=zh|en`; backend prompts and report generation follow that value.
- A report already generated in one language is not silently translated through an extra model call; switch language and rerun to generate the other-language report.

## Boundaries

- Offline Demo data is synthetic.
- No real user API key was used for QA.
- The live API path was validated with a local Stub; reviewers should run `npm run check:live` with their own API credentials before a live demonstration.
