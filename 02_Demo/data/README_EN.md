# Demo Data Notes

This directory contains **synthetic demonstration data only** for stable no-API and Mock-mode testing.

- `demo_scenario.json`: the complete built-in input scenario and reproducible illustrative revenue decomposition.
- `portfolio_sample.json`: synthetic portfolio context.
- `mock_stage_outputs.json`: fixed outputs for the nine Mock backend stages and post-report follow-up actions.

Real LLM mode does not treat these synthetic values as company facts. Retrieval stages use the Responses API Web Search integration for public evidence, and any unretrieved field must remain **unknown / pending evidence**.
