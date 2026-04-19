# Plan #settings-split

Goal: Separate persistent preferences from per-run setup.

## Commits
1. `refactor: split settings domain models`
- Introduce Preferences model and RunSetup model.
- Keep backward-compatible migration mapping.

2. `refactor: update settings presenter bindings`
- Bind audio/style controls to Preferences only.
- Bind board generation controls to RunSetup only.

3. `feat: add dedicated preferences panel section`
- Group audio and cosmetics into persistent panel.
- Remove gameplay-affecting controls from global section.

4. `feat: add run setup payload builder`
- Build mode-aware run setup payload at run start.
- Do not persist setup globally by default.

5. `test: add split settings persistence tests`
- Verify preferences persist across sessions.
- Verify run setup resets correctly between runs.

6. `docs: update settings semantics`
- Document split in roadmap and architecture action plan.
