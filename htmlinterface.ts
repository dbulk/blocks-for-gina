import styleElement from './gamestyle.js';
import UINodes from './uinodes.js';
import HudView from './scoredisplay.js';
import StartOverlayView from './startoverlayview.js';
import GameOverOverlayView from './gameoveroverlayview.js';

type SessionUIState = 'preGame' | 'inGame' | 'paused' | 'gameOverSummary';

class HTMLInterface {
  canvas!: HTMLCanvasElement;
  ui: UINodes;
  scoreDisplay: HudView;
  isvalid = false;
  private readonly startOverlay: StartOverlayView;
  private readonly gameOverOverlay: GameOverOverlayView;
  private sessionUIState: SessionUIState = 'preGame';

  constructor (root: ShadowRoot) {
    root.appendChild(styleElement);
    this.isvalid = true;
    const topDiv = document.createElement('div');
    root.appendChild(topDiv);

    topDiv.style.display = 'flex';
    topDiv.style.justifyContent = 'center';
    topDiv.style.alignItems = 'start';
    topDiv.style.height = '100%';

    const div = document.createElement('div');
    div.className = 'blocks4Gina';
    div.style.justifyContent = 'center';
    topDiv.appendChild(div);

    this.scoreDisplay = new HudView();

    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '2px solid';
    this.canvas.style.display = 'block';

    this.ui = new UINodes();
    this.ui.createUI();
    this.startOverlay = new StartOverlayView();
    this.gameOverOverlay = new GameOverOverlayView();

    div.appendChild(this.scoreDisplay.div);
    div.appendChild(this.canvas);
    div.appendChild(this.startOverlay.container);
    div.appendChild(this.gameOverOverlay.container);
    this.ui.setParent(div);
    this.setSessionUIState('preGame');
  }

  addStartClickListener (func: () => void): void {
    this.startOverlay.addStartClickListener(func);
  }

  addPlayAgainClickListener (func: () => void): void {
    this.gameOverOverlay.addPlayAgainClickListener(func);
  }

  setGameOverSummary (score: number, time: string, blocksRemaining: number): void {
    this.gameOverOverlay.setSummary(score, time, blocksRemaining);
  }

  hideStartButton (): void {
    this.setSessionUIState('inGame');
  }

  setSessionUIState (state: SessionUIState): void {
    this.sessionUIState = state;

    let showSplash = false;
    switch (state) {
      case 'preGame':
        showSplash = true;
        break;
      case 'inGame':
      case 'paused':
      case 'gameOverSummary':
        showSplash = false;
        break;
    }

    this.startOverlay.setVisible(showSplash);

    const showHudAndControls = !showSplash;
    this.ui.setVisibility(showHudAndControls);
    this.scoreDisplay.setVisibility(showHudAndControls);
    this.gameOverOverlay.setVisible(state === 'gameOverSummary');
  }

  resize (): void {
    if (this.sessionUIState === 'preGame') {
      this.startOverlay.setCanvasHeight(this.canvas.height);
    }
  }
}

export default HTMLInterface;
export type { SessionUIState };
