import HTMLInterface from '@/presentation/htmlinterface';
import GameRunner from '@/core/gamerunner';
import GameSettings from '@/core/gamesettings';
import Renderer from '@/rendering/renderer';

class Blocks4Gina extends HTMLElement {
  connectedCallback (): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const page = new HTMLInterface(shadow);
    const canvas = page.canvas;
    const ui = page.ui;
    const gameSettings = new GameSettings(ui);
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
      
      new GameRunner(renderer, gameSettings, page);
    });
  }
}

customElements.define('blocks-4-gina', Blocks4Gina);
