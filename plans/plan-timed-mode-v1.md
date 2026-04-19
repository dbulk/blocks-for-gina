# Plan #timed-mode-v1

Goal: Ship first playable timed mode.

## Commits
1. `feat: add timed mode config and constants`
- Add time-limit parameters in core mode rules.

2. `refactor: enforce timed end condition in coordinator`
- End run when timer expires.

3. `feat: expose timed state in hud presenter`
- Add countdown metric for timed mode.

4. `feat: add timed summary details`
- Show elapsed time and final score context.

5. `test: add timed mode behavior tests`
- Validate countdown and end condition.

6. `test: add timed integration flow`
- Mode select -> timed run -> timed end summary.
