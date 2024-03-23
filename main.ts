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
// 0. 
// 1. Make a splash screen show up on load...
//  - it needs a start button
//  - the canvas should be 'sized'
//  - there should be credits
//  - everything should be loaded
//
// 2. Wire up the new game and sound buttons
//
// 3. Refactors
//
/// cleanups:
///   concerns...
///     gameRunner -
///         the main game loop, to distinguish from the menu and loader actions
///         
///     gameState - 
///       this has everything about the current state of the game and interfaces to manipulate the state
///       serializing/deserializing gameState should be sufficient to reload the game
///
///     renderer
///       this draws to onscreen and offscreen canvases
///       it holds no state
///       it might provide compute utilities for e.g. converting pixels to blockid?
///
///     io
///       user input, resize events etc. Just send them to state
///
///     settings
///       this holds settings for the game
///       it may also have utilities to create a ui for manipulating settings (i.e. there's a settings model and a setting control)
///
///     score? I think this should live in gameState
///
///     gamestyle - css
///
/// scoreboard update out of render
/// game settings on web
/// :: this got messy because css, consider using emotion or styled components or something for styling?
/// ability to save and load state
/// game history in cookies, settings in cookies, last game in cookies?
/// minify
/// undo/redo?
/// FR tracking
/// adjust score algo
/// add clock
/// make it a custom element
