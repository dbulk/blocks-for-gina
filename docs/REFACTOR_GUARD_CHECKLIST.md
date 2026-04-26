# Refactor Guard Checklist

Use this checklist for any architecture or hygiene PR that changes orchestration, persistence, or presentation seams.

## Public Behavior Guards

- GameRunner public API remains unchanged, or the PR explicitly documents and tests the change.
- Event ordering remains stable for startup and end-of-run flows.
- Persistence compatibility remains intact at session and high-score boundaries.
- Sandbox and competitive result handling remain mode-correct.

## Validation Gates

- `npm run typecheck`
- `npm test`
- `npm run build`
- Targeted tests added or updated for the touched seam.

## Refactor Review Prompts

- Which class now owns the behavior that previously lived in a larger coordinator or presenter?
- Which existing test would fail first if event sequencing or summary payloads changed?
- Did any new cross-layer import get introduced?
- Is compatibility mapping centralized instead of duplicated?

## Current High-Risk Seams

- `GameCoordinator` orchestration and end-of-run flow
- `GameState` mode runtime helpers
- session snapshot translation and compatibility mapping
- `UINodes` construction hotspots