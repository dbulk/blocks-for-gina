# Plan #mode-extension-api

Goal: Standardize how new modes are added with minimal cross-cutting edits.

## Commits
1. `refactor: formalize mode interface contract`
- Add required hooks for setup, end conditions, and summaries.

2. `feat: add mode registration validation`
- Validate duplicate IDs and missing fields at registration.

3. `feat: expose mode metadata for selection and hud`
- Provide display name, description, and competitiveness flags.

4. `test: add mode contract conformance tests`
- Verify default and custom modes satisfy contract.

5. `docs: add new mode authoring template`
- Add checklist and test template for mode PRs.
