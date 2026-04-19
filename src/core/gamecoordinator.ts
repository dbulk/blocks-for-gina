import GameState from '@/core/gamestate';
import GameLoopManager from '@/core/gameloopmanager';
import { ARCADE_RUN_CONFIG } from '@/core/arcadeconfig';
import { shouldEndGameForMode } from '@/core/moderules';
import AudioController from '@/audio/audiocontroller';
import GameEventBus from '@/events/eventbus';
import ScoreBoard from '@/persistence/scoreboard';
import SessionStorage from '@/persistence/sessionstorage';
import LocalHighScores from '@/persistence/highscores';
import type { BlocksPoppedEvent, GameEndedEvent, GameStartedEvent, ModeRulesAppliedEvent, ModeSelectedEvent } from '@/events/events';
import type GameSettings from '@/core/gamesettings';
import type HTMLInterface from '@/presentation/htmlinterface';
import type SettingsPresenter from '@/presentation/settingspresenter';
import type Renderer from '@/rendering/renderer';

const MOVERATE = 0.15;
const GAME_OVER_FADE_STEP = 0.375;

interface GameCoordinatorDependencies {
  eventBus?: GameEventBus
  gameLoopManager?: GameLoopManager
  sessionStorage?: SessionStorage
  audioController?: AudioController
  highScores?: LocalHighScores
  autoStartLoop?: boolean
  attachBeforeUnloadListener?: boolean
}

class GameCoordinator {
  renderer: Renderer;
  settings: GameSettings;
  gameState: GameState;
  canvas: HTMLCanvasElement;
  private readonly page: HTMLInterface;
  private readonly settingsPresenter: SettingsPresenter;
  scoreBoard: ScoreBoard;
  private readonly audioController: AudioController;
  gameOverAnimationState = 0;
  private animationLoopRunning: boolean = false;
  private hasShownGameOverSummary: boolean = false;
  private readonly highScores: LocalHighScores;
  private readonly eventBus: GameEventBus;
  private readonly gameLoopManager: GameLoopManager;
  private readonly sessionStorage: SessionStorage;
  private readonly soundEffectSrc = new URL('../assets/audio/pop.wav', import.meta.url).href;
  private readonly musicSrc = new URL('../assets/audio/music.mp3', import.meta.url).href;

  constructor (
    renderer: Renderer,
    settings: GameSettings,
    settingsPresenter: SettingsPresenter,
    page: HTMLInterface,
    dependencies: GameCoordinatorDependencies = {}
  ) {
    this.renderer = renderer;
    this.settings = settings;
    this.settingsPresenter = settingsPresenter;
    this.eventBus = dependencies.eventBus ?? new GameEventBus();
    this.gameLoopManager = dependencies.gameLoopManager ?? new GameLoopManager();
    this.sessionStorage = dependencies.sessionStorage ?? new SessionStorage();
    this.audioController = dependencies.audioController ?? new AudioController(this.soundEffectSrc, this.musicSrc);
    this.gameState = new GameState(() => {});
    this.scoreBoard = new ScoreBoard(this.gameState, page.scoreDisplay);
    this.highScores = dependencies.highScores ?? new LocalHighScores();
    this.registerEventListeners();

    this.page = page;
    this.canvas = page.canvas;
    this.page.setSessionUIState('inGame');

    this.newGame();
    this.attachListeners();

    this.deserialize();
    this.setAudioState();
    if (dependencies.autoStartLoop ?? true) {
      this.gameLoopManager.start(this.gameLoop.bind(this));
    }

    if (!this.gameState.hasMoreMoves()) {
      this.newGame();
    }
    if (dependencies.attachBeforeUnloadListener ?? true) {
      window.addEventListener('beforeunload', this.serialize.bind(this));
    }
  }

  private registerEventListeners (): void {
    this.eventBus.on('blocksPopped', () => {
      this.audioController.playSoundEffect();
    });
  }

  private newGame (): void {
    const modeSelectedEvent: ModeSelectedEvent = {
      type: 'modeSelected',
      modeId: this.settings.modeId
    };
    this.eventBus.emit('modeSelected', modeSelectedEvent);

    const runConfig = this.settings.modeId === 'arcade' ? ARCADE_RUN_CONFIG : {
      numRows: this.settings.numRows,
      numColumns: this.settings.numColumns,
      numBlockTypes: this.settings.numBlockTypes,
      clusterStrength: this.settings.clusterStrength
    };

    this.page.setSessionUIState('inGame');
    this.renderer.setGameState(this.gameState);
    this.gameState.initializeGrid(runConfig.numRows, runConfig.numColumns, runConfig.numBlockTypes, runConfig.clusterStrength);
    this.gameState.resetClock();
    this.gameState.resetScore();
    this.gameState.resetRoundStats();
    this.gameState.resetUndo();
    this.renderer.adjustCanvasSize(this.page.getCanvasSizeConstraints());
    this.page.resize();
    this.gameOverAnimationState = 0;
    this.animationLoopRunning = false;
    this.hasShownGameOverSummary = false;

    const event: GameStartedEvent = {
      type: 'gameStarted',
      rows: runConfig.numRows,
      columns: runConfig.numColumns,
      blockTypes: runConfig.numBlockTypes
    };
    this.eventBus.emit('gameStarted', event);

    const modeRulesAppliedEvent: ModeRulesAppliedEvent = {
      type: 'modeRulesApplied',
      modeId: this.settings.modeId
    };
    this.eventBus.emit('modeRulesApplied', modeRulesAppliedEvent);
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

    const hasMoreMoves = this.gameState.hasMoreMoves();
    const isGameOver = shouldEndGameForMode(this.settings.modeId, this.gameState, hasMoreMoves);

    if (!isGameOver) {
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

        const gameEndedEvent: GameEndedEvent = {
          type: 'gameEnded',
          score: this.gameState.getScore(),
          playedSeconds: elapsedSeconds,
          blocksPopped: this.gameState.getBlocksPopped(),
          largestCluster: this.gameState.getLargestCluster()
        };
        this.eventBus.emit('gameEnded', gameEndedEvent);
        this.hasShownGameOverSummary = true;
      }
    }

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
      const previousMoves = this.gameState.getTotalMoves();
      const previousBlocksPopped = this.gameState.getBlocksPopped();
      const coord = this.renderer.getGridIndicesFromClientPosition(event.clientX, event.clientY);
      this.gameState.updateSelection(coord);
      this.gameState.doPop();

      if (this.gameState.getTotalMoves() > previousMoves) {
        const poppedDelta = this.gameState.getBlocksPopped() - previousBlocksPopped;
        const poppedEvent: BlocksPoppedEvent = {
          type: 'blocksPopped',
          clusterSize: poppedDelta,
          totalScore: this.gameState.getScore(),
          remainingBlocks: this.gameState.getNumBlocksRemaining()
        };
        this.eventBus.emit('blocksPopped', poppedEvent);
      }

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
      this.settingsPresenter.resetToDefaults();
      this.settingsPresenter.uiAllToSettings();
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
      this.settingsPresenter.uiColorsToSettings();
      this.gameState.blocksDirty = true;
    });

    this.page.ui.addInputBlockStyleListener(() => {
      this.settingsPresenter.uiToSettings();
      this.gameState.blocksDirty = true;
    });
  }

  private startNewGameFromUI (): void {
    this.settingsPresenter.uiAllToSettings();
    this.setAudioState();
    this.newGame();
  }

  private setAudioState (): void {
    this.settingsPresenter.syncAudioToSettings();
    this.audioController.applySettings(this.settings.isMusicEnabled, this.settings.isSoundEnabled);
  }

  private getClockText (): string {
    const t = this.gameState.getPlayedDuration();
    const h = t.hours > 0 ? `${t.hours}:` : '';
    const m = t.minutes.toString().padStart(2, '0');
    const s = t.seconds.toString().padStart(2, '0');
    return `${h}${m}:${s}`;
  }

  serialize (): void {
    this.sessionStorage.save(this.gameState.serialize(), this.settings.serialize());
  }

  deserialize (): void {
    const snapshot = this.sessionStorage.load();
    if (snapshot === null) {
      return;
    }

    this.settings.deserialize(snapshot.settings as Parameters<typeof this.settings.deserialize>[0]);
    this.settingsPresenter.settingsToUI();
    this.gameState.deserialize(snapshot.state as Parameters<typeof this.gameState.deserialize>[0]);
    this.setAudioState();
    this.renderer.adjustCanvasSize(this.page.getCanvasSizeConstraints());
    this.page.resize();
  }
}

export default GameCoordinator;
