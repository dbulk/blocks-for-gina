# Plan: #mode-hook-test-isolation

## Problem
`modeEndRuleHooks` in `moderules.ts` and `modeSummaryHooks` in `modesummaryhooks.ts` are module-level Maps that persist across test files. A test registering a custom hook (e.g. `'custom'`) will silently bleed into subsequent tests, making test ordering matter and masking bugs.

## Implementation Steps

1. **`moderules.ts`**: Export a `resetModeEndRuleHooks()` function that clears all dynamically-registered hooks (i.e. restores to initial built-in registrations only).

2. **`modesummaryhooks.ts`**: Export a `resetModeSummaryHooks()` function that clears all dynamically-registered hooks (i.e. restores to initial built-in registrations only).

3. **`moderules.test.ts`**: Import and call `resetModeEndRuleHooks()` in a `beforeEach` (or `afterEach`) to ensure each test starts clean.

4. **`modesummaryhooks.test.ts`** (if it exists): Same treatment. If no test file exists, create a minimal one covering `registerModeSummaryHooks` and `getModeSummaryHooks`, using `beforeEach` reset.

5. Verify: 
   - All existing tests pass.
   - The `'custom'` mode registered in one test does not affect other tests.

## Notes
- Reset functions should restore the Map to the state it would be in at module initialization (built-in entries only), not empty — so built-in hooks like `timed`, `sprint`, `precision`, `infinite` remain available after reset.
- Expose reset functions only for test use — consider a comment noting this, but do not use special build tricks (they don't have test-only exports in this codebase).
