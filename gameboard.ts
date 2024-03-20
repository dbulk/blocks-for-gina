import GameSettings from "./gamesettings.js";

interface Block {
  row: number;
  col: number;
  id: number;
}

class GameBoard {
  private gameSettings: GameSettings;
  grid: (Block | null)[][] = [];
  numBlocksInColumn: number[] = [];

  constructor(gameSettings: GameSettings) {
    this.gameSettings = gameSettings;

    // initialize blocks
    for (let row = 0; row < gameSettings.numRows; row++) {
      this.grid[row] = Array(this.gameSettings.numColumns).fill(null);
      for (let col = 0; col < gameSettings.numColumns; col++) {
        const id = Math.floor(
          Math.random() * gameSettings.numBlockTypes
        );
        const block: Block = { row, col, id };
        this.grid[row][col] = block;
      }
    }
    this.numBlocksInColumn = new Array(gameSettings.numColumns).fill(
      gameSettings.numRows
    );
  }

  click(row: number,column: number) {
    // Get identity of clicked block
    const block = this.grid[row][column];

    if (block) {
      const coords = this.getFloodedCoordinates(row, column, block.id);
      if(coords.length < 2) {
        // at least two adjacent blocks
        return;
      }

      for (const coord of coords) {
        this.grid[coord.row][coord.col] = null;
        this.numBlocksInColumn[coord.col]--;
      }
    }
  }

  update() {
    // if(this.needsGravity) {
    //   for(const block of this.blocks) {
    //     if(block !== null && block.i < this.gameSettings.numRows-1) {
    //       let underblock = this.blocks[this.grid[block.i+1][block.j]];
    //       // while(underblock === null) {
            
    //       // }
    //     }
    //   }

    //   this.needsGravity=false;
    // }
  }

  private updateGridFromBlocks() {
    // for (let row = 0; row < this.gameSettings.numRows; row++) {
    //   this.grid[row] = Array(this.gameSettings.numColumns).fill(null);
    // }
    // for (let i = 0; i < this.blocks.length; ++i) {
    //   const b = this.blocks[i];
    //   if (b) {
    //     this.grid[b.i][b.j] = i;
    //   }
    // }
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
  ): Block[] {
    const coords: Block[] = [];
    const visited: Set<string> = new Set();

    const fill = (row: number, col: number): void => {
      // Check if current block is within grid bounds and has the target identity
      const key = `${row},${col}`;

      const block = this.grid[row][col];
      if (!this.isLocationInGrid(row, col) || !block || block.id !== target || visited.has(key))  {
        return;
      }

      coords.push(block);
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
