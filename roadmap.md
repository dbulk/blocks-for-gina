# Blocks4Gina Product + Engineering Roadmap

Last updated: 2026-03-29

## 1) Where We Are Now

### Completed foundation work

- TypeScript/Vite toolchain is in place with clean `build`, `typecheck`, and `lint` workflows.
- Unit tests are running with Vitest for key logic/presenter coverage.
- Animation stability issues were addressed and game-state invariants were added for development.
- HUD was refactored to typed metrics/presenter/view architecture.
- Session overlays were formalized (`preGame`, `inGame`, `gameOverSummary`).
- Redo stack is implemented.
- Settings UX was substantially improved (layout, apply/reset flow, board controls, appearance controls).
- Block style system is implemented with multiple named render styles.
- High scores are implemented and shown in game-over summary.

### What is still open

- New gameplay modes (timed/infinite/reverse gravity/etc.).
- Online/shared leaderboard architecture.
- Deeper performance optimization for very large boards.
- Stronger app-level architecture boundaries for long-term feature velocity.

---

## 2) Product Goals (Next 3-6 Months)

1. Keep the core game fast and responsive even at large board sizes.
2. Ship multiple game modes that feel meaningfully different.
3. Evolve high scores from local-only to optional shared online leaderboard.
4. Move toward event-driven architecture to reduce coupling and simplify future features.
5. Preserve reliability through tests, deterministic logic paths, and observable performance metrics.

---

## 3) Proposed Architecture Direction

## Event-driven app model (next major step)

Adopt a small event bus inside the app shell so systems communicate via typed events rather than direct ad-hoc calls.

### Example event categories

- Game lifecycle: `gameStarted`, `gameEnded`, `gameReset`
- State transitions: `selectionChanged`, `blocksPopped`, `boardSettled`
- Animation: `animationStarted`, `animationCompleted`
- UI/session: `uiStateChanged`, `settingsApplied`
- Scoreboard: `scoreUpdated`, `highScoreRecorded`

### Why this helps

- Reduces responsibilities in `GameRunner` (currently orchestration-heavy).
- Makes rendering updates easier to scope (only react to relevant events).
- Simplifies adding new modes with mode-specific handlers.
- Improves testability by asserting emitted events and their payloads.

### Guardrails

- Use typed payload contracts per event.
- Keep event names stable and versioned if needed.
- Avoid hidden side effects in event listeners; prefer pure derivation where possible.

---

## 4) Gameplay Mode Expansion Roadmap

## Mode set to target

1. **Classic** (existing baseline)
2. **Timed**
   - fixed duration (e.g., 2-3 minutes)
   - maximize score before timer ends
3. **Infinite**
   - board replenishes/extends instead of ending on no moves
   - score and survival milestones
4. **Reverse Gravity**
   - popped spaces refill from bottom-up (or rise instead of fall)
5. **Move-Limited**
   - fixed move budget
   - optimize score per move
6. **Daily Seed Challenge**
   - deterministic board seed for comparable runs

## Delivery sequence recommendation

- Step 1: Timed mode (lowest risk + easy to communicate)
- Step 2: Move-limited mode (shares most logic with Classic)
- Step 3: Infinite mode
- Step 4: Reverse Gravity (highest design + balance risk)
- Step 5: Daily Seed challenge (pairs with leaderboard evolution)

---

## 5) Leaderboard Roadmap (Local -> Online)

## Current

- High scores are persisted locally and shown in game-over summary.

## Phase A: stronger local metadata

- Add mode name, board size, style, and timestamp grouping/filtering.
- Keep per-mode top lists (Classic/Timed/etc.) instead of one global list.
- Add migration-safe storage schema versioning.

## Phase B: optional online leaderboard

- Add backend endpoint to receive run submissions.
- Store score + mode + seed + summarized move/event trace.
- Return top-N rankings by mode and daily/weekly/all-time scopes.

## Anti-cheat baseline (pragmatic)

- Treat client score as untrusted.
- Prefer server-side score recomputation from move/event trace.
- Use deterministic seeds and deterministic scoring logic on server.
- Sign game sessions with short-lived tokens.
- Add anomaly checks (impossible timings, impossible clusters, malformed traces).

## Reality check

No browser-only approach fully prevents cheating. Goal is to make abuse costly and obvious while keeping honest players friction-free.

---

## 6) Performance Roadmap

## Immediate (next cycle)

- Cache offscreen style canvases and rebuild only when appearance settings change.
- Reduce full-board redraws during hover/preview interactions.
- Add lightweight runtime perf counters (frame time, draw count, large-board warning thresholds).

## Near-term

- Introduce dirty-region/dirty-column rendering paths.
- Convert expensive queue operations in flood fill (`shift`) to index-based queue pattern.
- Reduce object/string allocations in hot loops.

## Medium-term

- Separate static board layer from dynamic animation/preview overlay layer.
- Optional worker/off-main-thread experiments for large-board analysis paths.

---

## 7) Quality + Reliability

## Testing expansion

- Add tests for:
  - available-move counting correctness,
  - high-score ranking/tie-break logic,
  - mode-specific win/lose conditions,
  - event emission sequences (after event-driven migration).

## Observability

- Add optional debug panel toggle showing:
  - FPS / frame ms,
  - board size,
  - available moves,
  - animation queue/active state.

## Robustness

- Validate and clamp all deserialized settings and score payloads.
- Add explicit save schema version and migration path for old entries.

---

## 8) Phased Delivery Plan

## Phase 1 (Now -> 1 sprint): polish + prep

- Performance caching pass (renderer/offscreen rebuild policy).
- High score metadata and per-mode structure.
- Add mode selector UI shell (without changing gameplay yet).

**Exit criteria**: stable perf at larger boards and leaderboard schema ready for multi-mode.

## Phase 2 (1-2 sprints): first mode wave

- Implement Timed + Move-Limited.
- Add mode-aware game-over summaries and scoreboards.
- Expand tests for mode-specific logic.

**Exit criteria**: at least 2 additional production-ready modes.

## Phase 3 (1-2 sprints): architecture evolution

- Introduce typed event bus and migrate core flow.
- Split runner orchestration into smaller services.
- Add event-sequence tests.

**Exit criteria**: reduced coupling and cleaner extension points for new features.

## Phase 4 (ongoing): online-ready progression

- Build server-backed leaderboard prototype.
- Add deterministic submission verification.
- Launch daily seed challenge if backend readiness is sufficient.

**Exit criteria**: trusted shared leaderboard beta for at least one mode.

---

## 9) Backlog Ideas (Optional / Stretch)

- Theme packs / seasonal palettes.
- Power-ups or limited-use board tools.
- Accessibility options (colorblind-safe palettes, keyboard-only play).
- Touch-first interaction mode refinements.
- Replay viewer for interesting runs.
- “Coach” hints (show best cluster options).

---

## 10) Success Metrics

- **Performance**: smooth play at larger board presets without major frame drops.
- **Feature velocity**: new mode shipped without regressions every 1-2 sprints.
- **Quality**: green test/lint/typecheck/build gates before release.
- **Engagement**: repeat play uplift after mode and leaderboard updates.
- **Integrity**: leaderboard abuse remains low and detectable with server validation in place.
