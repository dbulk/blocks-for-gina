import type GameState from '@/core/gamestate';

const TIMED_MODE_DURATION_SECONDS = 60;
const SPRINT_MODE_MAX_MOVES = 10;
const PRECISION_MAX_STRIKES = 3;

type ModeEndRuleHook = (gameState: GameState, hasMoreMoves: boolean) => boolean;

const modeEndRuleHooks = new Map<string, ModeEndRuleHook>([
  ['timed', (gameState: GameState) => {
    const t = gameState.getPlayedDuration();
    const elapsedSeconds = t.hours * 3600 + t.minutes * 60 + t.seconds;
    return elapsedSeconds >= TIMED_MODE_DURATION_SECONDS;
  }],
  ['sprint', (gameState: GameState, hasMoreMoves: boolean) => gameState.getTotalMoves() >= SPRINT_MODE_MAX_MOVES || !hasMoreMoves],
  ['precision', (gameState: GameState, hasMoreMoves: boolean) => gameState.getPrecisionStrikes() >= PRECISION_MAX_STRIKES || !hasMoreMoves],
  ['infinite', () => false]
]);

const builtInModeEndRuleHooks = new Map(modeEndRuleHooks);

const normalizeModeId = (modeId: string): string => modeId.trim();

const resetModeEndRuleHooks = (): void => {
  modeEndRuleHooks.clear();
  builtInModeEndRuleHooks.forEach((hook, id) => modeEndRuleHooks.set(id, hook));
};

const registerModeEndRuleHook = (modeId: string, hook: ModeEndRuleHook): void => {
  const normalizedId = normalizeModeId(modeId);
  if (normalizedId === '') {
    throw new Error('Mode id is required for mode rule hooks');
  }
  modeEndRuleHooks.set(normalizedId, hook);
};

const shouldEndGameForMode = (modeId: string, gameState: GameState, hasMoreMoves: boolean): boolean => {
  const hook = modeEndRuleHooks.get(modeId);
  if (hook !== undefined) {
    return hook(gameState, hasMoreMoves);
  }

  return !hasMoreMoves;
};

export {
  shouldEndGameForMode,
  registerModeEndRuleHook,
  resetModeEndRuleHooks,
  TIMED_MODE_DURATION_SECONDS,
  SPRINT_MODE_MAX_MOVES,
  PRECISION_MAX_STRIKES
};
