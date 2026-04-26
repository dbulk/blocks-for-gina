# Mode Extension API

Use this guide when adding a new mode with minimal cross-cutting edits.

## Core Contracts

- Mode metadata contract: register in `src/core/moderegistry.ts`.
- End condition rule hook: register in `src/core/moderules.ts` via `registerModeEndRuleHook`.
- Summary hook: register in `src/core/modesummaryhooks.ts` via `registerModeSummaryHooks`.

## Registration Checklist

1. Add mode metadata in `createDefaultModeRegistry()`:
- `id`, `name`, `description`
- `implemented`
- `competitive`

2. Add mode end condition hook:
- `registerModeEndRuleHook('<mode-id>', (gameState, hasMoreMoves) => boolean)`

3. Add summary hooks (optional but recommended):
- `title`
- `hideBlocksRemaining`
- `formatMoves(totalMoves)`

4. Confirm mode appears in mode select and starts correctly.

## Test Template For Mode PRs

Add/extend tests to cover:

- Registry contract:
- mode present in default registry
- competitive/implemented flags correct

- Rule hook:
- mode end condition boundary checks

- Summary hook:
- title and metric formatting for game-over summary

- Integration flow:
- mode select -> run start
- run end -> summary displayed

## PR Checklist Snippet

- [ ] Added metadata in mode registry
- [ ] Added mode end-rule hook
- [ ] Added summary hooks (or documented defaults)
- [ ] Added/updated unit tests
- [ ] Added/updated integration flow test
- [ ] `npm test` and `npm run build` pass
