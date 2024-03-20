import Renderer from "./renderer.js";
import GameSettings from "./gamesettings.js";
import GameBoard from "./gameboard.js"

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
  const renderer = new Renderer(canvas, gameBoard.grid, gameSettings);

  function handleMouseClick(event: MouseEvent) {
    // Get mouse coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Convert mouse coordinates to grid indices
    const [row, col] = renderer.getGridIndicesFromMouse(
      mouseX,
      mouseY
    );

    gameBoard.click({row, col});
  }  
  canvas.addEventListener("click", handleMouseClick);

  const hoverCache: coordinate = {row: -1, col: -1};

  let previewBlocks : coordinate[] = [];
  function handleMouseHover(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const [row, col] = renderer.getGridIndicesFromMouse(mouseX, mouseY);
    if((row != hoverCache.row || col != hoverCache.col) && gameBoard.isLocationInGrid({row, col})) {
      const coords = gameBoard.getFloodedCoordinates({row,col});
      previewBlocks = coords.length > 1 ? coords : [];
      hoverCache.row = row;
      hoverCache.col = col;
    }
  }
  canvas.addEventListener("mousemove", handleMouseHover);

  function handleMouseExit(event:MouseEvent) {
    hoverCache.row = -1;
    hoverCache.col = -1;
  }
  canvas.addEventListener("mouseleave", handleMouseExit);

  function gameLoop() {
    gameBoard.update();
    // Update phase
    //updateGame();

    // Render phase
    // renderGame();
    renderer.renderBlocks();
    renderer.renderPreview(previewBlocks);

    // Schedule the next iteration of the game loop
    requestAnimationFrame(gameLoop);
  }

  // Start the game loop
  gameLoop();
}

main();
