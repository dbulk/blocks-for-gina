import GameSettings from "./gamesettings.js";

interface Block {
  i: number;
  j: number;
  id: number;
}
interface Coordnate {
  row: number;
  col: number;
}

class GameBoard {
  private gameSettings: GameSettings;
  private needsGravity : boolean;

  blocks: (Block | null)[] = [];
  grid: number[][] = [];
  numBlocksInColumn: number[] = [];

  constructor(gameSettings: GameSettings) {
    this.gameSettings = gameSettings;

    // initialize blocks
    for (let row = 0; row < gameSettings.numRows; row++) {
      for (let col = 0; col < gameSettings.numColumns; col++) {
        const randomIdentity = Math.floor(
          Math.random() * gameSettings.numBlockTypes
        );
        this.blocks.push({ i: row, j: col, id: randomIdentity });
      }
    }
    this.blocks.push(null);
    this.numBlocksInColumn = new Array(gameSettings.numColumns).fill(
      gameSettings.numRows
    );
    this.updateGridFromBlocks();
  }

  click(row: number,column: number) {
    // Get identity of clicked block
    const index = this.grid[row][column];

    if (index !== null && this.blocks[index] !== null) {
      const nonNullBlock = this.blocks[index] as Block;
      const coords = this.getFloodedCoordinates(row,column,nonNullBlock.id);

      if(coords.length < 2) {
        return;
      }

      this.needsGravity = true;
      for (const coord of coords) {
        const blockindex = this.grid[coord.row][coord.col];
        this.blocks[blockindex] = null;
        this.numBlocksInColumn[coord.col]--;
      }
    }
  }

  update() {
    if(this.needsGravity) {
      for(const block of this.blocks) {
        if(block !== null && block.i < this.gameSettings.numRows-1) {
          let underblock = this.blocks[this.grid[block.i+1][block.j]];
          // while(underblock === null) {
            
          // }
        }
      }

      this.needsGravity=false;
    }
  }

  private updateGridFromBlocks() {
    for (let row = 0; row < this.gameSettings.numRows; row++) {
      this.grid[row] = Array(this.gameSettings.numColumns).fill(null);
    }
    for (let i = 0; i < this.blocks.length; ++i) {
      const b = this.blocks[i];
      if (b) {
        this.grid[b.i][b.j] = i;
      }
    }
  }

  private isLocationInGrid(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < this.gameSettings.numRows &&
      col >= 0 &&
      col < this.gameSettings.numColumns
    );
  }

  private getFloodedCoordinates(
    row: number,
    col: number,
    target: number
  ): Coordnate[] {
    const coords: Coordnate[] = [];
    const visited: Set<string> = new Set();

    const fill = (row: number, col: number): void => {
      // Check if current block is within grid bounds and has the target identity
      const key = `${row},${col}`;

      if (!this.isLocationInGrid(row, col)) {
        return;
      }
      if (
        this.grid[row][col] === null ||
        this.blocks[this.grid[row][col]] === null
      ) {
        return;
      }

      const nonNullBlock = this.blocks[this.grid[row][col]] as Block;
      if (nonNullBlock.id !== target || visited.has(key)) {
        return;
      }
      coords.push({ row, col });
      visited.add(key);
      fill(row + 1, col);
      fill(row - 1, col);
      fill(row, col + 1);
      fill(row, col - 1);
    };

    fill(row, col);
    return coords;
  }
}
export default GameBoard;
