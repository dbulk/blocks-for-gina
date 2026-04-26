import type GameState from '@/core/gamestate';

const TIMED_MODE_DURATION_SECONDS = 60;
const SPRINT_MODE_MAX_MOVES = 10;

type ModeEndRuleHook = (gameState: GameState, hasMoreMoves: boolean) => boolean;

const modeEndRuleHooks = new Map<string, ModeEndRuleHook>([
  ['timed', (gameState: GameState) => {
    const t = gameState.getPlayedDuration();
    const elapsedSeconds = t.hours * 3600 + t.minutes * 60 + t.seconds;
    return elapsedSeconds >= TIMED_MODE_DURATION_SECONDS;
  }],
  ['sprint', (gameState: GameState, hasMoreMoves: boolean) => gameState.getTotalMoves() >= SPRINT_MODE_MAX_MOVES || !hasMoreMoves]
]);

const normalizeModeId = (modeId: string): string => modeId.trim();

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
  TIMED_MODE_DURATION_SECONDS,
  SPRINT_MODE_MAX_MOVES
};
