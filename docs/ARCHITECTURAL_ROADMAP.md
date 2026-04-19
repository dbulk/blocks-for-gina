# Architectural Action Plan

Last updated: 2026-04-19

This file is forward-only. It tracks what to build next, not historical progress.

## Scope
- Deliver Arcade/Sandbox experience flow from [roadmap.md](roadmap.md).
- Keep mode architecture extensible for upcoming modes.
- Preserve quality gates while reducing coordinator coupling.

## Immediate Priorities

### 1) Game Type Selection Flow
- Add canonical mode-select entry state before gameplay.
- Route game-over back to mode selection.
- Make "play again" explicit: replay same mode or return to selection.

Primary files:
- [src/presentation/overlaymanager.ts](src/presentation/overlaymanager.ts)
- [src/presentation/startoverlayview.ts](src/presentation/startoverlayview.ts)
- [src/presentation/gameoveroverlayview.ts](src/presentation/gameoveroverlayview.ts)
- [src/core/gamecoordinator.ts](src/core/gamecoordinator.ts)

### 2) Settings Split (Preferences vs Run Setup)
- Keep persistent settings limited to audio/visual preferences.
- Treat board generation values as per-run setup payload.
- Ensure Sandbox setup does not become global persistent defaults.

Primary files:
- [src/core/gamesettings.ts](src/core/gamesettings.ts)
- [src/presentation/settingspresenter.ts](src/presentation/settingspresenter.ts)
- [src/presentation/uinodes.ts](src/presentation/uinodes.ts)
- [src/persistence/sessionstorage.ts](src/persistence/sessionstorage.ts)

### 3) Score Policy by Mode
- Track high scores by competitive mode.
- Exclude Sandbox from competitive ranking.
- Optionally add local-only Sandbox personal best.

Primary files:
- [src/persistence/highscores.ts](src/persistence/highscores.ts)
- [src/core/gamecoordinator.ts](src/core/gamecoordinator.ts)
- [src/presentation/gameoveroverlayview.ts](src/presentation/gameoveroverlayview.ts)

### 4) Event-Sequence Coverage
- Add coordinator integration tests for:
  - mode select -> run start
  - run end -> return to mode select
  - scoring event flow by mode

Primary files:
- [tests/events/eventbus.test.ts](tests/events/eventbus.test.ts)
- new tests under [tests/core](tests/core) and [tests/presentation](tests/presentation)

### 5) Reduce Coordinator Surface Area
- Move remaining UI listener wiring out of coordinator over time.
- Keep coordinator focused on lifecycle and orchestration only.

Primary files:
- [src/core/gamecoordinator.ts](src/core/gamecoordinator.ts)
- [src/bootstrap/blocks-4-gina.ts](src/bootstrap/blocks-4-gina.ts)

## Next Feature Wave (after above)
- Timed mode end-to-end.
- Move-Limited mode end-to-end.
- Mode-aware HUD and game-over summaries.

Primary files:
- [src/core/moderules.ts](src/core/moderules.ts)
- [src/core/moderegistry.ts](src/core/moderegistry.ts)
- [src/presentation/hudpresenter.ts](src/presentation/hudpresenter.ts)
- [src/presentation/gameoveroverlayview.ts](src/presentation/gameoveroverlayview.ts)

## Guardrails
- Keep layer boundaries enforced by lint + tests.
- No new direct core -> presentation imports (except current temporary coordinator seam).
- New modes must be registered through mode registry, not hardcoded conditionals spread across UI.

## Definition of Done (per milestone)
1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. `npm run build`
5. Manual smoke: mode select -> play -> game over -> mode select

## Out of Scope Here
- Online leaderboard backend.
- Anti-cheat services.
- Major rendering rewrites beyond targeted optimization.
