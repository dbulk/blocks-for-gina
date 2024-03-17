import Renderer from "./renderer.js";


// Get the canvas element
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

// constants for the dimensions
const numBlocksX = 20; // Number of blocks in X direction
const numBlocksY = 10; // Number of blocks in Y direction
let blockSize = 10;

// 2D array to store block colors
const blockColors: string[] = [
  "#007B7F",
  "#FF6F61",
  "#4F86F7",
  "#B6D94C",
  "#8368F2",
];

const grid: (number | null)[][] = [];
for (let row = 0; row < numBlocksY; row++) {
  grid[row] = [];
  for (let col = 0; col < numBlocksX; col++) {
    // Randomly assign a block identity to each grid cell
    const randomIdentity = Math.floor(Math.random() * blockColors.length);
    grid[row][col] = randomIdentity; // Set null for empty blocks
  }
}

const numBlocksInColumn: number[] = new Array(numBlocksX).fill(numBlocksY);

// Flood fill algorithm to nullify adjacent blocks of the same identity
function floodFill(row: number, col: number, targetIdentity: number) {
  // Check if current block is within grid bounds and has the target identity
  if (
    row < 0 ||
    row >= numBlocksY ||
    col < 0 ||
    col >= numBlocksX ||
    grid[row][col] !== targetIdentity
  ) {
    return;
  }

  // Nullify current block
  grid[row][col] = null;
  numBlocksInColumn[col]--;

  // Recursively flood fill adjacent blocks
  floodFill(row + 1, col, targetIdentity); // Down
  floodFill(row - 1, col, targetIdentity); // Up
  floodFill(row, col + 1, targetIdentity); // Right
  floodFill(row, col - 1, targetIdentity); // Left
}

function updateGame() {
  // Update game state (if needed)
  // Handle block movement after flood fill
  for (let col = 0; col < numBlocksX; col++) {
    // Move blocks down if there's a null underneath
    for (let row = numBlocksY - 2; row >= 0; row--) {
      if (grid[row][col] !== null && grid[row + 1][col] === null) {
        // Move the block down
        grid[row + 1][col] = grid[row][col];
        grid[row][col] = null;
      }
    }
  }

  // Accumulate the number of moves needed to shift blocks left
  const numMovesToLeft: number[] = new Array(numBlocksX).fill(0);
  for (let col = numBlocksX - 1; col >= 0; col--) {
    if (numBlocksInColumn[col] === 0) {
      // Count the number of blocks to the right that need to move left
      for (let moveCol = col + 1; moveCol < numBlocksX; moveCol++) {
        numMovesToLeft[moveCol]++;
      }
    }
  }

  for (let col = 0; col < numBlocksX; col++) {
    if (numMovesToLeft[col]) {
      for (let row = 0; row < numBlocksY; row++) {
        grid[row][col - numMovesToLeft[col]] = grid[row][col];
        grid[row][col] = null;
      }
      numBlocksInColumn[col - numMovesToLeft[col]] = numBlocksInColumn[col];
      numBlocksInColumn[col] = 0;
    }
  }
}


const renderer = new Renderer(canvas, blockSize, grid, numBlocksX, numBlocksY, blockColors);
renderer.adjustCanvasSize(numBlocksX, numBlocksY);
window.addEventListener("resize", () =>
renderer.adjustCanvasSize(numBlocksX, numBlocksY)
);

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

// Get identity of clicked block
const clickedIdentity = grid[clickedRow][clickedCol];
if (clickedIdentity !== null) {
    // Perform flood fill to nullify adjacent blocks of the same identity
    floodFill(clickedRow, clickedCol, clickedIdentity);
}
}
canvas.addEventListener("click", handleMouseClick);

function gameLoop() {
// Update phase
updateGame();

// Render phase
// renderGame();
renderer.renderGrid();

// Schedule the next iteration of the game loop
requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
