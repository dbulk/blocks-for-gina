// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import GameCoordinator from '@/core/gamecoordinator';
import GameSettings from '@/core/gamesettings';
import GameEventBus from '@/events/eventbus';
import { ARCADE_RUN_CONFIG } from '@/core/arcadeconfig';
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
    sessionStorage: { save: () => {}, load: () => null },
    audioController: { applySettings: () => {}, playSoundEffect: () => {} },
    highScores: { record: () => ({ rank: null, topEntries: [] }) },
    autoStartLoop: false,
    attachBeforeUnloadListener: false
  };

  const coordinator = new GameCoordinator(renderer as never, settings, {} as never, settingsPresenter as never, page as never, dependencies as never);
  return { coordinator, canvas };
};

describe('#arcade-default-config', () => {
  it('ARCADE_RUN_CONFIG values are within valid board bounds', () => {
    expect(ARCADE_RUN_CONFIG.numRows).toBeGreaterThanOrEqual(5);
    expect(ARCADE_RUN_CONFIG.numRows).toBeLessThanOrEqual(100);
    expect(ARCADE_RUN_CONFIG.numColumns).toBeGreaterThanOrEqual(5);
    expect(ARCADE_RUN_CONFIG.numColumns).toBeLessThanOrEqual(100);
    expect(ARCADE_RUN_CONFIG.numBlockTypes).toBeGreaterThanOrEqual(2);
    expect(ARCADE_RUN_CONFIG.numBlockTypes).toBeLessThanOrEqual(8);
    expect(ARCADE_RUN_CONFIG.clusterStrength).toBeGreaterThanOrEqual(0);
    expect(ARCADE_RUN_CONFIG.clusterStrength).toBeLessThanOrEqual(1);
  });

  it('arcade start emits gameStarted with ARCADE_RUN_CONFIG values regardless of settings', () => {
    const bus = new GameEventBus();
    const settings = new GameSettings();
    settings.modeId = 'arcade';
    // Mutate settings to unusual values to verify they are ignored
    settings.numRows = 99;
    settings.numColumns = 99;
    settings.numBlockTypes = 8;
    settings.clusterStrength = 0.9;

    let captured: GameStartedEvent | undefined;
    bus.on('gameStarted', (event) => { captured = event as GameStartedEvent; });

    createCoordinator(settings, bus);

    expect(captured).toBeDefined();
    expect(captured!.rows).toBe(ARCADE_RUN_CONFIG.numRows);
    expect(captured!.columns).toBe(ARCADE_RUN_CONFIG.numColumns);
    expect(captured!.blockTypes).toBe(ARCADE_RUN_CONFIG.numBlockTypes);
  });

  it('non-arcade start emits gameStarted with settings values, not arcade config', () => {
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
    // Verify it did NOT use arcade config (values differ from ARCADE_RUN_CONFIG)
    expect(captured!.rows).not.toBe(ARCADE_RUN_CONFIG.numRows);
    expect(captured!.columns).not.toBe(ARCADE_RUN_CONFIG.numColumns);
    expect(captured!.blockTypes).not.toBe(ARCADE_RUN_CONFIG.numBlockTypes);
  });
});
