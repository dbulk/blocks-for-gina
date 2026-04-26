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
    setColorInputCount: () => {},
    setInputColors: () => {},
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
    sessionStorage: { save: () => {}, load: () => null, clear: () => {} },
    audioController: { applySettings: () => {}, playSoundEffect: () => {} },
    highScores: { record: () => ({ rank: null, topEntries: [] }) },
    autoStartLoop: false,
    attachBeforeUnloadListener: false
  };

  const userPreferences = {
    isMusicEnabled: true,
    isSoundEnabled: true,
    blockStyle: 'Classic',
    blockColors: ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'],
    ensureBlockColorCapacity: () => {}
  };

  const coordinator = new GameCoordinator(renderer as never, settings, userPreferences as never, settingsPresenter as never, page as never, dependencies as never);
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
    bus.emit('gameStarted', {
      type: 'gameStarted',
      rows: 10,
      columns: 20,
      blockTypes: 5,
      modeId: 'arcade',
      runContext: {
        modeId: 'arcade',
        source: 'modeSelect',
        setup: {
          numRows: 10,
          numColumns: 20,
          numBlockTypes: 5,
          clusterStrength: 0.2
        }
      }
    });

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
    expect(gameStarted).toMatchObject({
      type: 'gameStarted',
      modeId: 'timed',
      rows: 10,
      columns: 20,
      blockTypes: 5,
      runContext: {
        modeId: 'timed',
        source: 'modeSelect',
        setup: {
          numRows: 10,
          numColumns: 20,
          numBlockTypes: 5,
          clusterStrength: 0.2
        }
      }
    });
    expect(modeRulesApplied).toMatchObject({
      type: 'modeRulesApplied',
      modeId: 'timed',
      runContext: {
        modeId: 'timed',
        source: 'modeSelect'
      }
    });
    expect(blocksPopped).toMatchObject({ type: 'blocksPopped', clusterSize: 2 });
    expect(gameEnded).toMatchObject({
      type: 'gameEnded',
      modeId: 'timed',
      runContext: {
        modeId: 'timed',
        source: 'modeSelect'
      }
    });

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
      setColorInputCount: () => {},
      setInputColors: () => {},
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

    const userPreferences = {
      isMusicEnabled: true,
      isSoundEnabled: true,
      blockStyle: 'Classic',
      blockColors: ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'],
      ensureBlockColorCapacity: () => {}
    };

    const coordinator = new GameCoordinator(
      renderer as never,
      settings,
      userPreferences as never,
      settingsPresenter as never,
      page as never,
      {
        eventBus: new GameEventBus(),
        gameLoopManager: { start: () => {}, stop: () => {} } as never,
        sessionStorage: { save: () => {}, load: () => null, clear: () => {} } as never,
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

  it('routes the toolbar Home button back to mode select', () => {
    const canvas = document.createElement('canvas');
    const setSessionUIState = vi.fn();
    const save = vi.fn();
    let onNewGameClick: (() => void) | null = null;

    const renderer = {
      setGameState: () => {},
      adjustCanvasSize: () => {},
      renderBlocks: () => {},
      renderPreview: () => {},
      showGameOver: () => {},
      getGridIndicesFromClientPosition: () => ({ row: 0, col: 0 })
    };

    const ui = {
      setColorInputCount: () => {},
      setInputColors: () => {},
      setUndoEnabled: () => {},
      setRedoEnabled: () => {},
      addNewGameClickListener: (callback: () => void) => { onNewGameClick = callback; },
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
      setSessionUIState,
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
    settings.modeId = 'sandbox';

    const userPreferences = {
      isMusicEnabled: true,
      isSoundEnabled: true,
      blockStyle: 'Classic',
      blockColors: ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'],
      ensureBlockColorCapacity: () => {}
    };

    new GameCoordinator(
      renderer as never,
      settings,
      userPreferences as never,
      settingsPresenter as never,
      page as never,
      {
        eventBus: new GameEventBus(),
        gameLoopManager: { start: () => {}, stop: () => {} } as never,
        sessionStorage: { save, load: () => null, clear: () => {} } as never,
        audioController: { applySettings: () => {}, playSoundEffect: () => {} } as never,
        highScores: { record: () => ({ rank: null, topEntries: [] }) } as never,
        sandboxBest: { record: () => ({ bestEntry: null, isNewBest: false }) } as never,
        autoStartLoop: false,
        attachBeforeUnloadListener: false
      }
    );

    expect(onNewGameClick).not.toBeNull();
    onNewGameClick?.();

    expect(setSessionUIState).toHaveBeenCalledWith('modeSelect');
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ modeId: 'sandbox' }));
  });

  it('clears saved session when serialize is called after game over', () => {
    const canvas = document.createElement('canvas');
    const save = vi.fn();
    const clear = vi.fn();

    const renderer = {
      setGameState: () => {},
      adjustCanvasSize: () => {},
      renderBlocks: () => {},
      renderPreview: () => {},
      showGameOver: () => {},
      getGridIndicesFromClientPosition: () => ({ row: 0, col: 0 })
    };

    const ui = {
      setColorInputCount: () => {},
      setInputColors: () => {},
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
    settings.modeId = 'arcade';

    const userPreferences = {
      isMusicEnabled: true,
      isSoundEnabled: true,
      blockStyle: 'Classic',
      blockColors: ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'],
      ensureBlockColorCapacity: () => {}
    };

    const coordinator = new GameCoordinator(
      renderer as never,
      settings,
      userPreferences as never,
      settingsPresenter as never,
      page as never,
      {
        eventBus: new GameEventBus(),
        gameLoopManager: { start: () => {}, stop: () => {} } as never,
        sessionStorage: { save, load: () => null, clear } as never,
        audioController: { applySettings: () => {}, playSoundEffect: () => {} } as never,
        highScores: { record: () => ({ rank: null, topEntries: [] }) } as never,
        sandboxBest: { record: () => ({ bestEntry: null, isNewBest: false }) } as never,
        autoStartLoop: false,
        attachBeforeUnloadListener: false
      }
    );

    coordinator.gameState.deserialize({
      griddata: [
        [1, 2],
        [3, 4]
      ],
      score: 0,
      serializedGameDuration: 0,
      totalMoves: 0,
      largestCluster: 0,
      blocksPopped: 0
    });

    coordinator.serialize();

    expect(clear).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
  });

  it('updates timed HUD to 00:00 when the run ends', () => {
    const canvas = document.createElement('canvas');
    const render = vi.fn();

    const renderer = {
      setGameState: () => {},
      adjustCanvasSize: () => {},
      renderBlocks: () => {},
      renderPreview: () => {},
      showGameOver: () => {},
      getGridIndicesFromClientPosition: () => ({ row: 0, col: 0 })
    };

    const ui = {
      setColorInputCount: () => {},
      setInputColors: () => {},
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
      scoreDisplay: { render },
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
    settings.modeId = 'timed';

    const userPreferences = {
      isMusicEnabled: true,
      isSoundEnabled: true,
      blockStyle: 'Classic',
      blockColors: ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'],
      ensureBlockColorCapacity: () => {}
    };

    const coordinator = new GameCoordinator(
      renderer as never,
      settings,
      userPreferences as never,
      settingsPresenter as never,
      page as never,
      {
        eventBus: new GameEventBus(),
        gameLoopManager: { start: () => {}, stop: () => {} } as never,
        sessionStorage: { save: () => {}, load: () => null, clear: () => {} } as never,
        audioController: { applySettings: () => {}, playSoundEffect: () => {} } as never,
        highScores: { record: () => ({ rank: null, topEntries: [] }) } as never,
        sandboxBest: { record: () => ({ bestEntry: null, isNewBest: false }) } as never,
        autoStartLoop: false,
        attachBeforeUnloadListener: false
      }
    );

    coordinator.gameState.deserialize({
      griddata: [
        [1, 2],
        [3, 4]
      ],
      score: 0,
      serializedGameDuration: 60000,
      totalMoves: 0,
      largestCluster: 0,
      blocksPopped: 0
    });

    (coordinator as unknown as { gameLoop: () => void }).gameLoop();

    const lastMetrics = render.mock.calls[render.mock.calls.length - 1]?.[0] as Array<{ key: string, value: string, visible: boolean }>;
    const timeMetric = lastMetrics.find((m) => m.key === 'time');

    expect(timeMetric?.visible).toBe(true);
    expect(timeMetric?.value).toBe('00:00');
  });

  it('renders HUD metrics before measuring canvas constraints on startup', () => {
    const order: string[] = [];
    const canvas = document.createElement('canvas');

    const renderer = {
      setGameState: () => {},
      adjustCanvasSize: () => { order.push('adjustCanvasSize'); },
      renderBlocks: () => {},
      renderPreview: () => {},
      showGameOver: () => {},
      getGridIndicesFromClientPosition: () => ({ row: 0, col: 0 })
    };

    const ui = {
      setColorInputCount: () => {},
      setInputColors: () => {},
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
      scoreDisplay: { render: () => { order.push('scoreRender'); } },
      setSessionUIState: () => {},
      setGameOverSummary: () => {},
      getCanvasSizeConstraints: () => {
        order.push('measureConstraints');
        return { width: 400, height: 300 };
      },
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

    const userPreferences = {
      isMusicEnabled: true,
      isSoundEnabled: true,
      blockStyle: 'Classic',
      blockColors: ['#007B7F', '#FF6F61', '#4F86F7', '#B6D94C', '#8368F2'],
      ensureBlockColorCapacity: () => {}
    };

    new GameCoordinator(
      renderer as never,
      settings,
      userPreferences as never,
      settingsPresenter as never,
      page as never,
      {
        eventBus: new GameEventBus(),
        gameLoopManager: { start: () => {}, stop: () => {} } as never,
        sessionStorage: { save: () => {}, load: () => null, clear: () => {} } as never,
        audioController: { applySettings: () => {}, playSoundEffect: () => {} } as never,
        highScores: { record: () => ({ rank: null, topEntries: [] }) } as never,
        sandboxBest: { record: () => ({ bestEntry: null, isNewBest: false }) } as never,
        autoStartLoop: false,
        attachBeforeUnloadListener: false
      }
    );

    expect(order.indexOf('scoreRender')).toBeGreaterThanOrEqual(0);
    expect(order.indexOf('measureConstraints')).toBeGreaterThanOrEqual(0);
    expect(order.indexOf('scoreRender')).toBeLessThan(order.indexOf('measureConstraints'));
  });
});
