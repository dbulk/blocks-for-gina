import Renderer from "./renderer.js";
import GameSettings from "./gamesettings.js";

// Get the canvas element
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

const gameSettings = new GameSettings(10, 20, 10, [
  "#007B7F",
  "#FF6F61",
  "#4F86F7",
  "#B6D94C",
  "#8368F2",
]);

// new data structure:
//  We keep track of a list of blocks
//  Grid represents the index into blocks
//
//  blocks can be null
//
//  when we remove a block, we mark the grid location as null

interface Block {
  i: number;
  j: number;
  id: number;
}
const blocks: (Block | null)[] = [];
for (let row = 0; row < gameSettings.numBlocksY; row++) {
  for (let col = 0; col < gameSettings.numBlocksX; col++) {
    const randomIdentity = Math.floor(
      Math.random() * gameSettings.numBlockTypes
    );
    blocks.push({ i: row, j: col, id: randomIdentity });
  }
}

const grid: number[][] = [];
function updateGridFromBlocks() {
  for (let row = 0; row < gameSettings.numBlocksY; row++) {
    grid[row] = Array(gameSettings.numBlocksX).fill(null);
  }
  for (let i = 0; i < blocks.length; ++i) {
    const b = blocks[i];
    if (b) {
      grid[b.i][b.j] = i;
    }
  }
}

updateGridFromBlocks();

const numBlocksInColumn: number[] = new Array(gameSettings.numBlocksX).fill(
  gameSettings.numBlocksY
);

interface Coordnate {
  row: number;
  col: number;
}

function locationInGrid(row : number,col : number): boolean {
    return row >= 0 && row < gameSettings.numBlocksY && col >= 0 && col < gameSettings.numBlocksX;
}

function getFloodedCoordinates(
  row: number,
  col: number,
  target: number
): Coordnate[] {
  const coords: Coordnate[] = [];
  const visited: Set<string> = new Set();

  function fill(row: number, col: number): void {
    // Check if current block is within grid bounds and has the target identity
    const key = `${row},${col}`;

    if (!locationInGrid(row,col)) {
      return;
    }
    if(grid[row][col] === null || blocks[grid[row][col]] === null){
        return;
    }
    
    const nonNullBlock = blocks[grid[row][col]] as Block;
    if(nonNullBlock.id !== target || visited.has(key)) {
        return;
    }
    coords.push({ row, col });
    visited.add(key);
    fill(row + 1, col);
    fill(row - 1, col);
    fill(row, col + 1);
    fill(row, col - 1);
  }

  fill(row, col);
  return coords;
}

// // Flood fill algorithm to nullify adjacent blocks of the same identity
// function floodFill(row: number, col: number, targetIdentity: number) {
//   // Check if current block is within grid bounds and has the target identity
//   if (
//     row < 0 ||
//     row >= gameSettings.numBlocksY ||
//     col < 0 ||
//     col >= gameSettings.numBlocksX ||
//     grid[row][col] !== targetIdentity
//   ) {
//     return;
//   }

//   // Nullify current block
//   grid[row][col] = null;
//   numBlocksInColumn[col]--;

//   // Recursively flood fill adjacent blocks
//   floodFill(row + 1, col, targetIdentity); // Down
//   floodFill(row - 1, col, targetIdentity); // Up
//   floodFill(row, col + 1, targetIdentity); // Right
//   floodFill(row, col - 1, targetIdentity); // Left
// }

function updateGame() {
  // Update game state (if needed)
  // Handle block movement after flood fill
  //   for (let col = 0; col < gameSettings.numBlocksX; col++) {
  //     // Move blocks down if there's a null underneath
  //     for (let row = gameSettings.numBlocksY - 2; row >= 0; row--) {
  //       if (grid[row][col] !== null && grid[row + 1][col] === null) {
  //         // Move the block down
  //         grid[row + 1][col] = grid[row][col];
  //         grid[row][col] = null;
  //       }
  //     }
  //   }
  //   // Accumulate the number of moves needed to shift blocks left
  //   const numMovesToLeft: number[] = new Array(gameSettings.numBlocksX).fill(0);
  //   for (let col = gameSettings.numBlocksX - 1; col >= 0; col--) {
  //     if (numBlocksInColumn[col] === 0) {
  //       // Count the number of blocks to the right that need to move left
  //       for (
  //         let moveCol = col + 1;
  //         moveCol < gameSettings.numBlocksX;
  //         moveCol++
  //       ) {
  //         numMovesToLeft[moveCol]++;
  //       }
  //     }
  //   }
  //   for (let col = 0; col < gameSettings.numBlocksX; col++) {
  //     if (numMovesToLeft[col]) {
  //       for (let row = 0; row < gameSettings.numBlocksY; row++) {
  //         grid[row][col - numMovesToLeft[col]] = grid[row][col];
  //         grid[row][col] = null;
  //       }
  //       numBlocksInColumn[col - numMovesToLeft[col]] = numBlocksInColumn[col];
  //       numBlocksInColumn[col] = 0;
  //     }
  //   }
}

const renderer = new Renderer(canvas, blocks, gameSettings);

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
  const index = grid[clickedRow][clickedCol];
  if (index !== null && blocks[index] !== null) {

    const nonNullBlock = blocks[index] as Block;
    // Perform flood fill to nullify adjacent blocks of the same identity
    //floodFill(clickedRow, clickedCol, clickedIdentity);
    const coords = getFloodedCoordinates(
      clickedRow,
      clickedCol,
      nonNullBlock.id
    );

    for (const coord of coords) {
      const blockindex = grid[coord.row][coord.col];
      blocks[blockindex] = null;
      numBlocksInColumn[coord.col]--;
    }

    updateGridFromBlocks();
  }
}
canvas.addEventListener("click", handleMouseClick);

function gameLoop() {
  // Update phase
  updateGame();

  // Render phase
  // renderGame();
  renderer.renderBlocks();

  // Schedule the next iteration of the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
