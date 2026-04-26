import { describe, expect, it } from 'vitest';
import GameSettings from '@/core/gamesettings';
import SettingsPresenter from '@/presentation/settingspresenter';

const makeUiStub = () => {
  const uiState = {
    rows: 10,
    columns: 20,
    clusterStrength: 0.2,
    modeId: 'classic',
    blockStyle: 'Classic',
    colors: ['#111111', '#222222'],
    music: true,
    sound: true
  };

  return {
    uiState,
    ui: {
      setInputRows: (value: number) => { uiState.rows = value; },
      setInputColumns: (value: number) => { uiState.columns = value; },
      setInputClusterStrength: (value: number) => { uiState.clusterStrength = value; },
      setInputMode: (value: string) => { uiState.modeId = value; },
      setInputBlockStyle: (value: string) => { uiState.blockStyle = value; },
      setInputColors: (value: string[]) => { uiState.colors = [...value]; },
      setTogMusic: (value: boolean) => { uiState.music = value; },
      setTogSound: (value: boolean) => { uiState.sound = value; },
      getInputRows: () => uiState.rows,
      getInputColumns: () => uiState.columns,
      getInputClusterStrength: () => uiState.clusterStrength,
      getInputMode: () => uiState.modeId,
      getInputBlockStyle: () => uiState.blockStyle,
      getInputColors: (output: string[]) => {
        output.length = 0;
        output.push(...uiState.colors);
      },
      getTogMusic: () => uiState.music,
      getTogSound: () => uiState.sound
    }
  };
};

describe('SettingsPresenter', () => {
  it('does not project run setup fields into the gameplay toolbar', () => {
    const settings = new GameSettings();
    settings.modeId = 'timed';
    const { uiState, ui } = makeUiStub();
    const presenter = new SettingsPresenter(settings, ui as never);

    presenter.settingsToUI();

    expect(uiState.modeId).toBe('classic');
    expect(uiState.rows).toBe(10);
  });

  it('does not pull run setup fields back out of the gameplay toolbar', () => {
    const settings = new GameSettings();
    const { ui, uiState } = makeUiStub();
    uiState.modeId = 'sprint';
    uiState.rows = 12;
    const presenter = new SettingsPresenter(settings, ui as never);

    presenter.uiToSettings();

    expect(settings.modeId).toBe('classic');
    expect(settings.numRows).toBe(10);
  });

  it('still resets the backing settings object to defaults', () => {
    const settings = new GameSettings();
    settings.modeId = 'sandbox';
    settings.numRows = 12;
    const { ui } = makeUiStub();
    const presenter = new SettingsPresenter(settings, ui as never);

    presenter.resetToDefaults();

    expect(settings.modeId).toBe('classic');
    expect(settings.numRows).toBe(10);
  });
});
