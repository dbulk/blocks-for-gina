type RunSource = 'modeSelect' | 'sandboxSetup' | 'resume';

interface RunSetup {
  numRows: number
  numColumns: number
  numBlockTypes: number
  clusterStrength: number
}

interface RunContext {
  modeId: string
  source: RunSource
  setup: RunSetup
}

interface GameStartedEvent {
  type: 'gameStarted'
  rows: number
  columns: number
  blockTypes: number
  modeId: string
  runContext: RunContext
}

interface BlocksPoppedEvent {
  type: 'blocksPopped'
  clusterSize: number
  totalScore: number
  remainingBlocks: number
}

interface GameEndedEvent {
  type: 'gameEnded'
  modeId: string
  score: number
  playedSeconds: number
  blocksPopped: number
  largestCluster: number
  runContext: RunContext
}

interface ModeSelectedEvent {
  type: 'modeSelected'
  modeId: string
}

interface ModeRulesAppliedEvent {
  type: 'modeRulesApplied'
  modeId: string
  runContext: RunContext
}

type GameEvent = GameStartedEvent | BlocksPoppedEvent | GameEndedEvent | ModeSelectedEvent | ModeRulesAppliedEvent;

interface GameEventByType {
  gameStarted: GameStartedEvent
  blocksPopped: BlocksPoppedEvent
  gameEnded: GameEndedEvent
  modeSelected: ModeSelectedEvent
  modeRulesApplied: ModeRulesAppliedEvent
}

type GameEventType = keyof GameEventByType;

export type {
  GameStartedEvent,
  BlocksPoppedEvent,
  GameEndedEvent,
  ModeSelectedEvent,
  ModeRulesAppliedEvent,
  RunSource,
  RunSetup,
  RunContext,
  GameEvent,
  GameEventByType,
  GameEventType
};
