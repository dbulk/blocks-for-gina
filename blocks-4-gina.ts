import HTMLInterface from './htmlinterface.js';
import GameRunner from './gamerunner.js';
import GameSettings from './gamesettings.js';
import Renderer from './renderer.js';

class Blocks4Gina extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: "open"});
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
      
        page.startButton.addEventListener('click', () => {
          page.ui.setVisibility(true);
          page.hideStartButton();
          // eslint-disable-next-line no-new
          new GameRunner(renderer, gameSettings, page);
        }, { once: true });
    }
}


customElements.define("blocks-4-gina", Blocks4Gina);
