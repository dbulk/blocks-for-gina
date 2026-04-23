// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import GameCoordinator from '@/core/gamecoordinator';
import GameSettings from '@/core/gamesettings';
import GameEventBus from '@/events/eventbus';
import type { GameEvent, GameEventType } from '@/events/events';

const ALL_EVENT_TYPES: GameEventType[] = [
  'modeSelected',
  'gameStarted',
  'modeRulesApplied',
  'blocksPopped',
  'gameEnded'
];

const captureEvents = (bus: GameEventBus): { sequence: GameEventType[], events: GameEvent[] } => {
  const sequence: GameEventType[] = [];
  const events: GameEvent[] = [];

  for (const type of ALL_EVENT_TYPES) {
    bus.on(type, (event) => {
      sequence.push(type);
      events.push(event);
    });
  }

  return { sequence, events };
};

const createCoordinator = (modeId: string, bus: GameEventBus): { coordinator: GameCoordinator, canvas: HTMLCanvasElement } => {
  const canvas = document.createElement('canvas');

  const renderer = {
    setGameState: () => {},
    adjustCanvasSize: () => {},
    renderBlocks: () => {},
    renderPreview: () => {},
    showGameOver: () => {},
    getGridIndicesFromClientPosition: () => ({ row: 0, col: 0 })
  };

  const ui = {
    setUndoEnabled: () => {},
    setRedoEnabled: () => {},
    addNewGameClickListener: () => {},
    addApplySettingsListener: () => {},
    addResetSettingsListener: () => {},
    addUndoListener: () => {},
    addRedoListener: () => {},
    addTogMusicClickListener: () => {},
    addTogSoundClickListener: () => {},
    addInputColorsInputListener: () => {},
    addInputBlockStyleListener: () => {}
  };

  const page = {
    canvas,
    ui,
    scoreDisplay: { render: () => {} },
    setSessionUIState: () => {},
    setGameOverSummary: () => {},
    getCanvasSizeConstraints: () => ({ width: 400, height: 300 }),
    resize: () => {},
    addPlayAgainClickListener: () => {}
  };

  const settingsPresenter = {
    resetToDefaults: () => {},
    uiAllToSettings: () => {},
    syncAudioToSettings: () => {},
    settingsToUI: () => {},
    uiColorsToSettings: () => {},
    uiToSettings: () => {}
  };

  const settings = new GameSettings();
  settings.modeId = modeId;

  const dependencies = {
    eventBus: bus,
    gameLoopManager: { start: () => {}, stop: () => {} },
    sessionStorage: { save: () => {}, load: () => null },
    audioController: { applySettings: () => {}, playSoundEffect: () => {} },
    highScores: { record: () => ({ rank: null, topEntries: [] }) },
    autoStartLoop: false,
    attachBeforeUnloadListener: false
  };

  const coordinator = new GameCoordinator(renderer as never, settings, {} as never, settingsPresenter as never, page as never, dependencies as never);
  return { coordinator, canvas };
};

const dispatchPointerUp = (canvas: HTMLCanvasElement): void => {
  const event = new Event('pointerup') as PointerEvent;
  Object.defineProperties(event, {
    clientX: { value: 4 },
    clientY: { value: 4 },
    pointerType: { value: 'mouse' }
  });
  canvas.dispatchEvent(event);
};

describe('GameCoordinator event sequencing', () => {
  it('captures event emissions in insertion order', () => {
    const bus = new GameEventBus();
    const capture = captureEvents(bus);

    bus.emit('modeSelected', { type: 'modeSelected', modeId: 'arcade' });
    bus.emit('gameStarted', { type: 'gameStarted', rows: 10, columns: 20, blockTypes: 5 });

    expect(capture.sequence).toEqual(['modeSelected', 'gameStarted']);
    expect(capture.events).toHaveLength(2);
  });

  it('emits canonical select->start->rules->score->end ordering', () => {
    const bus = new GameEventBus();
    const capture = captureEvents(bus);

    const { coordinator, canvas } = createCoordinator('timed', bus);

    coordinator.gameState.deserialize({
      griddata: [
        [1, 1],
        [2, 3]
      ],
      score: 0,
      serializedGameDuration: 180000,
      totalMoves: 0,
      largestCluster: 0,
      blocksPopped: 0
    });

    dispatchPointerUp(canvas);
    (coordinator as unknown as { gameLoop: () => void }).gameLoop();

    expect(capture.sequence).toEqual(['modeSelected', 'gameStarted', 'modeRulesApplied', 'blocksPopped', 'gameEnded']);
  });

  it('keeps startup event ordering stable across arcade and sandbox branches', () => {
    const arcadeBus = new GameEventBus();
    const arcadeCapture = captureEvents(arcadeBus);
    createCoordinator('arcade', arcadeBus);

    const sandboxBus = new GameEventBus();
    const sandboxCapture = captureEvents(sandboxBus);
    createCoordinator('sandbox', sandboxBus);

    expect(arcadeCapture.sequence.slice(0, 3)).toEqual(['modeSelected', 'gameStarted', 'modeRulesApplied']);
    expect(sandboxCapture.sequence.slice(0, 3)).toEqual(['modeSelected', 'gameStarted', 'modeRulesApplied']);
  });

  it('emits payloads with expected contract fields', () => {
    const bus = new GameEventBus();
    const capture = captureEvents(bus);

    const { coordinator, canvas } = createCoordinator('timed', bus);

    coordinator.gameState.deserialize({
      griddata: [
        [1, 1],
        [2, 3]
      ],
      score: 0,
      serializedGameDuration: 180000,
      totalMoves: 0,
      largestCluster: 0,
      blocksPopped: 0
    });

    dispatchPointerUp(canvas);
    (coordinator as unknown as { gameLoop: () => void }).gameLoop();

    const modeSelected = capture.events.find((event) => event.type === 'modeSelected');
    const gameStarted = capture.events.find((event) => event.type === 'gameStarted');
    const modeRulesApplied = capture.events.find((event) => event.type === 'modeRulesApplied');
    const blocksPopped = capture.events.find((event) => event.type === 'blocksPopped');
    const gameEnded = capture.events.find((event) => event.type === 'gameEnded');

    expect(modeSelected).toMatchObject({ type: 'modeSelected', modeId: 'timed' });
    expect(gameStarted).toMatchObject({ type: 'gameStarted', rows: 10, columns: 20, blockTypes: 5 });
    expect(modeRulesApplied).toMatchObject({ type: 'modeRulesApplied', modeId: 'timed' });
    expect(blocksPopped).toMatchObject({ type: 'blocksPopped', clusterSize: 2 });
    expect(gameEnded).toMatchObject({ type: 'gameEnded' });

    expect((blocksPopped as { totalScore: number }).totalScore).toBeGreaterThan(0);
    expect((blocksPopped as { remainingBlocks: number }).remainingBlocks).toBeGreaterThanOrEqual(0);
    expect((gameEnded as { score: number }).score).toBeGreaterThanOrEqual(0);
    expect((gameEnded as { playedSeconds: number }).playedSeconds).toBeGreaterThanOrEqual(180);
  });

  it('does not record ranked highscores for sandbox runs', () => {
    const canvas = document.createElement('canvas');
    const record = vi.fn(() => ({ rank: 1, topEntries: [{ score: 25, elapsedSeconds: 10, rows: 8, columns: 8, playedAt: 1 }] }));
    const setGameOverSummary = vi.fn();

    const renderer = {
      setGameState: () => {},
      adjustCanvasSize: () => {},
      renderBlocks: () => {},
      renderPreview: () => {},
      showGameOver: () => {},
      getGridIndicesFromClientPosition: () => ({ row: 0, col: 0 })
    };

    const ui = {
      setUndoEnabled: () => {},
      setRedoEnabled: () => {},
      addNewGameClickListener: () => {},
      addApplySettingsListener: () => {},
      addResetSettingsListener: () => {},
      addUndoListener: () => {},
      addRedoListener: () => {},
      addTogMusicClickListener: () => {},
      addTogSoundClickListener: () => {},
      addInputColorsInputListener: () => {},
      addInputBlockStyleListener: () => {}
    };

    const page = {
      canvas,
      ui,
      scoreDisplay: { render: () => {} },
      setSessionUIState: () => {},
      setGameOverSummary,
      getCanvasSizeConstraints: () => ({ width: 400, height: 300 }),
      resize: () => {},
      addPlayAgainClickListener: () => {}
    };

    const settingsPresenter = {
      resetToDefaults: () => {},
      uiAllToSettings: () => {},
      syncAudioToSettings: () => {},
      settingsToUI: () => {},
      uiColorsToSettings: () => {},
      uiToSettings: () => {}
    };

    const settings = new GameSettings();
    settings.modeId = 'sandbox';

    const coordinator = new GameCoordinator(
      renderer as never,
      settings,
      {} as never,
      settingsPresenter as never,
      page as never,
      {
        eventBus: new GameEventBus(),
        gameLoopManager: { start: () => {}, stop: () => {} } as never,
        sessionStorage: { save: () => {}, load: () => null } as never,
        audioController: { applySettings: () => {}, playSoundEffect: () => {} } as never,
        highScores: { record } as never,
        autoStartLoop: false,
        attachBeforeUnloadListener: false
      }
    );

    coordinator.gameState.deserialize({
      griddata: [
        [1, 1],
        [2, 3]
      ],
      score: 0,
      serializedGameDuration: 180000,
      totalMoves: 0,
      largestCluster: 0,
      blocksPopped: 0
    });

    dispatchPointerUp(canvas);
    (coordinator as unknown as { gameLoop: () => void }).gameLoop();

    expect(record).not.toHaveBeenCalled();
    expect(setGameOverSummary).toHaveBeenCalledWith(
      'sandbox',
      expect.any(Number),
      expect.any(String),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      [],
      null,
      expect.objectContaining({ score: expect.any(Number), rows: expect.any(Number), columns: expect.any(Number) }),
      true
    );
  });
});
