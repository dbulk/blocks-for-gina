// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type SandboxConfig = {
  numRows: number
  numColumns: number
  numBlockTypes: number
  clusterStrength: number
};

const state = vi.hoisted(() => ({
  modeSelectListener: null as ((modeId: string) => void) | null,
  sandboxStartListener: null as ((config: SandboxConfig) => void) | null,
  sandboxBackListener: null as (() => void) | null,
  resumeClickListener: null as (() => void) | null,
  modeSelectShownListener: null as (() => void) | null,
  setSessionUIState: vi.fn<(value: string) => void>(),
  setResumeVisible: vi.fn<(visible: boolean, modeId?: string) => void>(),
  gameRunnerCtor: vi.fn<(...args: unknown[]) => void>(),
  session: {
    hasSave: false,
    savedModeId: null as string | null
  }
}));

vi.mock('@/core/gamerunner', () => ({
  default: class MockGameRunner {
    constructor (...args: unknown[]) {
      state.gameRunnerCtor(...args);
    }
  }
}));

vi.mock('@/presentation/settingspresenter', () => ({
  default: class MockSettingsPresenter {
    constructor () {}
    settingsToUI (): void {}
    uiToSettings (): void {}
    resetToDefaults (): void {}
  }
}));

vi.mock('@/presentation/preferencespresenter', () => ({
  default: class MockPreferencesPresenter {
    constructor () {}
    prefsToUI (): void {}
  }
}));

vi.mock('@/rendering/renderer', () => ({
  default: class MockRenderer {
    constructor () {}
    setGameState (): void {}
    adjustCanvasSize (): void {}
  }
}));

vi.mock('@/persistence/sessionstorage', () => ({
  default: class MockSessionStorage {
    hasSavedGame (): boolean {
      return state.session.hasSave;
    }

    getSavedModeId (): string | null {
      return state.session.savedModeId;
    }
  }
}));

vi.mock('@/presentation/htmlinterface', () => ({
  default: class MockHTMLInterface {
    canvas = document.createElement('canvas');
    ui = {
      setColorInputCount: () => {},
      setInputColors: () => {},
      addLayoutChangeListener: () => {}
    };
    scoreDisplay = { render: () => {} };

    constructor () {}

    setAvailableModes (): void {}

    getCanvasSizeConstraints (): { width: number, height: number } {
      return { width: 400, height: 300 };
    }

    resize (): void {}

    addLayoutChangeListener (): void {}

    setResumeVisible (visible: boolean, modeId?: string): void {
      state.setResumeVisible(visible, modeId);
    }

    addModeSelectShownListener (callback: () => void): void {
      state.modeSelectShownListener = callback;
    }

    addModeSelectListener (callback: (modeId: string) => void): void {
      state.modeSelectListener = callback;
    }

    addSandboxStartListener (callback: (config: SandboxConfig) => void): void {
      state.sandboxStartListener = callback;
    }

    addSandboxBackListener (callback: () => void): void {
      state.sandboxBackListener = callback;
    }

    addResumeClickListener (callback: () => void): void {
      state.resumeClickListener = callback;
    }

    setSessionUIState (value: string): void {
      state.setSessionUIState(value);
    }
  }
}));

describe('Blocks4Gina mode flow integration', () => {
  beforeAll(async () => {
    await import('@/bootstrap/blocks-4-gina');
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    state.modeSelectListener = null;
    state.sandboxStartListener = null;
    state.sandboxBackListener = null;
    state.resumeClickListener = null;
    state.modeSelectShownListener = null;
    state.setSessionUIState.mockReset();
    state.setResumeVisible.mockReset();
    state.gameRunnerCtor.mockReset();
    state.session.hasSave = false;
    state.session.savedModeId = null;
  });

  it('starts selected non-sandbox mode from mode select', () => {
    const element = document.createElement('blocks-4-gina');
    document.body.appendChild(element);

    expect(state.modeSelectListener).not.toBeNull();
    state.modeSelectListener?.('timed');

    expect(state.setSessionUIState).toHaveBeenCalledWith('inGame');
    expect(state.gameRunnerCtor).toHaveBeenCalledOnce();

    const [, gameSettings, , , , dependencies] = state.gameRunnerCtor.mock.calls[0];
    expect((gameSettings as { modeId: string }).modeId).toBe('timed');
    expect(dependencies).toMatchObject({ skipSessionRestore: true, runSource: 'modeSelect' });
  });

  it('routes sandbox mode through setup and starts sandbox run with setup source', () => {
    const element = document.createElement('blocks-4-gina');
    document.body.appendChild(element);

    state.modeSelectListener?.('sandbox');
    expect(state.setSessionUIState).toHaveBeenCalledWith('sandboxSetup');

    state.sandboxStartListener?.({ numRows: 8, numColumns: 12, numBlockTypes: 6, clusterStrength: 0.3 });

    expect(state.setSessionUIState).toHaveBeenCalledWith('inGame');
    expect(state.gameRunnerCtor).toHaveBeenCalledOnce();

    const [, gameSettings, , , , dependencies] = state.gameRunnerCtor.mock.calls[0];
    const settingsShape = gameSettings as { modeId: string, numRows: number, numColumns: number, numBlockTypes: number, clusterStrength: number };
    expect(settingsShape.modeId).toBe('sandbox');
    expect(settingsShape.numRows).toBe(8);
    expect(settingsShape.numColumns).toBe(12);
    expect(settingsShape.numBlockTypes).toBe(6);
    expect(settingsShape.clusterStrength).toBe(0.3);
    expect(dependencies).toMatchObject({ skipSessionRestore: true, runSource: 'sandboxSetup' });
  });

  it('resumes saved run using saved mode and resume source', () => {
    state.session.hasSave = true;
    state.session.savedModeId = 'sprint';

    const element = document.createElement('blocks-4-gina');
    document.body.appendChild(element);

    expect(state.setResumeVisible).toHaveBeenCalledWith(true, 'sprint');

    state.resumeClickListener?.();

    expect(state.setSessionUIState).toHaveBeenCalledWith('inGame');
    expect(state.gameRunnerCtor).toHaveBeenCalledOnce();

    const [, gameSettings, , , , dependencies] = state.gameRunnerCtor.mock.calls[0];
    expect((gameSettings as { modeId: string }).modeId).toBe('sprint');
    expect(dependencies).toMatchObject({ skipSessionRestore: false, runSource: 'resume' });
  });

  it('refreshes resume visibility when mode select is shown again', () => {
    const element = document.createElement('blocks-4-gina');
    document.body.appendChild(element);

    expect(state.setResumeVisible).toHaveBeenCalledWith(false, undefined);

    state.session.hasSave = true;
    state.session.savedModeId = 'timed';
    state.modeSelectShownListener?.();

    expect(state.setResumeVisible).toHaveBeenLastCalledWith(true, 'timed');
  });
});
