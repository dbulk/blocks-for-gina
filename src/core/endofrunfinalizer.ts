import { isCompetitiveMode } from '@/core/moderegistry';
import GameEventBus from '@/events/eventbus';
import SessionStorage from '@/persistence/sessionstorage';
import LocalHighScores, { LocalSandboxBest, type HighScoreEntry } from '@/persistence/highscores';
import type GameState from '@/core/gamestate';
import type { GameEndedEvent, RunContext } from '@/events/events';

interface EndOfRunView {
  setSessionUIState: (state: 'gameOverSummary') => void
  setGameOverSummary: (
    modeId: string,
    score: number,
    time: string,
    blocksPopped: number,
    blocksRemaining: number,
    largestCluster: number,
    totalMoves: number,
    highScores: HighScoreEntry[],
    rank: number | null,
    sandboxBest: HighScoreEntry | null,
    isNewSandboxBest: boolean
  ) => void
}

interface EndOfRunFinalizerDependencies {
  eventBus: GameEventBus
  highScores: LocalHighScores
  sandboxBest: LocalSandboxBest
  sessionStorage: SessionStorage
  page: EndOfRunView
  now?: () => number
}

interface FinalizeRunInput {
  modeId: string
  runContext: RunContext
  gameState: GameState
  clockText: string
}

class EndOfRunFinalizer {
  private readonly eventBus: GameEventBus;
  private readonly highScores: LocalHighScores;
  private readonly sandboxBest: LocalSandboxBest;
  private readonly sessionStorage: SessionStorage;
  private readonly page: EndOfRunView;
  private readonly now: () => number;

  constructor (dependencies: EndOfRunFinalizerDependencies) {
    this.eventBus = dependencies.eventBus;
    this.highScores = dependencies.highScores;
    this.sandboxBest = dependencies.sandboxBest;
    this.sessionStorage = dependencies.sessionStorage;
    this.page = dependencies.page;
    this.now = dependencies.now ?? Date.now;
  }

  finalize (input: FinalizeRunInput): void {
    const { modeId, runContext, gameState, clockText } = input;
    const playedTime = gameState.getPlayedDuration();
    const elapsedSeconds = playedTime.hours * 3600 + playedTime.minutes * 60 + playedTime.seconds;
    const entry: HighScoreEntry = {
      score: gameState.getScore(),
      elapsedSeconds,
      rows: runContext.setup.numRows,
      columns: runContext.setup.numColumns,
      playedAt: this.now()
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
      gameState.getScore(),
      clockText,
      gameState.getBlocksPopped(),
      gameState.getNumBlocksRemaining(),
      gameState.getLargestCluster(),
      gameState.getTotalMoves(),
      recordResult.topEntries,
      recordResult.rank,
      sandboxBestResult?.bestEntry ?? null,
      sandboxBestResult?.isNewBest ?? false
    );

    const gameEndedEvent: GameEndedEvent = {
      type: 'gameEnded',
      modeId,
      score: gameState.getScore(),
      playedSeconds: elapsedSeconds,
      blocksPopped: gameState.getBlocksPopped(),
      largestCluster: gameState.getLargestCluster(),
      runContext
    };
    this.eventBus.emit('gameEnded', gameEndedEvent);
  }
}

export default EndOfRunFinalizer;