# Plan #mode-extension-api

Goal: Standardize how new modes are added with minimal cross-cutting edits.

## Implementation Steps

### 1. `refactor: formalize mode registration contract`
- Add `ModeRegistration` input contract with defaults for `implemented` and `competitive`.
- Validate mode registration for blank id/name/description and duplicate IDs.

### 2. `feat: add pluggable mode rule hooks`
- Convert mode end rules to hook map with `registerModeEndRuleHook(modeId, hook)`.
- Keep existing timed/sprint behavior as defaults in the hook map.

### 3. `feat: add pluggable summary hooks`
- Add `getModeSummaryHooks(modeId)` and `registerModeSummaryHooks(modeId, hooks)`.
- Route game-over summary title/hide-blocks/move-formatting through hooks.

### 4. `test: add contract and hook conformance tests`
- Add tests for registration defaults + validation.
- Add tests for custom mode end hook and summary hook override behavior.

### 5. `docs: add mode authoring checklist and test template`
- Add mode extension API reference with checklist + PR test template.

## Notes
- Keep current gameplay behavior unchanged for existing modes.
- Keep sandbox as non-competitive via mode metadata.
