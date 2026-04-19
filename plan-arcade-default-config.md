# Plan #arcade-default-config

Goal: Lock Arcade mode to a curated competitive baseline.

## Commits
1. `feat: define arcade default run config`
- Add arcade config constants in core.
- Keep values centralized and typed.

2. `refactor: apply fixed config in arcade start path`
- Ignore sandbox setup values when mode is Arcade.
- Ensure deterministic run initialization.

3. `feat: display arcade config summary in mode card`
- Show board size and generation profile read-only.

4. `test: add arcade config enforcement tests`
- Assert coordinator uses fixed config for Arcade.

5. `docs: document arcade fairness baseline`
- Explain why Arcade config is fixed for rankings.
