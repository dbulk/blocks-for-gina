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

type GameEvent = GameStartedEvent | BlocksPoppedEvent | GameEndedEvent;

interface GameEventByType {
  gameStarted: GameStartedEvent
  blocksPopped: BlocksPoppedEvent
  gameEnded: GameEndedEvent
}

type GameEventType = keyof GameEventByType;

export type {
  GameStartedEvent,
  BlocksPoppedEvent,
  GameEndedEvent,
  GameEvent,
  GameEventByType,
  GameEventType
};
