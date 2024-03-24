import htmlInterface from "./htmlinterface.js";
import GameRunner from "./gamerunner.js";
import GameSettings from "./gamesettings.js";
import Renderer from "./renderer.js";

interface uinodes {
  div: HTMLDivElement;
  cmdNewGame: HTMLButtonElement;
  togMusic: HTMLButtonElement;
  togSound: HTMLButtonElement;
  expandButton: HTMLButtonElement;
  divSettings: HTMLDivElement;
  inputRows: HTMLInputElement;
  inputColumns: HTMLInputElement;
  inputClusterStrength: HTMLInputElement;
  inputColors: HTMLInputElement[];
}

// Set up the page:
function run(){
    const page = new htmlInterface();
    if(!page.isvalid) {
        return;
    }

    const canvas = page.canvas as HTMLCanvasElement;
    const ui = page.ui as uinodes;
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
/// make uinodes a class or at least put it somewhere so it's not c/p thrice
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
/// adjust score algo
/// add game played clock... (and serialize/deserialize it)... and consider introducing it into scoring algo
///
/// make it a custom element
/// game analysis