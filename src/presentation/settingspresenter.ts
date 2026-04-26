import type GameSettings from '@/core/gamesettings';
import type UINodes from '@/presentation/uinodes';

class SettingsPresenter {
  private readonly settings: GameSettings;

  constructor (settings: GameSettings, ui: UINodes) {
    this.settings = settings;
    void ui;
  }

  settingsToUI (): void {
  }

  uiToSettings (): void {
  }

  resetToDefaults (): void {
    this.settings.resetToDefaults();
    this.settingsToUI();
  }
}

export default SettingsPresenter;
