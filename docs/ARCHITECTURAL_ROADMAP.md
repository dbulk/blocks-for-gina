# Architectural Roadmap

Last updated: 2026-04-26

## Scope
- Deliver Arcade/Sandbox experience flow from [roadmap.md](roadmap.md).
- Keep mode architecture extensible for upcoming modes.
- Preserve quality gates while reducing coordinator coupling.

## Recently Completed

- Extracted `EndOfRunFinalizer` from coordinator-owned game-over flow.
- Extracted `TimedEndHandler` for timed no-moves fast-forward and bonus handling.
- Moved cascade/precision runtime counters behind `gamemoderuntime` while keeping `GameState` as state owner.
- Formalized the session snapshot boundary in `src/persistence/sessionsnapshot.ts`.
- Split `UINodes` settings construction into section builders.
- Added resume smoke coverage with the real session snapshot shape and shared run-context test fixtures.

## Immediate Priorities

### 1) Continue Testbed Rebalancing
- Expand shared test fixtures for common run setups and mode contexts.
- Preserve event-sequence integration coverage while coordinator seams continue to move.
- Keep resume-visibility coverage using real session snapshot payloads.

Primary files:
- [tests/core/gamecoordinator.event-sequence.test.ts](tests/core/gamecoordinator.event-sequence.test.ts)
- [tests/bootstrap/blocks-4-gina.mode-flow.integration.test.ts](tests/bootstrap/blocks-4-gina.mode-flow.integration.test.ts)
- [tests/fixtures/runcontext.ts](tests/fixtures/runcontext.ts)

### 2) Reduce Remaining Coordinator Surface Area
- Move additional UI listener wiring out of `GameCoordinator` over time.
- Keep coordinator focused on orchestration, not detailed input policy.

Primary files:
- [src/core/gamecoordinator.ts](src/core/gamecoordinator.ts)
- [src/bootstrap/blocks-4-gina.ts](src/bootstrap/blocks-4-gina.ts)

### 3) Keep Documentation Aligned
- Update architecture docs whenever a seam is extracted.
- Prefer describing current ownership over aspirational structure.

Primary files:
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/MODULES.md](docs/MODULES.md)
- [docs/ARCHITECTURAL_ROADMAP.md](docs/ARCHITECTURAL_ROADMAP.md)
- [docs/REFACTOR_GUARD_CHECKLIST.md](docs/REFACTOR_GUARD_CHECKLIST.md)

## Next Feature Wave

- Build more mode-specific behavior on top of the extracted coordinator and persistence seams.
- Continue tightening layer boundaries with tests and lint rules.

## Guardrails
- Keep layer boundaries enforced by lint + tests.
- No new direct core -> presentation imports beyond the existing coordinator seam.
- New modes must be registered through mode registry, not hardcoded conditionals spread across UI.

## Definition of Done (per milestone)
1. `npm run typecheck`
2. `npm run test`
3. `npm run build`
5. Manual smoke: mode select -> play -> game over -> mode select

## Out of Scope Here
- Online leaderboard backend.
- Anti-cheat services.
- Major rendering rewrites beyond targeted optimization.
