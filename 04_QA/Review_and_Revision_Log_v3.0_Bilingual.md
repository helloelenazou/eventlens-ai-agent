# EventLens v3.0 Bilingual | Review and Revision Log

## Summary

v3.0 consolidates the audited Chinese delivery and the English edition into a single bilingual product without splitting business logic or Agent architecture.

## Changes in v3.0

1. Added a top-right `中文 / English` language switcher to the Demo.
2. Preserved one shared backend and one shared nine-stage workflow.
3. Added `language=zh|en` to `/api/analyze` and `/api/followup` requests.
4. Added language-specific system prompts, stage prompts, stage labels, report fallbacks, Mock outputs, and follow-up prompts.
5. Kept analyst-entered event and portfolio text verbatim across language switching; untouched built-in defaults localize automatically.
6. Added bilingual design-document folders and bilingual launch guides.
7. Preserved prior security hardening: no embedded API key, generic secret scan, no bundled `.env`, live preflight, current `web_search` tool, and offline replay guard.

## QA gates

- Package completeness and generic secret scan.
- Chinese nine-stage Mock run.
- English nine-stage Mock run.
- Chinese and English follow-up API requests.
- Real Responses API code path through a local Stub for both languages.
- Required Web Search on retrieval stages and `url_citation` parsing.
- UI rendering in both languages, clickable language control, full English offline scenario, and Research Loop follow-up.
- SHA-256 verification after packaging.

## Language behavior boundary

The language switch controls UI and output language. It does not silently translate user-entered research input. A live report is generated in the language selected at run start; switching after a report is complete requires rerunning the event to regenerate the report in the other language. This avoids unrequested translation calls and additional API cost.
