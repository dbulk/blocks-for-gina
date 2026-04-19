import type GameSettings from '@/core/gamesettings';
import type UINodes from '@/presentation/uinodes';

class SettingsPresenter {
  private readonly settings: GameSettings;
  private readonly ui: UINodes;

  constructor (settings: GameSettings, ui: UINodes) {
    this.settings = settings;
    this.ui = ui;
  }

  settingsToUI (): void {
    this.ui.setInputRows(this.settings.numRows);
    this.ui.setInputColumns(this.settings.numColumns);
    this.ui.setInputClusterStrength(this.settings.clusterStrength);
    this.ui.setInputMode(this.settings.modeId);
    this.ui.setInputBlockStyle(this.settings.blockStyle);
    this.ui.setInputColors(this.settings.blockColors);
    this.ui.setTogMusic(this.settings.isMusicEnabled);
    this.ui.setTogSound(this.settings.isSoundEnabled);
  }

  uiToSettings (): void {
    this.settings.numRows = this.ui.getInputRows();
    this.settings.numColumns = this.ui.getInputColumns();
    this.settings.clusterStrength = this.ui.getInputClusterStrength();
    this.settings.modeId = this.ui.getInputMode();
    this.settings.blockStyle = this.ui.getInputBlockStyle();
  }

  uiColorsToSettings (): void {
    const colors: string[] = [];
    this.ui.getInputColors(colors);
    this.settings.blockColors = colors;
    this.settings.numBlockTypes = colors.length;
  }

  uiAllToSettings (): void {
    this.uiToSettings();
    this.uiColorsToSettings();
    this.syncAudioToSettings();
  }

  syncAudioToSettings (): void {
    this.settings.isMusicEnabled = this.ui.getTogMusic();
    this.settings.isSoundEnabled = this.ui.getTogSound();
  }

  resetToDefaults (): void {
    this.settings.resetToDefaults();
    this.settingsToUI();
  }
}

export default SettingsPresenter;
