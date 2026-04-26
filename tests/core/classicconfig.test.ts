// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import GameCoordinator from '@/core/gamecoordinator';
import GameSettings from '@/core/gamesettings';
import GameEventBus from '@/events/eventbus';
import { CLASSIC_RUN_CONFIG } from '@/core/classicconfig';
import type { GameStartedEvent } from '@/events/events';

const createCoordinator = (settings: GameSettings, bus: GameEventBus): { coordinator: GameCoordinator, canvas: HTMLCanvasElement } => {
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

describe('#classic-default-config', () => {
  it('CLASSIC_RUN_CONFIG values are within valid board bounds', () => {
    expect(CLASSIC_RUN_CONFIG.numRows).toBeGreaterThanOrEqual(5);
    expect(CLASSIC_RUN_CONFIG.numRows).toBeLessThanOrEqual(100);
    expect(CLASSIC_RUN_CONFIG.numColumns).toBeGreaterThanOrEqual(5);
    expect(CLASSIC_RUN_CONFIG.numColumns).toBeLessThanOrEqual(100);
    expect(CLASSIC_RUN_CONFIG.numBlockTypes).toBeGreaterThanOrEqual(2);
    expect(CLASSIC_RUN_CONFIG.numBlockTypes).toBeLessThanOrEqual(8);
    expect(CLASSIC_RUN_CONFIG.clusterStrength).toBeGreaterThanOrEqual(0);
    expect(CLASSIC_RUN_CONFIG.clusterStrength).toBeLessThanOrEqual(1);
  });

  it('classic start emits gameStarted with CLASSIC_RUN_CONFIG values regardless of settings', () => {
    const bus = new GameEventBus();
    const settings = new GameSettings();
    settings.modeId = 'classic';
    settings.numRows = 99;
    settings.numColumns = 99;
    settings.numBlockTypes = 8;
    settings.clusterStrength = 0.9;

    let captured: GameStartedEvent | undefined;
    bus.on('gameStarted', (event) => { captured = event as GameStartedEvent; });

    createCoordinator(settings, bus);

    expect(captured).toBeDefined();
    expect(captured!.rows).toBe(CLASSIC_RUN_CONFIG.numRows);
    expect(captured!.columns).toBe(CLASSIC_RUN_CONFIG.numColumns);
    expect(captured!.blockTypes).toBe(CLASSIC_RUN_CONFIG.numBlockTypes);
    expect(captured!.modeId).toBe('classic');
    expect(captured!.runContext).toMatchObject({
      modeId: 'classic',
      source: 'modeSelect',
      setup: CLASSIC_RUN_CONFIG
    });
  });

  it('non-classic start emits gameStarted with settings values, not classic config', () => {
    const bus = new GameEventBus();
    const settings = new GameSettings();
    settings.modeId = 'sandbox';
    settings.numRows = 7;
    settings.numColumns = 15;
    settings.numBlockTypes = 3;

    let captured: GameStartedEvent | undefined;
    bus.on('gameStarted', (event) => { captured = event as GameStartedEvent; });

    createCoordinator(settings, bus);

    expect(captured).toBeDefined();
    expect(captured!.rows).toBe(7);
    expect(captured!.columns).toBe(15);
    expect(captured!.blockTypes).toBe(3);
    expect(captured!.modeId).toBe('sandbox');
    expect(captured!.runContext).toMatchObject({
      modeId: 'sandbox',
      source: 'modeSelect',
      setup: {
        numRows: 7,
        numColumns: 15,
        numBlockTypes: 3,
        clusterStrength: settings.clusterStrength
      }
    });
    expect(captured!.rows).not.toBe(CLASSIC_RUN_CONFIG.numRows);
    expect(captured!.columns).not.toBe(CLASSIC_RUN_CONFIG.numColumns);
    expect(captured!.blockTypes).not.toBe(CLASSIC_RUN_CONFIG.numBlockTypes);
  });

  it('classic game-over persistence uses active run setup rather than mutable settings', () => {
    const canvas = document.createElement('canvas');
    const record = vi.fn(() => ({ rank: null, topEntries: [] }));

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
    settings.modeId = 'classic';
    settings.numRows = 99;
    settings.numColumns = 99;

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
      griddata: [[1]],
      score: 10,
      serializedGameDuration: 0,
      totalMoves: 0,
      largestCluster: 1,
      blocksPopped: 0
    });

    (coordinator as unknown as { gameLoop: () => void }).gameLoop();

    expect(record).toHaveBeenCalledWith(expect.objectContaining({
      rows: CLASSIC_RUN_CONFIG.numRows,
      columns: CLASSIC_RUN_CONFIG.numColumns
    }), 'classic');
  });
});