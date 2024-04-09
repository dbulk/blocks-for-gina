import type GameState from './gamestate';
import type ScoreDisplay from './scoredisplay';

class ScoreBoard {
  gameState: GameState;
  scoreDisplay: ScoreDisplay;

  constructor (gameState: GameState, scoreDisplay: ScoreDisplay) {
    this.gameState = gameState;
    this.scoreDisplay = scoreDisplay;
  }

  update (): void {
    // todo: move the nonsense about selected into scoreDisplay 
    const blocksSelected = this.gameState.getNumBlocksToPop();
    const blockStr = blocksSelected !== 0
      ? `Blocks: ${this.gameState.getNumBlocksRemaining()} <span class='selected'>(${blocksSelected})</span>`
      : `Blocks: ${this.gameState.getNumBlocksRemaining()}`;

    const score = this.gameState.getScore();
    const selScore = this.gameState.getPopListScore();
    const scoreStr = blocksSelected !== 0 ? `Score: ${score} <span class='selected'>(${selScore})</span>` : `Score: ${score}`;

    const t = this.gameState.getPlayedDuration();
    const h = t.hours > 0 ? `${t.hours}:` : '';
    const m = t.minutes.toString().padStart(2, '0');
    const s = t.seconds.toString().padStart(2, '0');
    const clockStr = `${h}${m}:${s}`;
    this.scoreDisplay.setValues(blockStr, clockStr, scoreStr);
  }
}

export default ScoreBoard;
