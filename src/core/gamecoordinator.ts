import GameState from '@/core/gamestate';
import GameLoopManager from '@/core/gameloopmanager';
import { ARCADE_RUN_CONFIG } from '@/core/arcadeconfig';
import { isCompetitiveMode } from '@/core/moderegistry';
import { shouldEndGameForMode, TIMED_MODE_DURATION_SECONDS, TIMED_NO_MOVES_BONUS_POINTS_PER_SECOND } from '@/core/moderules';
import AudioController from '@/audio/audiocontroller';
import GameEventBus from '@/events/eventbus';
import ScoreBoard from '@/persistence/scoreboard';
import SessionStorage from '@/persistence/sessionstorage';
import LocalHighScores, { LocalSandboxBest } from '@/persistence/highscores';
import type { BlocksPoppedEvent, GameEndedEvent, GameStartedEvent, ModeRulesAppliedEvent, ModeSelectedEvent, RunContext, RunSetup, RunSource } from '@/events/events';
import type GameSettings from '@/core/gamesettings';
import type UserPreferences from '@/core/userpreferences';
import type HTMLInterface from '@/presentation/htmlinterface';
import type SettingsPresenter from '@/presentation/settingspresenter';
import type Renderer from '@/rendering/renderer';

const MOVERATE = 0.15;
const GAME_OVER_FADE_STEP = 3;
const CASCADE_AUTO_WAVE_MIN_CLUSTER_SIZE = 3;
const TIMED_NO_MOVES_FAST_FORWARD_DURATION_MS = 650;

interface GameCoordinatorDependencies {
  eventBus?: GameEventBus
  gameLoopManager?: GameLoopManager
  sessionStorage?: SessionStorage
  audioController?: AudioController
  highScores?: LocalHighScores
  sandboxBest?: LocalSandboxBest
  autoStartLoop?: boolean
  attachBeforeUnloadListener?: boolean
  skipSessionRestore?: boolean
  runSource?: RunSource
}

class GameCoordinator {
  renderer: Renderer;
  settings: GameSettings;
  private readonly prefs: UserPreferences;
  gameState: GameState;
  canvas: HTMLCanvasElement;
  private readonly page: HTMLInterface;
  private readonly settingsPresenter: SettingsPresenter;
  scoreBoard: ScoreBoard;
  private readonly audioController: AudioController;
  gameOverAnimationState = 0;
  private animationLoopRunning: boolean = false;
  private hasShownGameOverSummary: boolean = false;
  private activeRunContext: RunContext | null = null;
  private readonly runSource: RunSource;
  private precisionNeedsNewTarget: boolean = false;
  private cascadeAutoWavePending: boolean = false;
  private cascadeAutoWaveMinClusterSize: number = CASCADE_AUTO_WAVE_MIN_CLUSTER_SIZE;
  private timedNoMovesFastForwardStartTime: number | null = null;
  private timedNoMovesFastForwardStartElapsedSeconds: number = 0;
  private timedNoMovesBonusAwarded: boolean = false;
  private readonly highScores: LocalHighScores;
  private readonly sandboxBest: LocalSandboxBest;
  private readonly eventBus: GameEventBus;
  private readonly gameLoopManager: GameLoopManager;
  private readonly sessionStorage: SessionStorage;
  private readonly soundEffectSrc = new URL('../assets/audio/pop.wav', import.meta.url).href;
  private readonly musicSrc = new URL('../assets/audio/music.mp3', import.meta.url).href;

  constructor (
    renderer: Renderer,
    settings: GameSettings,
    userPreferences: UserPreferences,
    settingsPresenter: SettingsPresenter,
    page: HTMLInterface,
    dependencies: GameCoordinatorDependencies = {}
  ) {
    this.renderer = renderer;
    this.settings = settings;
    this.prefs = userPreferences;
    this.settingsPresenter = settingsPresenter;
    this.runSource = dependencies.runSource ?? 'modeSelect';
    this.eventBus = dependencies.eventBus ?? new GameEventBus();
    this.gameLoopManager = dependencies.gameLoopManager ?? new GameLoopManager();
    this.sessionStorage = dependencies.sessionStorage ?? new SessionStorage();
    this.audioController = dependencies.audioController ?? new AudioController(this.soundEffectSrc, this.musicSrc);
    this.gameState = new GameState(() => {});
    this.scoreBoard = new ScoreBoard(this.gameState, page.scoreDisplay);
    this.highScores = dependencies.highScores ?? new LocalHighScores();
    this.sandboxBest = dependencies.sandboxBest ?? new LocalSandboxBest();
    this.registerEventListeners();

    this.page = page;
    this.canvas = page.canvas;
    this.page.setSessionUIState('inGame');

    this.newGame();
    this.attachListeners();

    if (!(dependencies.skipSessionRestore ?? false)) {
      this.deserialize();
    }
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
    this.prefs.ensureBlockColorCapacity(this.settings.numBlockTypes);
    this.page.ui.setColorInputCount(this.settings.numBlockTypes);
    this.page.ui.setInputColors(this.prefs.blockColors);

    const runSetup = this.getRunSetup();
    this.settings.numRows = runSetup.numRows;
    this.settings.numColumns = runSetup.numColumns;
    this.settings.numBlockTypes = runSetup.numBlockTypes;
    const runContext: RunContext = {
      modeId: this.settings.modeId,
      source: this.runSource,
      setup: runSetup
    };
    this.activeRunContext = runContext;

    const modeSelectedEvent: ModeSelectedEvent = {
      type: 'modeSelected',
      modeId: runContext.modeId
    };
    this.eventBus.emit('modeSelected', modeSelectedEvent);

    this.page.setSessionUIState('inGame');
    this.renderer.setGameState(this.gameState);
    this.gameState.setGravityDirection(this.getGravityDirectionForMode(runContext.modeId));
    this.gameState.initializeGrid(runSetup.numRows, runSetup.numColumns, runSetup.numBlockTypes, runSetup.clusterStrength);
    this.gameState.resetClock();
    this.gameState.resetScore();
    this.gameState.resetRoundStats();
    this.gameState.resetModeRuntimeStats();
    this.gameState.resetUndo();
    if (runContext.modeId === 'precision') {
      this.ensurePrecisionTargetAvailable(true);
      this.precisionNeedsNewTarget = false;
    } else {
      this.precisionNeedsNewTarget = false;
    }
    this.cascadeAutoWavePending = false;
    this.cascadeAutoWaveMinClusterSize = CASCADE_AUTO_WAVE_MIN_CLUSTER_SIZE;
    this.resetTimedNoMovesFastForward();
    this.scoreBoard.update(runContext.modeId);
    this.renderer.adjustCanvasSize(this.page.getCanvasSizeConstraints());
    this.page.resize();
    this.gameOverAnimationState = 0;
    this.animationLoopRunning = false;
    this.hasShownGameOverSummary = false;

    const event: GameStartedEvent = {
      type: 'gameStarted',
      rows: runSetup.numRows,
      columns: runSetup.numColumns,
      blockTypes: runSetup.numBlockTypes,
      modeId: runContext.modeId,
      runContext
    };
    this.eventBus.emit('gameStarted', event);

    const modeRulesAppliedEvent: ModeRulesAppliedEvent = {
      type: 'modeRulesApplied',
      modeId: runContext.modeId,
      runContext
    };
    this.eventBus.emit('modeRulesApplied', modeRulesAppliedEvent);
  }

  private getRunSetup (): RunSetup {
    if (this.settings.modeId === 'classic') {
      return ARCADE_RUN_CONFIG;
    }

    return {
      numRows: this.settings.numRows,
      numColumns: this.settings.numColumns,
      numBlockTypes: this.settings.numBlockTypes,
      clusterStrength: this.settings.clusterStrength
    };
  }

  private getGravityDirectionForMode (modeId: string): 'down' | 'up' {
    return modeId === 'antigravity' ? 'up' : 'down';
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

    const activeRunContext = this.activeRunContext ?? {
      modeId: this.settings.modeId,
      source: this.runSource,
      setup: this.getRunSetup()
    };
    const modeId = activeRunContext.modeId;

    if (modeId === 'cascade' && !this.gameState.animating && this.cascadeAutoWavePending) {
      const nextMultiplier = this.gameState.getCascadeCurrentChainDepth() + 1;
      const popped = this.gameState.popLargestCluster({
        countMove: false,
        scoreMultiplier: nextMultiplier,
        minClusterSize: this.cascadeAutoWaveMinClusterSize
      });
      if (popped > 0) {
        this.gameState.recordCascadeWave(popped, nextMultiplier);
        const poppedEvent: BlocksPoppedEvent = {
          type: 'blocksPopped',
          clusterSize: popped,
          totalScore: this.gameState.getScore(),
          remainingBlocks: this.gameState.getNumBlocksRemaining()
        };
        this.eventBus.emit('blocksPopped', poppedEvent);
      }
      this.cascadeAutoWavePending = false;
    }

    if (modeId === 'precision' && !this.gameState.animating && this.precisionNeedsNewTarget) {
      this.ensurePrecisionTargetAvailable(true);
      this.precisionNeedsNewTarget = false;
    }

    if (modeId === 'precision' && !this.gameState.animating && !this.precisionNeedsNewTarget) {
      this.ensurePrecisionTargetAvailable(false);
    }

    if (modeId === 'infinite') {
      this.gameState.refillNullBlocksFromTop(activeRunContext.setup.numBlockTypes);
    }
    const hasMoreMoves = this.gameState.hasMoreMoves();
    const isGameOver = shouldEndGameForMode(modeId, this.gameState, hasMoreMoves);
    const shouldDelayTimedGameOverSummary = this.advanceTimedNoMovesFastForward(modeId, hasMoreMoves, isGameOver);

    if (!isGameOver) {
      this.resetTimedNoMovesFastForward();
      this.scoreBoard.update(modeId);
      if (this.hasShownGameOverSummary) {
        this.page.setSessionUIState('inGame');
        this.hasShownGameOverSummary = false;
      }
    } else {
      if (!this.hasShownGameOverSummary) {
        // Refresh HUD once at game end so timed countdown lands on 00:00.
        this.scoreBoard.update(modeId);
      }
      // show game over screen (todo: break out of the loop, but need a way to know whether it's running and start it again)
      this.gameOverAnimationState = Math.min(this.gameOverAnimationState + GAME_OVER_FADE_STEP, 90);
      this.renderer.showGameOver(this.gameOverAnimationState / 100);
      if (shouldDelayTimedGameOverSummary) {
        return;
      }
      if (!this.hasShownGameOverSummary) {
        const playedTime = this.gameState.getPlayedDuration();
        const elapsedSeconds = playedTime.hours * 3600 + playedTime.minutes * 60 + playedTime.seconds;
        const entry = {
          score: this.gameState.getScore(),
          elapsedSeconds,
          rows: activeRunContext.setup.numRows,
          columns: activeRunContext.setup.numColumns,
          playedAt: Date.now()
        };
        const recordResult = isCompetitiveMode(modeId)
          ? this.highScores.record(entry, modeId)
          : { rank: null, topEntries: [] };
        const sandboxBestResult = isCompetitiveMode(modeId)
          ? null
          : this.sandboxBest.record(entry);

        this.sessionStorage.clear();
        this.page.setSessionUIState('gameOverSummary');
        this.page.setGameOverSummary(
          modeId,
          this.gameState.getScore(),
          this.getClockText(),
          this.gameState.getBlocksPopped(),
          this.gameState.getNumBlocksRemaining(),
          this.gameState.getLargestCluster(),
          this.gameState.getTotalMoves(),
          recordResult.topEntries,
          recordResult.rank,
          sandboxBestResult?.bestEntry ?? null,
          sandboxBestResult?.isNewBest ?? false
        );

        const gameEndedEvent: GameEndedEvent = {
          type: 'gameEnded',
          modeId,
          score: this.gameState.getScore(),
          playedSeconds: elapsedSeconds,
          blocksPopped: this.gameState.getBlocksPopped(),
          largestCluster: this.gameState.getLargestCluster(),
          runContext: activeRunContext
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
    this.scoreBoard.update(this.activeRunContext?.modeId ?? this.settings.modeId);
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

      const activeModeId = this.activeRunContext?.modeId ?? this.settings.modeId;
      if (activeModeId === 'precision') {
        const selectedClusterSize = this.gameState.getNumBlocksToPop();
        if (selectedClusterSize === this.gameState.getPrecisionTargetSize()) {
          const multiplier = this.gameState.getPrecisionHitMultiplier();
          const popped = this.gameState.doPop({ scoreMultiplier: multiplier });
          if (popped > 0) {
            this.gameState.recordPrecisionExactHit();
          }
        } else {
          this.gameState.recordPrecisionMiss();
          this.gameState.updateSelection({ row: -1, col: -1 });
          this.gameState.clearSelectionTarget();
          this.gameState.blocksDirty = true;
        }
        this.precisionNeedsNewTarget = true;
      } else if (activeModeId === 'cascade') {
        this.gameState.startCascadeTurn();
        const popped = this.gameState.doPop();
        if (popped > 0) {
          this.gameState.recordCascadeWave(popped, 1);
          this.cascadeAutoWaveMinClusterSize = Math.max(CASCADE_AUTO_WAVE_MIN_CLUSTER_SIZE, popped);
          this.cascadeAutoWavePending = true;
        } else {
          this.cascadeAutoWaveMinClusterSize = CASCADE_AUTO_WAVE_MIN_CLUSTER_SIZE;
          this.cascadeAutoWavePending = false;
        }
      } else {
        this.gameState.doPop();
      }

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
        this.returnToModeSelect();
      }
    );

    this.page.ui.addApplySettingsListener(() => {
      this.startNewGameFromUI();
    });

    this.page.ui.addResetSettingsListener(() => {
      this.settingsPresenter.resetToDefaults();
      this.setAudioState();
      this.gameState.blocksDirty = true;
    });

    this.page.addPlayAgainClickListener(() => {
      this.returnToModeSelect();
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
      this.prefs.isMusicEnabled = this.page.ui.getTogMusic();
      this.prefs.save();
      this.setAudioState();
    });

    this.page.ui.addTogSoundClickListener(() => {
      this.prefs.isSoundEnabled = this.page.ui.getTogSound();
      this.prefs.save();
      this.setAudioState();
    });

    this.page.ui.addInputColorsInputListener(() => {
      const colors: string[] = [];
      this.page.ui.getInputColors(colors);
      this.prefs.blockColors = colors;
      this.prefs.save();
      this.settings.numBlockTypes = colors.length;
      this.gameState.blocksDirty = true;
    });

    this.page.ui.addInputBlockStyleListener(() => {
      this.prefs.blockStyle = this.page.ui.getInputBlockStyle();
      this.prefs.save();
      this.gameState.blocksDirty = true;
    });
  }

  private startNewGameFromUI (): void {
    this.settingsPresenter.uiToSettings();
    this.prefs.ensureBlockColorCapacity(this.settings.numBlockTypes);
    this.newGame();
  }

  private returnToModeSelect (): void {
    if (!this.hasShownGameOverSummary) {
      this.serialize();
    }
    this.gameLoopManager.stop();
    this.page.setSessionUIState('modeSelect');
  }

  private setAudioState (): void {
    this.audioController.applySettings(this.prefs.isMusicEnabled, this.prefs.isSoundEnabled);
  }

  private getClockText (): string {
    const t = this.gameState.getPlayedDuration();
    const h = t.hours > 0 ? `${t.hours}:` : '';
    const m = t.minutes.toString().padStart(2, '0');
    const s = t.seconds.toString().padStart(2, '0');
    return `${h}${m}:${s}`;
  }

  private resetTimedNoMovesFastForward (): void {
    this.timedNoMovesFastForwardStartTime = null;
    this.timedNoMovesFastForwardStartElapsedSeconds = 0;
    this.timedNoMovesBonusAwarded = false;
  }

  private advanceTimedNoMovesFastForward (modeId: string, hasMoreMoves: boolean, isGameOver: boolean): boolean {
    if (modeId !== 'timed' || hasMoreMoves || !isGameOver) {
      return false;
    }

    const elapsedSeconds = this.gameState.getPlayedDurationSeconds();
    if (elapsedSeconds >= TIMED_MODE_DURATION_SECONDS) {
      return false;
    }

    if (!this.timedNoMovesBonusAwarded) {
      const remainingSeconds = TIMED_MODE_DURATION_SECONDS - elapsedSeconds;
      this.gameState.addScore(remainingSeconds * TIMED_NO_MOVES_BONUS_POINTS_PER_SECOND);
      this.timedNoMovesBonusAwarded = true;
    }

    if (this.timedNoMovesFastForwardStartTime === null) {
      this.timedNoMovesFastForwardStartTime = performance.now();
      this.timedNoMovesFastForwardStartElapsedSeconds = elapsedSeconds;
    }

    const elapsedMs = performance.now() - this.timedNoMovesFastForwardStartTime;
    const progress = Math.min(1, elapsedMs / TIMED_NO_MOVES_FAST_FORWARD_DURATION_MS);
    const remainingAtStart = TIMED_MODE_DURATION_SECONDS - this.timedNoMovesFastForwardStartElapsedSeconds;
    const advancedSeconds = Math.ceil(remainingAtStart * progress);
    const fastForwardElapsed = this.timedNoMovesFastForwardStartElapsedSeconds + advancedSeconds;
    this.gameState.setPlayedDurationSeconds(Math.min(TIMED_MODE_DURATION_SECONDS, fastForwardElapsed));

    // Keep HUD timer responsive while the quick countdown completes.
    this.scoreBoard.update(modeId);
    return progress < 1;
  }

  private assignNextPrecisionTarget (availableSizes?: number[]): void {
    const sizes = availableSizes ?? this.gameState.getAvailableClusterSizes();
    if (sizes.length === 0) {
      this.gameState.setPrecisionTargetSize(2);
      return;
    }

    const nextIndex = (this.gameState.getTotalMoves() + this.gameState.getPrecisionStrikes() + this.gameState.getPrecisionStreak()) % sizes.length;
    this.gameState.setPrecisionTargetSize(sizes[nextIndex]);
  }

  private ensurePrecisionTargetAvailable (forceReselect: boolean): void {
    const availableSizes = this.gameState.getAvailableClusterSizes();
    if (availableSizes.length === 0) {
      this.gameState.setPrecisionTargetSize(2);
      return;
    }

    const currentTarget = this.gameState.getPrecisionTargetSize();
    if (!forceReselect && availableSizes.includes(currentTarget)) {
      return;
    }

    this.assignNextPrecisionTarget(availableSizes);
  }

  serialize (): void {
    const activeRunContext = this.activeRunContext ?? {
      modeId: this.settings.modeId,
      source: this.runSource,
      setup: this.getRunSetup()
    };
    const isRunOver = this.hasShownGameOverSummary || shouldEndGameForMode(activeRunContext.modeId, this.gameState, this.gameState.hasMoreMoves());
    if (isRunOver) {
      this.sessionStorage.clear();
      return;
    }
    this.sessionStorage.save(this.gameState.serialize(), this.settings.serialize());
  }

  deserialize (): void {
    const snapshot = this.sessionStorage.load();
    if (snapshot === null) {
      return;
    }

    this.settings.deserialize(snapshot.settings as Parameters<typeof this.settings.deserialize>[0]);
    this.settingsPresenter.settingsToUI();
    this.gameState.setGravityDirection(this.getGravityDirectionForMode(this.settings.modeId));
    this.gameState.deserialize(snapshot.state as Parameters<typeof this.gameState.deserialize>[0]);
    this.resetTimedNoMovesFastForward();
    if (this.settings.modeId === 'precision') {
      this.ensurePrecisionTargetAvailable(false);
    }
    this.scoreBoard.update(this.settings.modeId);
    this.setAudioState();
    this.renderer.adjustCanvasSize(this.page.getCanvasSizeConstraints());
    this.page.resize();
  }
}

export default GameCoordinator;
