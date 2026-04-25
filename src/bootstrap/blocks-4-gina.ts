import HTMLInterface from '@/presentation/htmlinterface';
import GameRunner from '@/core/gamerunner';
import GameSettings from '@/core/gamesettings';
import UserPreferences from '@/core/userpreferences';
import PreferencesPresenter from '@/presentation/preferencespresenter';
import { createDefaultModeRegistry } from '@/core/moderegistry';
import SettingsPresenter from '@/presentation/settingspresenter';
import Renderer from '@/rendering/renderer';
import SessionStorage from '@/persistence/sessionstorage';

class Blocks4Gina extends HTMLElement {
  connectedCallback (): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const page = new HTMLInterface(shadow);
    const canvas = page.canvas;
    const ui = page.ui;
    const modeRegistry = createDefaultModeRegistry();
    page.setAvailableModes(modeRegistry.list());
    const gameSettings = new GameSettings();
    const prefs = new UserPreferences();
    const settingsPresenter = new SettingsPresenter(gameSettings, ui);
    const prefsPresenter = new PreferencesPresenter(prefs, ui);
    settingsPresenter.settingsToUI();
    prefsPresenter.prefsToUI();
    const renderer = new Renderer(canvas, gameSettings, prefs);
    const resizeLayout = (): void => {
      renderer.adjustCanvasSize(page.getCanvasSizeConstraints());
      page.resize();
    };
    window.addEventListener('resize', resizeLayout);
    resizeLayout();
    page.resize();

    const sessionStorage = new SessionStorage();

    const refreshResumeButton = (): void => {
      const savedModeId = sessionStorage.getSavedModeId();
      const hasSave = sessionStorage.hasSavedGame();
      page.setResumeVisible(hasSave, savedModeId ?? undefined);
    };

    refreshResumeButton();

    page.addModeSelectShownListener(refreshResumeButton);

    const startNewGame = (modeId: string): void => {
      gameSettings.modeId = modeId;
      page.setSessionUIState('inGame');
      new GameRunner(renderer, gameSettings, prefs, settingsPresenter, page, { skipSessionRestore: true });
    };

    const resumeGame = (): void => {
      const savedModeId = sessionStorage.getSavedModeId() ?? 'arcade';
      gameSettings.modeId = savedModeId;
      page.setSessionUIState('inGame');
      new GameRunner(renderer, gameSettings, prefs, settingsPresenter, page, { skipSessionRestore: false });
    };

    page.addResumeClickListener(() => {
      resumeGame();
    });

    page.addModeSelectListener((modeId: string) => {
      if (modeId === 'sandbox') {
        page.setSessionUIState('sandboxSetup');
      } else {
        startNewGame(modeId);
      }
    });

    page.addSandboxStartListener((config) => {
      gameSettings.numRows = config.numRows;
      gameSettings.numColumns = config.numColumns;
      gameSettings.numBlockTypes = config.numBlockTypes;
      gameSettings.clusterStrength = config.clusterStrength;
      prefs.ensureBlockColorCapacity(config.numBlockTypes);
      startNewGame('sandbox');
    });

    page.addSandboxBackListener(() => {
      page.setSessionUIState('modeSelect');
    });
  }
}

customElements.define('blocks-4-gina', Blocks4Gina);
