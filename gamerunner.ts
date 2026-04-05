import GameState from './gamestate.js';
import ScoreBoard from './scoreboard.js';
import LocalHighScores from './highscores.js';
import type GameSettings from './gamesettings.js';
import type htmlInterface from './htmlinterface.js';
import type Renderer from './renderer.js';

const MOVERATE = 0.15;
const GAME_OVER_FADE_STEP = 0.375;
class GameRunner {
  renderer: Renderer;
  settings: GameSettings;
  gameState: GameState;
  canvas: HTMLCanvasElement;
  private readonly page: htmlInterface;
  audio: HTMLAudioElement;
  music: HTMLAudioElement;
  soundEnabled: boolean = true;
  scoreBoard: ScoreBoard;
  gameOverAnimationState = 0;
  private animationLoopRunning: boolean = false;
  private hasShownGameOverSummary: boolean = false;
  private readonly highScores: LocalHighScores;

  constructor (renderer: Renderer, settings: GameSettings, page: htmlInterface) {
    this.renderer = renderer;
    this.settings = settings;
    this.audio = new Audio('./sound.wav');
    this.gameState = new GameState(this.playSoundEffect.bind(this));
    this.scoreBoard = new ScoreBoard(this.gameState, page.scoreDisplay);
    this.highScores = new LocalHighScores();

    this.page = page;
    this.canvas = page.canvas;
    this.page.setSessionUIState('inGame');

    this.newGame();
    this.attachListeners();

    this.music = new Audio('./scott-buckley-permafrost(chosic.com).mp3');
    this.music.loop = true;
    this.music.play().catch(() => { });
    this.gameLoop();
    this.deserialize();

    if (!this.gameState.hasMoreMoves()) {
      this.newGame();
    }

    this.playSoundEffect();
    window.addEventListener('beforeunload', this.serialize.bind(this));
  }

  private newGame (): void {
    this.page.setSessionUIState('inGame');
    this.renderer.setGameState(this.gameState);
    this.gameState.initializeGrid(this.settings.numRows, this.settings.numColumns, this.settings.numBlockTypes, this.settings.clusterStrength);
    this.gameState.resetClock();
    this.gameState.resetScore();
    this.gameState.resetRoundStats();
    this.gameState.resetUndo();
    this.renderer.adjustCanvasSize(this.page.getCanvasSizeConstraints());
    this.page.resize();
    this.gameOverAnimationState = 0;
    this.animationLoopRunning = false;
    this.hasShownGameOverSummary = false;
  }

  private gameLoop (): void {
    this.gameState.updateBlocks();
    this.page.ui.setUndoEnabled(this.gameState.hasUndo());
    this.page.ui.setRedoEnabled(this.gameState.hasRedo());

    if (this.gameState.animating && !this.animationLoopRunning) {
      this.animationLoopRunning = true;
      requestAnimationFrame(() => { this.animationLoop(performance.now()); });
    }

    if (this.gameState.blocksDirty) {
      this.renderer.renderBlocks();
      this.renderer.renderPreview(this.gameState.popList);
      this.gameState.blocksDirty = false;
    }

    if (this.gameState.hasMoreMoves()) {
      this.scoreBoard.update();
      if (this.hasShownGameOverSummary) {
        this.page.setSessionUIState('inGame');
        this.hasShownGameOverSummary = false;
      }
    } else {
      // show game over screen (todo: break out of the loop, but need a way to know whether it's running and start it again)
      this.gameOverAnimationState = Math.min(this.gameOverAnimationState + GAME_OVER_FADE_STEP, 90);
      this.renderer.showGameOver(this.gameOverAnimationState / 100);
      if (!this.hasShownGameOverSummary) {
        const playedTime = this.gameState.getPlayedDuration();
        const elapsedSeconds = playedTime.hours * 3600 + playedTime.minutes * 60 + playedTime.seconds;
        const recordResult = this.highScores.record({
          score: this.gameState.getScore(),
          elapsedSeconds,
          rows: this.settings.numRows,
          columns: this.settings.numColumns,
          playedAt: Date.now()
        });

        this.page.setSessionUIState('gameOverSummary');
        this.page.setGameOverSummary(
          this.gameState.getScore(),
          this.getClockText(),
          this.gameState.getBlocksPopped(),
          this.gameState.getNumBlocksRemaining(),
          this.gameState.getLargestCluster(),
          this.gameState.getTotalMoves(),
          recordResult.topEntries,
          recordResult.rank
        );
        this.hasShownGameOverSummary = true;
      }
    }

    // Schedule the next iteration of the game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private animationLoop (startTime: number): void {
    if (!this.gameState.animating) {
      this.animationLoopRunning = false;
      return;
    }

    const elapsedTime = performance.now() - startTime;
    const numSteps = Math.floor(elapsedTime * MOVERATE);
    // increment startTime based on how much has been "used"
    startTime += numSteps / MOVERATE;
    let turnItOff = false;
    for (let step = 0; step < numSteps; step++) {
      turnItOff = !this.gameState.decrementOffsets(0.1);
    }

    this.renderer.renderBlocks();
    this.scoreBoard.update();
    if (turnItOff) {
      this.gameState.animating = false;
      this.gameState.blocksDirty = true;
      this.animationLoopRunning = false;
    } else {
      requestAnimationFrame(() => { this.animationLoop(startTime); });
    }
  }

  private attachListeners (): void {
    this.canvas.addEventListener('pointermove', (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        return;
      }
      const coord = this.renderer.getGridIndicesFromClientPosition(event.clientX, event.clientY);
      this.gameState.updateSelection(coord);
    });
    this.canvas.addEventListener('pointerup', (event: PointerEvent) => {
      const coord = this.renderer.getGridIndicesFromClientPosition(event.clientX, event.clientY);
      this.gameState.updateSelection(coord);
      this.gameState.doPop();
      if (event.pointerType !== 'mouse') {
        this.gameState.clearSelectionTarget();
      }
    });
    this.canvas.addEventListener('pointerleave', () => {
      this.gameState.updateSelection({ row: -1, col: -1 });
    });
    this.canvas.addEventListener('pointercancel', () => {
      this.gameState.updateSelection({ row: -1, col: -1 });
    });

    this.page.ui.addNewGameClickListener(
      () => {
        this.startNewGameFromUI();
      }
    );

    this.page.ui.addApplySettingsListener(() => {
      this.startNewGameFromUI();
    });

    this.page.ui.addResetSettingsListener(() => {
      this.settings.resetToDefaults();
      this.settings.uiAllToSettings();
      this.setAudioState();
      this.gameState.blocksDirty = true;
    });

    this.page.addPlayAgainClickListener(() => {
      this.startNewGameFromUI();
    });

    this.page.ui.addUndoListener(
      () => {
        this.gameState.undo();
      }
    );

    this.page.ui.addRedoListener(
      () => {
        this.gameState.redo();
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

    this.page.ui.addInputBlockStyleListener(() => {
      this.settings.uiToSettings();
      this.gameState.blocksDirty = true;
    });
  }

  private startNewGameFromUI (): void {
    this.settings.uiAllToSettings();
    this.setAudioState();
    this.newGame();
  }

  private setAudioState (): void {
    if (this.settings.ui.getTogMusic()) {
      this.music.play().catch(() => { });
    } else {
      this.music.pause();
    }
    this.soundEnabled = this.settings.ui.getTogSound();
  }

  private getClockText (): string {
    const t = this.gameState.getPlayedDuration();
    const h = t.hours > 0 ? `${t.hours}:` : '';
    const m = t.minutes.toString().padStart(2, '0');
    const s = t.seconds.toString().padStart(2, '0');
    return `${h}${m}:${s}`;
  }

  playSoundEffect (): void {
    if (this.soundEnabled) {
      this.audio.play().catch(() => { });
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
      const { state, settings } = JSON.parse(data) as { state: unknown, settings: unknown };
      this.settings.deserialize(settings as Parameters<typeof this.settings.deserialize>[0]);
      this.gameState.deserialize(state as Parameters<typeof this.gameState.deserialize>[0]);
      this.setAudioState();
      this.renderer.adjustCanvasSize(this.page.getCanvasSizeConstraints());
      this.page.resize();
    }
  }
}

export default GameRunner;
