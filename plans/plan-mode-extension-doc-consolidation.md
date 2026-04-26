# Plan: #mode-extension-doc-consolidation

## Goal
Make one canonical game-mode extension guide and reduce duplicated instructions across docs by adding explicit cross-links.

## Implementation Steps

1. Canonicalize `docs/MODE_EXTENSION_API.md`:
- Add a concise scope statement and keep complete mode-extension instructions there.
- Ensure it covers registration, rule hooks, summary hooks, tests, and PR checklist.

2. Update `docs/EXTENDING_GAME.md`:
- Replace duplicated mode-extension steps with a short summary that links directly to `docs/MODE_EXTENSION_API.md`.
- Keep non-mode extension sections as-is.

3. Add cross-links from other docs entry points:
- `readme.md` docs list should include `docs/MODE_EXTENSION_API.md` so contributors can find the canonical guide quickly.
- Add one pointer in architecture docs where extension work is discussed, without duplicating the detailed checklist.

4. Verification:
- Confirm links are correct and file paths resolve.
- Run `npm run build` to ensure no incidental breakage.

## Notes
- Avoid creating new documentation files unless needed; consolidate using existing docs.
- Keep content concise and actionable; avoid divergence by linking to the canonical file instead of copy/pasting checklists.
