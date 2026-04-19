# Architectural Roadmap

Last updated: 2026-04-19

## Current State
- Layered structure exists in src: bootstrap, core, presentation, rendering, persistence, audio, events, styling.
- Alias imports are configured and stable.
- Initial decoupling is complete:
  - Audio lifecycle in src/audio/audiocontroller.ts.
  - Settings/UI bridge in src/presentation/settingspresenter.ts.
  - Overlay orchestration in src/presentation/overlaymanager.ts.
  - Event contracts in src/events/events.ts.
- Extended implementation completed in this execution run:
  - Runtime typed event bus in src/events/eventbus.ts.
  - Coordinator split with src/core/gamecoordinator.ts and facade src/core/gamerunner.ts.
  - Loop extraction via src/core/gameloopmanager.ts.
  - Versioned session persistence via src/persistence/sessionstorage.ts.
  - Mode registry/mode rules groundwork via src/core/moderegistry.ts and src/core/moderules.ts.
  - Architecture boundary test guardrails in tests/architecture/boundaries.test.ts.

## Architecture Target
- bootstrap remains the only cross-layer composition root.
- core remains UI-agnostic and rendering-agnostic except explicit coordinator seams.
- event-driven orchestration replaces direct cross-module side effects.
- persistence is centralized behind versioned contracts.
- boundaries are enforced by tests/lint, not convention only.

## Dependency Rules
- core imports core/events/types.
- presentation imports core/events/types.
- rendering imports core state/settings for read-only render inputs.
- persistence imports core/types and storage contracts.
- audio imports event/core types and controls audio side effects.
- bootstrap imports all layers and wires them.

## Phased Plan

### Now
1. Event bus integration and lifecycle emissions.
2. Coordinator/loop split.
3. Persistence service centralization.
4. Boundary guardrails in tests/lint.
5. Mode groundwork (registry + settings mode field + base mode rules).

### Next
1. Use mode registry as runtime source for selectable modes in UI.
2. Add mode-aware HUD details (timer for timed mode, move counter emphasis for move-limited mode).
3. Add event-sequence tests for coordinator lifecycle.
4. Reduce remaining coordinator coupling by moving UI listeners and animation orchestration into dedicated modules.

### Later
1. Full event-driven subscribers for HUD/persistence/audio with minimal imperative wiring.
2. Schema migrations for saved session/high-score versions.
3. Performance work: dirty-region rendering and instrumentation panel.
4. Online leaderboard abstraction and validation pipeline.

## Priority Before Feature Growth
1. Event bus and coordinator split (done).
2. Persistence centralization (done).
3. Boundary guardrails (done).
4. Mode contract and rule baseline (done).
5. Event-sequence and integration coverage expansion (next).

## Verification Gates
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- Manual smoke flow: start game, pop blocks, undo/redo, mode change via settings, game over, restart, persisted restore.

## Scope Boundaries
Included:
- architecture and structural evolution, mode foundations, event/persistence seams, test guardrails.

Excluded (for later phases):
- full online leaderboard backend, anti-cheat service, large rendering rewrites, major visual redesign.

## Suggested PR Slices
1. add event bus
2. extract loop and storage
3. split coordinator
4. add boundary guards
5. add mode foundation
6. add mode plumbing
7. add mode rules
8. add event-sequence integration tests
9. wire mode registry into UI options
