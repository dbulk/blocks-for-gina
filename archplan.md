# Architecture Strengthening Plan

Date: 2026-04-26
Horizon: 3 implementation waves

## Objectives

- Lower coordination complexity for new mode development.
- Keep domain logic testable without UI/persistence dependencies.
- Reduce regression probability when tuning run-end behavior.

## Wave 1: Safe Decomposition

1. Extract End-of-Run Service
- Move game-over summary prep, score persistence, and event emission out of coordinator into a dedicated service.
- Inputs: mode id, run context, GameState snapshot.
- Outputs: UI summary payload + persistence writes + gameEnded event payload.

2. Extract Timed End Handler
- Isolate timed no-moves fast-forward and bonus behavior into one component.
- Keep coordinator as caller only.

3. Keep public APIs stable
- Preserve GameRunner constructor surface to avoid broad integration churn.

Success criteria:
- Coordinator reduced by ~20-30% lines.
- No behavior changes in existing tests.

## Wave 2: Domain Isolation

1. Split mode runtime stats from GameState core grid operations
- Move cascade/precision/timed runtime helpers behind dedicated mode state object(s) owned by GameState.

2. Formalize serialization boundary
- Introduce explicit snapshot translators to avoid accidental schema coupling.

Success criteria:
- GameState mutation paths become easier to reason about.
- Snapshot compatibility logic is isolated and test-focused.

## Wave 3: Presentation Composition Hygiene

1. Split UINodes into section modules
- Board settings section builder
- Generation section builder
- Appearance section builder
- Action row builder

2. Keep HTMLInterface focused on composition
- Avoid accumulating behavior decisions in view shell.

Success criteria:
- UI modifications touch fewer lines/files.
- Existing presentation tests remain stable with less fixture churn.

## Guardrails

- Maintain strict non-bootstrap layer boundaries.
- Continue requiring plan-first branch workflow for backlog items.
- Add a boundary test whenever a new cross-layer seam is introduced.

## Risks and Mitigations

- Risk: Refactor churn slows feature delivery.
- Mitigation: wave-by-wave with no API breaks and test-first checkpoints.

- Risk: Hidden lifecycle coupling during coordinator extraction.
- Mitigation: preserve behavior via event-sequence tests before/after each extraction.
