// Get the canvas element
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

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
  // Add more colors as needed
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

// Set initial canvas size
adjustCanvasSize();

// Listen for window resize event
window.addEventListener("resize", adjustCanvasSize);

function adjustCanvasSize() {
  // Calculate new canvas width based on 50% of window width
  const windowWidth = window.innerWidth;
  const newCanvasWidth =
    Math.round((windowWidth * 0.8) / numBlocksX) * numBlocksX;

  // Set canvas size
  canvas.width = newCanvasWidth;
  const AR = numBlocksY / numBlocksX;
  canvas.height = canvas.width * AR; // Maintain square aspect ratio (optional)

  blockSize = canvas.width / numBlocksX;
  renderGame();
}

// Function to handle mouse click event
function handleMouseClick(event: MouseEvent) {
  // Get mouse coordinates relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Convert mouse coordinates to grid indices
  const clickedCol = Math.floor(mouseX / blockSize);
  const clickedRow = Math.floor(mouseY / blockSize);

  // Get identity of clicked block
  const clickedIdentity = grid[clickedRow][clickedCol];
  if (clickedIdentity !== null) {
    // Perform flood fill to nullify adjacent blocks of the same identity
    floodFill(clickedRow, clickedCol, clickedIdentity);
  }
}

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

// Add event listener for mouse clicks on the canvas
canvas.addEventListener("click", handleMouseClick);

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
function renderBlock(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(1, color); // Start color (specified color)
    gradient.addColorStop(0, lightenColor(color, 30)); // End color (lightened version of specified color)

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
}

function lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return "#" + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
}

function renderGame() {
  // Clear canvas
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Render game elements
  for (let row = 0; row < numBlocksY; row++) {
    for (let col = 0; col < numBlocksX; col++) {
      const identity = grid[row][col];
      if (identity !== null) {
        // Only render blocks with non-null identity
        const color = blockColors[identity];
        const x = col * blockSize;
        const y = row * blockSize;
        renderBlock(ctx, x, y, blockSize, blockSize, color);
        //ctx.fillStyle = color;
        //ctx.fillRect(x, y, blockSize, blockSize);
      }
    }
  }
}

function gameLoop() {
  // Update phase
  updateGame();

  // Render phase
  renderGame();

  // Schedule the next iteration of the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
