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
    const ui = page.ui;
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
// Todos:
//
// ** Cleanup **
// make uinodes a class or at least put it somewhere so it's not c/p
// cleanup of listener addition, own class or sep/concerns
// make it a custom element
// move scoreboard update out of renderer, cleanup
//
// ** New Features **
// undo/redo stack via serialized game state?
// add game played clock... (and serialize/deserialize it)...
// high scores somewhere
// game analysis
//
// ** Enhancements **
// Better canvas sizing to support tall layouts without scrolling
// Consider putting music buttons in settings
//
// ** Optimization
// minify
// optim render with blockdirty or column dirty...or even tiling
//
// ** Debug
// FR tracking
