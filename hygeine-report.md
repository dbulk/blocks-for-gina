# Code Hygeine Report

Date: 2026-04-26
Scope: source layout, architecture constraints, complexity hotspots, naming/consistency, and reliability guardrails.

## Executive Summary

The project is in solid shape for a solo-maintained TypeScript game app: clear layer boundaries, broad test coverage, and active quality gates. The biggest hygiene risk is concentration of orchestration logic in the coordinator/state/presentation mega-files, which raises change cost and regression risk as more modes are added.

## Measured Snapshot

- Source TypeScript files: 33
- Test files: 18
- Test cases: 104
- Source LoC total: 5136
- Largest files:
  - src/styling/gamestyle.ts: 773
  - src/core/gamestate.ts: 762
  - src/core/gamecoordinator.ts: 604
  - src/presentation/uinodes.ts: 456

## Findings

### High Priority

1. High orchestration concentration in coordinator
- Evidence: src/core/gamecoordinator.ts is 600+ LoC with lifecycle, input, scoring, mode logic, persistence wiring, and animation timing in one class.
- Risk: mode feature additions increase branching complexity and hidden coupling.
- Action: split into focused collaborators (RunLifecycle, ModeRuntimeController, EndOfRunFinalizer, SessionResumeCoordinator).

2. Domain state complexity concentration in GameState
- Evidence: src/core/gamestate.ts combines grid mutations, scoring, undo/redo, mode runtime stats, serialization, and invariant checks.
- Risk: difficult to reason about correctness and invariants when changing one concern.
- Action: extract mode-runtime stats helpers and serialization adapters into dedicated units while keeping state owner central.

### Medium Priority

3. UI composition density in UINodes
- Evidence: src/presentation/uinodes.ts mixes construction, layout detail, and behavior wiring.
- Risk: visual tweaks and behavioral changes collide and generate brittle edits.
- Action: split into smaller section builders and keep listener wiring near owning presenter.

4. Inconsistent naming legacy still present
- Evidence: several files still use arcade naming in technical constants/files (e.g., arcade config), while user-facing mode id is now classic.
- Risk: onboarding friction and accidental mismatch bugs.
- Action: perform a dedicated naming cleanup pass that preserves backward compatibility mappings.

### Low Priority

5. Typo drift in documentation/backlog labels
- Evidence: hygeine spelling appears in backlog item naming.
- Risk: search/discoverability friction.
- Action: align on one spelling in future backlog/doc updates (non-blocking).

## What Is Working Well

- Layer intent is documented and mostly enforced.
- Backlog workflow is disciplined (plan-first, plan removed before PR).
- Regression coverage catches many game-mode and UI flow changes.
- Session compatibility mapping is actively maintained for legacy mode ids.

## Remediation Order

1. Coordinator decomposition seams
2. GameState concern extraction
3. UINodes split
4. Naming harmonization pass
5. Minor doc hygiene cleanups
