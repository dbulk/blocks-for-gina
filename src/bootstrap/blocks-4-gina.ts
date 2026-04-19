import HTMLInterface from '@/presentation/htmlinterface';
import GameRunner from '@/core/gamerunner';
import GameSettings from '@/core/gamesettings';
import { createDefaultModeRegistry } from '@/core/moderegistry';
import SettingsPresenter from '@/presentation/settingspresenter';
import Renderer from '@/rendering/renderer';

class Blocks4Gina extends HTMLElement {
  connectedCallback (): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const page = new HTMLInterface(shadow);
    const canvas = page.canvas;
    const ui = page.ui;
    const modeRegistry = createDefaultModeRegistry();
    ui.setAvailableModes(modeRegistry.list());
    const gameSettings = new GameSettings();
    const settingsPresenter = new SettingsPresenter(gameSettings, ui);
    settingsPresenter.settingsToUI();
    const renderer = new Renderer(canvas, gameSettings);
    const resizeLayout = (): void => {
      renderer.adjustCanvasSize(page.getCanvasSizeConstraints());
      page.resize();
    };
    window.addEventListener('resize', resizeLayout);
    resizeLayout();
    page.resize();
    page.addStartClickListener(() => {
      page.setSessionUIState('inGame');
      
      new GameRunner(renderer, gameSettings, settingsPresenter, page);
    });
  }
}

customElements.define('blocks-4-gina', Blocks4Gina);
