import htmlInterface from "./htmlinterface.js";
import GameRunner from "./gamerunner.js";
import GameSettings from "./gamesettings.js";
import Renderer from "./renderer.js";

// Set up the page:
function run(){
    const page = new htmlInterface();
    if(!page.isvalid) {
        return;
    }

    const canvas = page.canvas as HTMLCanvasElement;
    const ui = page.ui as HTMLDivElement;
    const gameSettings = new GameSettings(ui);

    const renderer = new Renderer(canvas, gameSettings);
    
    window.addEventListener("resize",() => {
      renderer.adjustCanvasSize();
      page.resize();
    });
    renderer.adjustCanvasSize();
    page.resize();

    page.startButton.addEventListener("click", () => {
         page.showControls();
         page.hideStartButton();
         new GameRunner(renderer, gameSettings, page);
        }, {once: true});
}

run();

// todo:
/// scoreboard update out of render
/// game settings like grid and cluster strength
/// sound settings in serialized game state
/// undo/redo stack via serialized game state?
/// 
/// minify
/// FR tracking
///
/// adjust score algo
/// add game played clock... (and serialize/deserialize it)
///
/// make it a custom element
/// game analysis
