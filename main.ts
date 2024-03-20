import Renderer from "./renderer.js";
import GameSettings from "./gamesettings.js";
import GameBoard from "./gameboard.js"


// Get the canvas element
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

async function main() {
  const settingsFilePath = "./settings.json";
  const gameSettings = new GameSettings();
  await gameSettings.loadSettings(settingsFilePath);

  const gameBoard = new GameBoard(gameSettings);

  function updateGame() {
    // Update game state (if needed)
    // Handle block movement after flood fill
    //   for (let col = 0; col < gameSettings.numColumns; col++) {
    //     // Move blocks down if there's a null underneath
    //     for (let row = gameSettings.numRows - 2; row >= 0; row--) {
    //       if (grid[row][col] !== null && grid[row + 1][col] === null) {
    //         // Move the block down
    //         grid[row + 1][col] = grid[row][col];
    //         grid[row][col] = null;
    //       }
    //     }
    //   }
    //   // Accumulate the number of moves needed to shift blocks left
    //   const numMovesToLeft: number[] = new Array(gameSettings.numColumns).fill(0);
    //   for (let col = gameSettings.numColumns - 1; col >= 0; col--) {
    //     if (numBlocksInColumn[col] === 0) {
    //       // Count the number of blocks to the right that need to move left
    //       for (
    //         let moveCol = col + 1;
    //         moveCol < gameSettings.numColumns;
    //         moveCol++
    //       ) {
    //         numMovesToLeft[moveCol]++;
    //       }
    //     }
    //   }
    //   for (let col = 0; col < gameSettings.numColumns; col++) {
    //     if (numMovesToLeft[col]) {
    //       for (let row = 0; row < gameSettings.numRows; row++) {
    //         grid[row][col - numMovesToLeft[col]] = grid[row][col];
    //         grid[row][col] = null;
    //       }
    //       numBlocksInColumn[col - numMovesToLeft[col]] = numBlocksInColumn[col];
    //       numBlocksInColumn[col] = 0;
    //     }
    //   }
  }

  const renderer = new Renderer(canvas, gameBoard.grid, gameSettings);

  function handleMouseClick(event: MouseEvent) {
    // Get mouse coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Convert mouse coordinates to grid indices
    const [clickedRow, clickedCol] = renderer.getGridIndicesFromMouse(
      mouseX,
      mouseY
    );

    gameBoard.click(clickedRow, clickedCol);
  }  
  canvas.addEventListener("click", handleMouseClick);

  function gameLoop() {
    gameBoard.update();
    // Update phase
    //updateGame();

    // Render phase
    // renderGame();
    renderer.renderBlocks();

    // Schedule the next iteration of the game loop
    requestAnimationFrame(gameLoop);
  }

  // Start the game loop
  gameLoop();
}

main();
