import type GameState from '@/core/gamestate';
import type HudView from '@/presentation/scoredisplay';
import HudPresenter from '@/presentation/hudpresenter';

class ScoreBoard {
  gameState: GameState;
  scoreDisplay: HudView;
  private readonly hudPresenter: HudPresenter;

  constructor (gameState: GameState, scoreDisplay: HudView) {
    this.gameState = gameState;
    this.scoreDisplay = scoreDisplay;
    this.hudPresenter = new HudPresenter();
  }

  update (modeId: string = 'arcade'): void {
    const metrics = this.hudPresenter.getMetrics(this.gameState, modeId);
    this.scoreDisplay.render(metrics);
  }
}

export default ScoreBoard;
