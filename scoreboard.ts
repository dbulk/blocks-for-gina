import type GameState from './gamestate';

class ScoreBoard {
  gameState: GameState;
  blockStr: string = '';
  scoreStr: string = '';
  clockStr: string = '';

  constructor (gameState: GameState) {
    this.gameState = gameState;
  }

  update (): void {
    const blocksSelected = this.gameState.getNumBlocksToPop();
    this.blockStr = blocksSelected !== 0
      ? `Blocks: ${this.gameState.getNumBlocksRemaining()} (${blocksSelected})`
      : `Blocks: ${this.gameState.getNumBlocksRemaining()}`;

    const score = this.gameState.getScore();
    const selScore = this.gameState.getPopListScore();
    this.scoreStr = blocksSelected !== 0 ? `Score: ${score} (${selScore})` : `Score: ${score}`;

    const t = this.gameState.getPlayedDuration();
    const h = t.hours > 0 ? `${t.hours}:` : '';
    const m = t.minutes.toString().padStart(2, '0');
    const s = t.seconds.toString().padStart(2, '0');
    this.clockStr = `${h}${m}:${s}`;
  }
}

export default ScoreBoard;
