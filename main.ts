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
// todo:
/// could probably optimize render with blockdirty or column dirty...or even tiling
/// make uinodes a class or at least put it somewhere so it's not c/p
///
/// cleanup of listeners
/// scoreboard update out of render
/// undo/redo stack via serialized game state?
///
/// better canvas sizing to support tall layouts without scrolling
/// consider putting music buttons in settings
///
/// minify
/// FR tracking
///
/// add game played clock... (and serialize/deserialize it)... and consider introducing it into scoring algo
///
/// make it a custom element
/// game analysis