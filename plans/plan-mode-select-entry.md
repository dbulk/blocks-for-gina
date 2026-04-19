# Plan #mode-select-entry

Goal: Make game type selection the canonical first screen.

## Commits
1. `feat: add mode select view shell`
- Create mode selection UI component and container.
- Add Arcade and Sandbox cards with primary actions.

2. `feat: wire mode select into session states`
- Add mode-select state to session UI state model.
- Update overlay manager visibility rules.

3. `refactor: route start button through selected mode`
- Replace direct start with mode-aware start action.
- Emit mode selected event when start is confirmed.

4. `test: add mode select rendering tests`
- Verify view appears in pregame state.
- Verify selecting a mode updates internal state.

5. `docs: update mode entry flow`
- Document entry path in architecture and roadmap docs.
