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

  canvas.addEventListener("click", gameBoard.click.bind(gameBoard));

  function handleMouseHover(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const [row, col] = renderer.getGridIndicesFromMouse(mouseX, mouseY);
    gameBoard.hover({row,col})
  }
  canvas.addEventListener("mousemove", handleMouseHover);
  canvas.addEventListener("mouseleave", gameBoard.mouseExit.bind(gameBoard));

  function gameLoop() {
    gameBoard.update();
    
    renderer.renderBlocks();
    renderer.renderPreview(gameBoard.blocksToPop);
    renderer.renderScoreBoard();

    // Schedule the next iteration of the game loop
    requestAnimationFrame(gameLoop);
  }

  // Start the game loop
  gameLoop();
}

main();
