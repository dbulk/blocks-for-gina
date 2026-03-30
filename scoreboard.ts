import type GameState from './gamestate';
import type HudView from './scoredisplay';
import HudPresenter from './hudpresenter';

class ScoreBoard {
  gameState: GameState;
  scoreDisplay: HudView;
  private readonly hudPresenter: HudPresenter;

  constructor (gameState: GameState, scoreDisplay: HudView) {
    this.gameState = gameState;
    this.scoreDisplay = scoreDisplay;
    this.hudPresenter = new HudPresenter();
  }

  update (): void {
    const metrics = this.hudPresenter.getMetrics(this.gameState);
    this.scoreDisplay.render(metrics);
  }
}

export default ScoreBoard;
