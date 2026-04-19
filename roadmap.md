# Blocks4Gina Product + Engineering Roadmap

Last updated: 2026-04-19

## 1) Product Direction Reset

We are moving from one blended settings/gameplay experience to a two-track model:

1. **Arcade**: curated/default board configuration intended for score competition.
2. **Sandbox**: player-defined board generation settings for experimentation/fun.

This shift clarifies what counts for progression/leaderboards and gives us a clean entry point for additional game modes.

---

## 2) Core Experience Model

## Game Type Selection First

The player starts by choosing a game type/mode before entering gameplay.

- Arcade
- Sandbox
- Future modes (Timed, Move-Limited, Infinite, Reverse Gravity, Daily Seed, etc.)

## End-of-Game Behavior

At game end, we return to **game type selection** rather than immediately restarting with the same setup.

Why:

- Encourages mode switching and replay variety.
- Makes mode identity explicit at each run start.
- Prevents accidental carry-over of setup from prior run.

---

## 3) Settings Model (New Separation)

## Persistent Preferences (global, survive sessions)

These are user preferences, not run rules:

- Color palette / appearance choices.
- Audio toggles (music/sfx).
- Optional visual style preferences.

## Run Configuration (ephemeral, per run)

These affect gameplay rules and board generation, and belong to setup flow, not global settings:

- Rows / columns.
- Cluster strength.
- Board generation parameters.
- Mode-specific knobs.

### Arcade

- Uses default/curated run config (fixed baseline).
- Player does not tweak board generation before run.

### Sandbox

- Uses custom run config from setup UI.
- Intended for experimentation and custom challenges.

---

## 4) Score Policy

## Competitive Tracking

High scores are tracked by **game mode** where competition is meaningful and comparable:

- Arcade (yes)
- Timed (yes)
- Move-Limited (yes)
- Daily Seed (yes)
- Other competitive modes as added

## Sandbox Policy

Sandbox is treated as non-competitive by default:

- No global high score ranking.
- Optionally show personal best in-session/local profile, but do not mix with competitive boards.

Rationale:

- Custom board parameters break fairness/comparability.
- Keeps leaderboards meaningful and avoids noise.

---

## 5) Target Mode Catalog

## Immediate

1. Arcade (default curated classic baseline)
2. Sandbox (custom board setup)

## Near-term

3. Timed
4. Move-Limited

## Mid-term

5. Infinite
6. Reverse Gravity
7. Daily Seed Challenge

## Open mode pipeline

New mode ideas are expected and encouraged. The mode-selection screen and mode registry should be treated as extensibility infrastructure, not a closed list.

---

## 6) Architecture Implications

## Mode Identity Must Be First-Class

Mode ID needs to flow through:

- Run start payload
- HUD behavior
- End-of-game summary
- Score persistence decisions

## Setup Flow Split

UI should distinguish:

- **Preferences panel** (persistent)
- **Run setup panel** (ephemeral, mode-specific)

## Coordinator / State Changes

- End-of-game transition should route to mode-selection state.
- New-run initialization should consume selected mode + setup payload.
- Restart behavior should be explicit (Replay same run vs Back to mode select).

---

## 7) Leaderboard Evolution

## Phase A (local)

- Store per-mode top lists.
- Exclude Sandbox from competitive list by default.
- Keep schema versioning and migration safety.

## Phase B (optional online)

- Server-backed per-mode leaderboard.
- Deterministic fields for comparable competitive modes.
- Daily Seed naturally maps to global comparability windows.

---

## 8) Implementation Roadmap

## Phase 1: UX and flow reset (next)

1. Add/upgrade game type selection as canonical entry screen.
2. Change game-over flow to return to type selection.
3. Split settings UI into:
   - persistent preferences
   - run setup (Sandbox-focused)

**Exit criteria**: player can clearly choose Arcade vs Sandbox; game-over routes back to selection.

## Phase 2: score and policy alignment

1. Per-mode score storage and summaries.
2. Exclude Sandbox from competitive ranking.
3. Add personal Sandbox stats (optional, local-only).

**Exit criteria**: leaderboard reflects mode-aware competitive policy.

## Phase 3: first feature wave

1. Ship Timed and Move-Limited using the same mode entry path.
2. Add mode-aware HUD/game-over variants.
3. Expand tests for mode-specific end conditions and scoring.

**Exit criteria**: two additional production-ready modes integrated into selection flow.

## Phase 4: expansion

1. Infinite + Reverse Gravity.
2. Daily Seed challenge.
3. Optional online leaderboard prototype for competitive modes.

---

## 9) Testing and Quality Gates

For every phase:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

Add targeted tests for:

- Mode-selection -> run-start -> game-over -> return-to-selection flow.
- Persistence split (preferences persist, run setup does not persist as global settings).
- Leaderboard inclusion/exclusion policy by mode.

---

## 10) Success Metrics

- **Clarity**: users understand Arcade vs Sandbox before starting a run.
- **Integrity**: competitive boards remain comparable because Sandbox is separated.
- **Velocity**: new modes plug into one shared selection/setup pipeline.
- **Quality**: green typecheck/lint/test/build gate before release.
- **Engagement**: replay rate improves due to mode selection loop at game end.
