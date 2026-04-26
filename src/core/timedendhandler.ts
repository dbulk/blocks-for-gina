import { TIMED_MODE_DURATION_SECONDS, TIMED_NO_MOVES_BONUS_POINTS_PER_SECOND } from '@/core/moderules';

const TIMED_NO_MOVES_FAST_FORWARD_DURATION_MS = 650;

interface TimedEndGameState {
  getPlayedDurationSeconds: () => number
  addScore: (points: number) => void
  setPlayedDurationSeconds: (seconds: number) => void
}

interface TimedHudUpdater {
  update: (modeId: string) => void
}

interface TimedEndAdvanceInput {
  modeId: string
  hasMoreMoves: boolean
  isGameOver: boolean
  gameState: TimedEndGameState
}

class TimedEndHandler {
  private fastForwardStartTime: number | null = null;
  private fastForwardStartElapsedSeconds: number = 0;
  private bonusAwarded: boolean = false;
  private readonly scoreBoard: TimedHudUpdater;
  private readonly now: () => number;

  constructor (scoreBoard: TimedHudUpdater, now: () => number = () => performance.now()) {
    this.scoreBoard = scoreBoard;
    this.now = now;
  }

  reset (): void {
    this.fastForwardStartTime = null;
    this.fastForwardStartElapsedSeconds = 0;
    this.bonusAwarded = false;
  }

  advance (input: TimedEndAdvanceInput): boolean {
    const { modeId, hasMoreMoves, isGameOver, gameState } = input;
    if (modeId !== 'timed' || hasMoreMoves || !isGameOver) {
      return false;
    }

    const elapsedSeconds = gameState.getPlayedDurationSeconds();
    if (elapsedSeconds >= TIMED_MODE_DURATION_SECONDS) {
      return false;
    }

    if (!this.bonusAwarded) {
      const remainingSeconds = TIMED_MODE_DURATION_SECONDS - elapsedSeconds;
      gameState.addScore(remainingSeconds * TIMED_NO_MOVES_BONUS_POINTS_PER_SECOND);
      this.bonusAwarded = true;
    }

    if (this.fastForwardStartTime === null) {
      this.fastForwardStartTime = this.now();
      this.fastForwardStartElapsedSeconds = elapsedSeconds;
    }

    const elapsedMs = this.now() - this.fastForwardStartTime;
    const progress = Math.min(1, elapsedMs / TIMED_NO_MOVES_FAST_FORWARD_DURATION_MS);
    const remainingAtStart = TIMED_MODE_DURATION_SECONDS - this.fastForwardStartElapsedSeconds;
    const advancedSeconds = Math.ceil(remainingAtStart * progress);
    const fastForwardElapsed = this.fastForwardStartElapsedSeconds + advancedSeconds;
    gameState.setPlayedDurationSeconds(Math.min(TIMED_MODE_DURATION_SECONDS, fastForwardElapsed));

    this.scoreBoard.update(modeId);
    return progress < 1;
  }
}

export default TimedEndHandler;