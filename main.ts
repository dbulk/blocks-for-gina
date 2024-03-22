import Renderer from "./renderer.js";
import GameSettings from "./gamesettings.js";
import GameBoard from "./gameboard.js"


// todo:
/// cleanups:
///   concerns...
///     game state
///     rendering
///     settings
///     score?
///
/// scoreboard update out of render
/// game settings on web
/// new game button
/// ability to save and load state
/// high score in cookies
/// minify
/// undo/redo?

interface coordinate {
  row: number;
  col: number;
}

// Get the canvas element
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

async function main() {
  const settingsFilePath = "./settings.json";
  const gameSettings = new GameSettings();
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

main();
