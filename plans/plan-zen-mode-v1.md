# Plan #zen-mode-v1

Goal: Ship first playable infinite mode (renamed from zen).

## Implementation Steps

### 1. `feat: rename zen mode to infinite`
- Rename mode id and display metadata from `zen` -> `infinite` in mode registry.
- Keep mode non-competitive and implemented.
- Add saved-session mode-id migration (`zen` resumes as `infinite`).

### 2. `feat: infinite mode rules and HUD behavior`
- Add `infinite` mode end-rule hook that never ends by moves/time.
- Hide timer and move-budget HUD metrics for infinite mode.

### 3. `feat: refill board after pops in infinite mode`
- Add GameState helper to refill null cells with random blocks spawned from top with fall offsets.
- Trigger refill in coordinator after block updates for infinite runs.

### 4. `test: add infinite mode coverage`
- Registry test for `infinite` metadata and non-competitive behavior.
- Mode rule test for never-ending condition.
- HUD test for hidden timer/moves in infinite mode.
- Session storage test for `zen` -> `infinite` migration.
- GameState/Coordinator test for refill behavior after pops.
