import HTMLInterface from './htmlinterface.js';
import GameRunner from './gamerunner.js';
import GameSettings from './gamesettings.js';
import Renderer from './renderer.js';

class Blocks4Gina extends HTMLElement {
  connectedCallback (): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const page = new HTMLInterface(shadow);
    const canvas = page.canvas;
    const ui = page.ui;
    const gameSettings = new GameSettings(ui);
    const renderer = new Renderer(canvas, gameSettings);
    window.addEventListener('resize', () => {
      renderer.adjustCanvasSize();
      page.resize();
    });
    renderer.adjustCanvasSize();
    page.resize();
    page.addStartClickListener(() => {
      page.setSessionUIState('inGame');
      
      new GameRunner(renderer, gameSettings, page);
    });
  }
}

customElements.define('blocks-4-gina', Blocks4Gina);
