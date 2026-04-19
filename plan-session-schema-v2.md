# Plan #session-schema-v2

Goal: Introduce schema v2 with split persistence behavior.

## Commits
1. `refactor: define session schema v2 contracts`
- Separate preferences block from run snapshot block.

2. `feat: write preferences independently from run data`
- Persist global prefs without binding run setup.

3. `feat: add migrate-on-load from v1 to v2`
- Migrate existing data safely and idempotently.

4. `test: add schema migration tests`
- Validate v1 load, migrate, and write-back.

5. `test: add split persistence behavior tests`
- Verify run setup remains ephemeral by default.

6. `docs: update persistence semantics`
- Reflect v2 behavior in architecture docs.
