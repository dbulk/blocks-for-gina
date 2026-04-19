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
  }

  uiToSettings (): void {
    this.settings.numRows = this.ui.getInputRows();
    this.settings.numColumns = this.ui.getInputColumns();
    this.settings.clusterStrength = this.ui.getInputClusterStrength();
    this.settings.modeId = this.ui.getInputMode();
  }

  resetToDefaults (): void {
    this.settings.resetToDefaults();
    this.settingsToUI();
  }
}

export default SettingsPresenter;
