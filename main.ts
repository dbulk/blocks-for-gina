// Get the canvas element
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

// Draw "Hello, World!" text
ctx.font = '30px Arial';
ctx.fillText('Hello, World!', 10, 50);
