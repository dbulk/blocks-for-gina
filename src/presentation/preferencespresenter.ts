import type UserPreferences from '@/core/userpreferences';
import type UINodes from '@/presentation/uinodes';

class PreferencesPresenter {
  private readonly prefs: UserPreferences;
  private readonly ui: UINodes;

  constructor (prefs: UserPreferences, ui: UINodes) {
    this.prefs = prefs;
    this.ui = ui;
  }

  prefsToUI (): void {
    this.ui.setInputBlockStyle(this.prefs.blockStyle);
    this.ui.setInputColors(this.prefs.blockColors);
    this.ui.setTogMusic(this.prefs.isMusicEnabled);
    this.ui.setTogSound(this.prefs.isSoundEnabled);
  }
}

export default PreferencesPresenter;
