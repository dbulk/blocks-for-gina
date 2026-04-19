interface GameStartedEvent {
  type: 'gameStarted'
  rows: number
  columns: number
  blockTypes: number
}

interface BlocksPoppedEvent {
  type: 'blocksPopped'
  clusterSize: number
  totalScore: number
  remainingBlocks: number
}

interface GameEndedEvent {
  type: 'gameEnded'
  score: number
  playedSeconds: number
  blocksPopped: number
  largestCluster: number
}

interface ModeSelectedEvent {
  type: 'modeSelected'
  modeId: string
}

interface ModeRulesAppliedEvent {
  type: 'modeRulesApplied'
  modeId: string
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
  GameEvent,
  GameEventByType,
  GameEventType
};
