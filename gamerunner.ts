import GameState from './gamestate.js';

import type GameSettings from './gamesettings.js';
import type htmlInterface from './htmlinterface.js';
import type Renderer from './renderer.js';

const MOVERATE = 0.15;
class GameRunner {
  renderer: Renderer;
  settings: GameSettings;
  gameState: GameState;
  canvas: HTMLCanvasElement;
  private readonly page: htmlInterface;
  audio: HTMLAudioElement;
  music: HTMLAudioElement;
  soundEnabled: boolean = true;

  constructor (renderer: Renderer, settings: GameSettings, page: htmlInterface) {
    this.renderer = renderer;
    this.settings = settings;
    this.audio = new Audio('./sound.wav');
    this.gameState = new GameState(this.playSoundEffect.bind(this));

    this.page = page;
    this.canvas = page.canvas;

    this.newGame();
    this.attachListeners();

    this.music = new Audio('./scott-buckley-permafrost(chosic.com).mp3');
    this.music.loop = true;
    this.music.play().catch(() => {});
    this.gameLoop();
    this.deserialize();

    this.playSoundEffect();
    window.addEventListener('beforeunload', this.serialize.bind(this));
  }

  private newGame (): void {
    this.renderer.setGameState(this.gameState);
    this.gameState.initializeGrid(this.settings.numRows, this.settings.numColumns, this.settings.numBlockTypes, this.settings.clusterStrength);
    this.gameState.resetClock();
    this.gameState.resetScore();
    this.renderer.adjustCanvasSize();
  }

  private gameLoop (): void {
    this.gameState.updateBlocks();

    if (this.gameState.animating) {
      requestAnimationFrame(() => { this.animationLoop(performance.now()); });
    }

    if (this.gameState.blocksDirty) {
      this.renderer.renderBlocks();
      this.renderer.renderPreview(this.gameState.popList);
      this.gameState.blocksDirty = false;
    }

    this.renderer.renderScoreBoard();
    // Schedule the next iteration of the game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private animationLoop (startTime: number): void {
    const elapsedTime = performance.now() - startTime;
    const numSteps = Math.floor(elapsedTime * MOVERATE);
    // increment startTime based on how much has been "used"
    startTime += numSteps / MOVERATE;
    let turnItOff = false;
    for (let step = 0; step < numSteps; step++) {
      turnItOff = !this.gameState.decrementOffsets(0.1);
    }

    this.renderer.renderBlocks();
    this.renderer.renderScoreBoard();
    if (turnItOff) {
      this.gameState.animating = false;
      this.gameState.blocksDirty = true;
    } else {
      requestAnimationFrame(() => { this.animationLoop(startTime); });
    }
  }

  private attachListeners (): void {
    this.canvas.addEventListener('click', this.gameState.doPop.bind(this.gameState));
    this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
      const coord = this.renderer.getGridIndicesFromMouse(event);
      this.gameState.updateSelection(coord);
    });
    this.canvas.addEventListener(
      'mouseleave',
      () => { this.gameState.updateSelection({ row: -1, col: -1 }); }
    );

    this.page.ui.addNewGameClickListener(
      () => {
        this.settings.uiToSettings();
        this.newGame();
      }
    );

    this.page.ui.addTogMusicClickListener(() => {
      this.setAudioState();
    });

    this.page.ui.addTogSoundClickListener(() => {
      this.setAudioState();
    });

    this.page.ui.addInputColorsInputListener(() => {
      this.settings.uiColorsToSettings();
      this.gameState.blocksDirty = true;
    });
  }

  private setAudioState (): void {
    this.settings.ui.getTogMusic()
      ? this.music.play().catch(() => {})
      : this.music.pause();
    this.soundEnabled = this.settings.ui.getTogSound();
  }

  playSoundEffect (): void {
    if (this.soundEnabled) {
      this.audio.play().catch(() => {});
    }
  }

  serialize (): void {
    // needs to serialize GameState and GameSettings
    const state = this.gameState.serialize();
    const settings = this.settings.serialize();
    localStorage.setItem('b4g', JSON.stringify({ state, settings }));
  }

  deserialize (): void {
    const data = localStorage.getItem('b4g');
    if (data !== null) {
      const { state, settings } = JSON.parse(data);
      this.settings.deserialize(settings); // todo: fix type
      this.gameState.deserialize(state); // todo: fix type
      this.setAudioState();
      this.renderer.adjustCanvasSize();
    }
  }
}

export default GameRunner;
