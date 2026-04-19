# Plan #sandbox-setup-flow

Goal: Introduce a dedicated Sandbox setup flow before run start.

## Commits
1. `feat: add sandbox setup view`
- Create setup panel for rows, columns, clustering.
- Add clear entry and confirm controls.

2. `feat: validate sandbox setup inputs`
- Apply min/max clamps and user feedback.
- Prevent invalid run payload creation.

3. `refactor: coordinator consumes sandbox setup payload`
- Use setup payload only for Sandbox starts.
- Keep Arcade path separate and fixed.

4. `test: add sandbox setup validation tests`
- Verify clamping and defaults.
- Verify payload generation.

5. `test: add sandbox start integration test`
- Mode select -> sandbox setup -> run start.
