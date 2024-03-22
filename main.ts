import Renderer from "./renderer.js";
import GameSettings from "./gamesettings.js";
import GameBoard from "./gameboard.js"


// todo:
/// cleanups:
///   concerns...
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
/// scoreboard update out of render
/// game settings on web
/// new game button
/// ability to save and load state
/// game history in cookies, settings in cookies, last game in cookies?
/// minify
/// undo/redo?
/// FR tracking
/// adjust score algo
/// add clock
/// sounds
/// make it a custom
interface elements {
  canvas: HTMLCanvasElement;
  ui: HTMLDivElement;
}
function setupPage(): (elements | null) {
  const divTarget = document.getElementById('Blocks4Gina');
  if (!divTarget) {
    console.error("no div for game found");
    return null;
  }

  const div = document.createElement('div');
  div.className = "blocks4Gina";
  const styleElement = document.createElement("style");
  styleElement.textContent = `  
  .blocks4Gina canvas {
    border: 1px solid;
  }
    
  .blocks4Gina button {
    background-color: #555;
    border: none;
    color: #fff;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .blocks4Gina button:hover {
    background-color: #777;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  .blocks4Gina button:active {
    background-color: #444;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  `;

  divTarget.style.display = "flex";
  divTarget.style.justifyContent = "center";
  divTarget.style.alignItems = "start";
  divTarget.style.height = "100%";


    document.head.appendChild(styleElement);
  (divTarget as HTMLElement).appendChild(div);

  const canvas = document.createElement('canvas');
  const ui = document.createElement('div');

  canvas.style.display = "block";
  ui.style.display = "block";

  div.appendChild(canvas);
  div.appendChild(ui);
  return { canvas, ui };
}

async function main(el: elements) {
  const canvas = el.canvas;
  const gameSettingsUI = el.ui;
  const settingsFilePath = "./settings.json";
  const gameSettings = new GameSettings(gameSettingsUI);
  await gameSettings.loadSettings(settingsFilePath);

  const gameBoard = new GameBoard(gameSettings);
  const renderer = new Renderer(canvas, gameBoard, gameSettings);

  canvas.addEventListener("click", gameBoard.click.bind(gameBoard));

  function handleMouseHover(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const [row, col] = renderer.getGridIndicesFromMouse(mouseX, mouseY);
    gameBoard.hover({ row, col })
  }
  canvas.addEventListener("mousemove", handleMouseHover);
  canvas.addEventListener("mouseleave", gameBoard.mouseExit.bind(gameBoard));

  const moverate = .1;
  function animationLoop(startTime: number) {
    const elapsedTime = performance.now() - startTime;
    renderer.renderBlocks();
    renderer.renderScoreBoard();

    const numSteps = Math.floor(elapsedTime * moverate);
    // increment startTime based on how much has been "used"
    startTime += numSteps / moverate;
    let turnItOff = false;
    for (let step = 0; step < numSteps; step++) {
      turnItOff = true;
      for (let r = 0; r < gameSettings.numRows; r++) {
        for (let c = 0; c < gameSettings.numColumns; c++) {
          gameBoard.offsetx[r][c] = Math.max(gameBoard.offsetx[r][c] - 0.1, 0);
          gameBoard.offsety[r][c] = Math.max(gameBoard.offsety[r][c] - 0.1, 0);
          if (gameBoard.offsetx[r][c] > 0 || gameBoard.offsety[r][c] > 0) {
            turnItOff = false;
          }
        }
      }
    }
    if (turnItOff) {
      gameBoard.doAnimation = false;
      gameBoard.blocksDirty = true;
    } else {
      requestAnimationFrame(() => animationLoop(startTime));
    }
  }

  function gameLoop() {
    gameBoard.update();

    if (gameBoard.doAnimation) {
      requestAnimationFrame(() => animationLoop(performance.now()));
    }

    if (gameBoard.blocksDirty) {
      renderer.renderBlocks();
      renderer.renderPreview(gameBoard.blocksToPop);
      renderer.renderScoreBoard();
      gameBoard.blocksDirty = false;
    }

    // Schedule the next iteration of the game loop
    requestAnimationFrame(gameLoop);
  }

  // Start the game loop
  gameLoop();
}

const el = setupPage();
if (el) {
  main(el);
}
