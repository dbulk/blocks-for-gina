# Plan: #mode-registration-error-ergonomics

## Goal
Improve mode registration validation diagnostics so errors consistently include field + received value context and are more actionable for mode authors.

## Implementation Steps

1. Update `src/core/moderegistry.ts` validation path:
- Centralize validation error formatting in a small helper.
- Include `field`, `reason`, and `received` value in all validation errors.
- Include normalized mode id context where relevant.

2. Expand runtime validation coverage:
- Validate `id`, `name`, and `description` as non-empty strings.
- Validate optional `implemented` and `competitive` as booleans when provided.

3. Keep duplicate-id error actionable:
- Preserve duplicate-id check and include the offending id value in the same structured style.

4. Update tests in `tests/core/moderegistry.test.ts`:
- Assert the new error message shape for blank fields.
- Add tests for invalid boolean flag values.

5. Verify with test/build commands.

## Notes
- Keep public API unchanged (`ModeRegistry.register` signature remains the same).
- Scope is diagnostics quality, not behavior changes for valid mode registrations.
