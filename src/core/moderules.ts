import type GameState from '@/core/gamestate';

const TIMED_MODE_DURATION_SECONDS = 180;
const MOVE_LIMITED_MODE_MAX_MOVES = 30;

const shouldEndGameForMode = (modeId: string, gameState: GameState, hasMoreMoves: boolean): boolean => {
  if (modeId === 'timed') {
    const t = gameState.getPlayedDuration();
    const elapsedSeconds = t.hours * 3600 + t.minutes * 60 + t.seconds;
    return elapsedSeconds >= TIMED_MODE_DURATION_SECONDS;
  }

  if (modeId === 'move-limited') {
    return gameState.getTotalMoves() >= MOVE_LIMITED_MODE_MAX_MOVES || !hasMoreMoves;
  }

  return !hasMoreMoves;
};

export {
  shouldEndGameForMode,
  TIMED_MODE_DURATION_SECONDS,
  MOVE_LIMITED_MODE_MAX_MOVES
};
