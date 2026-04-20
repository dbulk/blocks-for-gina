import styleElement from '@/styling/gamestyle';
import UINodes from '@/presentation/uinodes';
import HudView from '@/presentation/scoredisplay';
import StartOverlayView from '@/presentation/startoverlayview';
import GameOverOverlayView from '@/presentation/gameoveroverlayview';
import ModeSelectView from '@/presentation/modeselectview';
import SandboxSetupView, { type SandboxConfig } from '@/presentation/sandboxsetupview';
import OverlayManager, { type SessionUIState } from '@/presentation/overlaymanager';
import type { HighScoreEntry } from '@/persistence/highscores';
import type { CanvasSizeConstraints } from '@/rendering/renderer';
import type { GameMode } from '@/core/moderegistry';

class HTMLInterface {
  canvas!: HTMLCanvasElement;
  ui: UINodes;
  scoreDisplay: HudView;
  isvalid = false;
  private readonly playfield: HTMLDivElement;
  private readonly overlayLayer: HTMLDivElement;
  private readonly overlayManager: OverlayManager;
  private readonly startOverlay: StartOverlayView;
  private readonly gameOverOverlay: GameOverOverlayView;
  private readonly modeSelectView: ModeSelectView;
  private readonly sandboxSetupView: SandboxSetupView;
  private sessionUIState: SessionUIState = 'modeSelect';

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
    this.overlayManager = new OverlayManager(this.overlayLayer);

    this.ui = new UINodes();
    this.ui.createUI();
    this.startOverlay = new StartOverlayView();
    this.gameOverOverlay = new GameOverOverlayView();
    this.modeSelectView = new ModeSelectView();
    this.sandboxSetupView = new SandboxSetupView();

    div.appendChild(this.scoreDisplay.div);
    this.playfield.appendChild(this.canvas);
    this.overlayManager.register('modeSelect', this.modeSelectView);
    this.overlayManager.register('sandboxSetup', this.sandboxSetupView);
    this.overlayManager.register('start', this.startOverlay);
    this.overlayManager.register('gameOver', this.gameOverOverlay);
    this.playfield.appendChild(this.overlayLayer);
    div.appendChild(this.playfield);
    this.ui.setParent(div);
    this.setSessionUIState('modeSelect');
  }

  setAvailableModes (modes: GameMode[]): void {
    this.ui.setAvailableModes(modes);
    this.modeSelectView.setModes(modes);
  }

  addModeSelectListener (callback: (modeId: string) => void): void {
    this.modeSelectView.addModeCardClickListener(callback);
  }

  addResumeClickListener (callback: () => void): void {
    this.modeSelectView.addResumeClickListener(callback);
  }

  setResumeVisible (visible: boolean, modeId?: string): void {
    this.modeSelectView.setResumeVisible(visible, modeId);
  }

  addStartClickListener (func: () => void): void {
    this.startOverlay.addStartClickListener(func);
  }

  addPlayAgainClickListener (func: () => void): void {
    this.gameOverOverlay.addPlayAgainClickListener(func);
  }

  setGameOverSummary (
    score: number,
    time: string,
    blocksPopped: number,
    blocksRemaining: number,
    largestCluster: number,
    totalMoves: number,
    highScores: HighScoreEntry[],
    rank: number | null
  ): void {
    this.gameOverOverlay.setSummary(score, time, blocksPopped, blocksRemaining, largestCluster, totalMoves, highScores, rank);
  }

  hideStartButton (): void {
    this.setSessionUIState('inGame');
  }

  private modeSelectShownListeners: Array<() => void> = [];

  addSandboxStartListener (callback: (config: SandboxConfig) => void): void {
    this.sandboxSetupView.addStartListener(callback);
  }

  addSandboxBackListener (callback: () => void): void {
    this.sandboxSetupView.addBackListener(callback);
  }

  addModeSelectShownListener (callback: () => void): void {
    this.modeSelectShownListeners.push(callback);
  }

  setSessionUIState (state: SessionUIState): void {
    this.sessionUIState = state;
    this.overlayManager.setState(state);
    const showSplash = state === 'modeSelect' || state === 'preGame' || state === 'sandboxSetup';
    this.canvas.style.display = showSplash ? 'none' : 'block';

    const showHudAndControls = !showSplash;
    this.ui.setVisibility(showHudAndControls);
    this.scoreDisplay.setVisibility(showHudAndControls);
    if (state === 'modeSelect') {
      for (const cb of this.modeSelectShownListeners) cb();
    }
  }

  resize (): void {
    this.playfield.style.width = `${this.canvas.width}px`;
    this.playfield.style.height = `${this.canvas.height}px`;
  }

  getCanvasSizeConstraints (): CanvasSizeConstraints {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const playfieldTop = this.playfield.getBoundingClientRect().top;
    const width = this.playfield.parentElement?.clientWidth ?? window.innerWidth;
    const height = viewportHeight - playfieldTop - 8;

    return {
      width,
      height
    };
  }
}

export default HTMLInterface;
export type { SessionUIState };
