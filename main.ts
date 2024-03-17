// Get the canvas element
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

// constants for the dimensions
const numBlocksX = 10; // Number of blocks in X direction
const numBlocksY = 10; // Number of blocks in Y direction
let blockSize = 10;

// 2D array to store block colors
const blockColors: string[][] = [];

// Initialize blockColors array with random colors
for (let row = 0; row < numBlocksY; row++) {
    blockColors[row] = [];
    for (let col = 0; col < numBlocksX; col++) {
        // Generate random color (hex format)
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        blockColors[row][col] = randomColor;
    }
}

// Set initial canvas size
adjustCanvasSize();

// Listen for window resize event
window.addEventListener('resize', adjustCanvasSize);

function adjustCanvasSize() {
    // Calculate new canvas width based on 50% of window width
    const windowWidth = window.innerWidth;
    const newCanvasWidth = Math.round(windowWidth * 0.8);

    // Set canvas size
    canvas.width = newCanvasWidth;
    canvas.height = canvas.width; // Maintain square aspect ratio (optional)

    blockSize = canvas.width / numBlocksX;
    renderGame();
}

function updateGame() {
    // Update game state (if needed)
}

function renderGame() {
    // Clear canvas
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render grid of blocks
    for (let row = 0; row < numBlocksY; row++) {
        for (let col = 0; col < numBlocksX; col++) {
            // Calculate block position
            const x = col * blockSize;
            const y = row * blockSize;

            // Set block color
            ctx.fillStyle = blockColors[row][col];

            // Draw block
            ctx.fillRect(x, y, blockSize, blockSize);
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
