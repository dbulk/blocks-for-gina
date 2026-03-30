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
  private readonly playfield: HTMLDivElement;
  private readonly overlayLayer: HTMLDivElement;
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

    this.playfield = document.createElement('div');
    this.playfield.style.position = 'relative';
    this.playfield.style.display = 'inline-block';

    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '2px solid';
    this.canvas.style.display = 'block';

    this.overlayLayer = document.createElement('div');
    this.overlayLayer.style.position = 'absolute';
    this.overlayLayer.style.left = '0';
    this.overlayLayer.style.top = '0';
    this.overlayLayer.style.width = '100%';
    this.overlayLayer.style.height = '100%';

    this.ui = new UINodes();
    this.ui.createUI();
    this.startOverlay = new StartOverlayView();
    this.gameOverOverlay = new GameOverOverlayView();

    div.appendChild(this.scoreDisplay.div);
    this.playfield.appendChild(this.canvas);
    this.overlayLayer.appendChild(this.startOverlay.container);
    this.overlayLayer.appendChild(this.gameOverOverlay.container);
    this.playfield.appendChild(this.overlayLayer);
    div.appendChild(this.playfield);
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
    let showOverlayLayer = false;
    switch (state) {
      case 'preGame':
        showSplash = true;
        showOverlayLayer = true;
        break;
      case 'inGame':
      case 'paused':
        showSplash = false;
        showOverlayLayer = false;
        break;
      case 'gameOverSummary':
        showSplash = false;
        showOverlayLayer = true;
        break;
    }

    this.overlayLayer.style.display = showOverlayLayer ? 'block' : 'none';
    this.startOverlay.setVisible(showSplash);

    const showHudAndControls = !showSplash;
    this.ui.setVisibility(showHudAndControls);
    this.scoreDisplay.setVisibility(showHudAndControls);
    this.gameOverOverlay.setVisible(state === 'gameOverSummary');
  }

  resize (): void {
    this.playfield.style.width = `${this.canvas.width}px`;
    this.playfield.style.height = `${this.canvas.height}px`;
  }
}

export default HTMLInterface;
export type { SessionUIState };
