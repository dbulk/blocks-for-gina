interface item {
  id: number | null
  xoffset: number
  yoffset: number
}
interface coordinate {
  row: number
  col: number
}
interface serializationPayload {
  griddata: Array<Array<(number | null)>>
  score: number
  serializedGameDuration: number
}
interface xy {
  x: number
  y: number
}

interface time {
  hours: number
  minutes: number
  seconds: number
}

const isEqual = (a: coordinate, b: coordinate): boolean =>
  a.row === b.row && a.col === b.col;

class GameState {
  private grid: item[][] = [];
  popList: coordinate[] = [];
  blocksDirty = true;
  animating = false;
  private score: number = 0;
  private gameStartTime: number = 0;
  private serializedGameDuration: number = 0;
  private numBlocksInColumn: number[] = [];
  private needsPop: boolean = false;

  private numRows: number = 0;
  private numColumns: number = 0;
  private selectionCache: coordinate = { row: -1, col: -1 };
  private readonly soundEffectCallback: () => void;

  constructor (soundEffectCallback: () => void) { this.soundEffectCallback = soundEffectCallback; }

  getScore (): number {
    return this.score;
  }

  getPopListScore (): number {
    return this.computeScore(this.popList.length);
  }

  getNumBlocksRemaining (): number {
    return this.numBlocksInColumn.reduce((a, v) => a + v, 0);
  }

  getNumBlocksToPop (): number {
    return this.popList.length;
  }

  resetScore (): void {
    this.score = 0;
  }

  resetClock (): void {
    this.gameStartTime = performance.now();
    this.serializedGameDuration = 0;
  }

  getPlayedDuration (): time {
    const duration = performance.now() - this.gameStartTime + this.serializedGameDuration;
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)));

    return { hours, minutes, seconds };
  }

  initializeGrid (numRows: number, numColumns: number, numBlockTypes: number, clusterStrength: number): void {
    this.numRows = numRows;
    this.numColumns = numColumns;

    this.grid = [];
    for (let row = 0; row < this.numRows; row++) {
      this.grid[row] = Array(this.numColumns);
      for (let col = 0; col < this.numColumns; col++) {
        this.grid[row][col] = { xoffset: 0, yoffset: 0, id: Math.floor(Math.random() * numBlockTypes) };
        if ((row > 0 || col > 0) && Math.random() < clusterStrength) {
          const neighbors = [];
          if (row > 0) neighbors.push({ row: row - 1, col });
          if (col > 0) neighbors.push({ row, col: col - 1 });
          if (row > 0 && col > 0) { neighbors.push({ row: row - 1, col: col - 1 }); }
          const src = neighbors[Math.floor(Math.random() * neighbors.length)];
          this.grid[row][col].id = this.grid[src.row][src.col].id;
        }
      }
    }
    this.numBlocksInColumn = new Array(this.numColumns).fill(this.numRows);
    this.blocksDirty = true;
  }

  getBlockID (c: coordinate): number | null {
    return this.grid[c.row][c.col].id;
  }

  getBlockOffset (c: coordinate): xy {
    const item = this.grid[c.row][c.col];
    return { x: item.xoffset, y: item.yoffset };
  }

  updateSelection (target: coordinate): void {
    if (!this.isLocationInGrid(target)) {
      target = { row: -1, col: -1 };
      this.popList = [];
    } else if (!isEqual(target, this.selectionCache)) {
      const blocks = this.getFloodedCoordinates(target);
      this.popList = blocks.length > 1 ? blocks : [];
    }
    if (!isEqual(target, this.selectionCache)) {
      this.blocksDirty = true;
    }
    this.selectionCache = target;
  }

  private getFloodedCoordinates (coord: coordinate): coordinate[] {
    const ret: coordinate[] = [];
    const visited = new Set<string>();

    const target = this.grid[coord.row][coord.col].id;
    const fill = (c: coordinate): void => {
      // Check if current block is within grid bounds and has the target identity
      const key = `${c.row},${c.col}`;

      if (!this.isLocationInGrid(c)) {
        return;
      }
      const block = this.grid[c.row][c.col].id;
      if (block == null || block !== target || visited.has(key)) {
        return;
      }
      ret.push(c);
      visited.add(key);
      fill({ row: c.row + 1, col: c.col });
      fill({ row: c.row - 1, col: c.col });
      fill({ row: c.row, col: c.col + 1 });
      fill({ row: c.row, col: c.col - 1 });
    };

    fill(coord);
    return ret;
  }

  private isLocationInGrid (c: coordinate): boolean {
    return (
      c.row >= 0 &&
      c.row < this.numRows &&
      c.col >= 0 &&
      c.col < this.numColumns
    );
  }

  doPop (): void {
    if (this.popList.length > 0) {
      this.needsPop = true;
      this.score += this.computeScore(this.popList.length);
      this.blocksDirty = true;
      this.soundEffectCallback();
    }
  }

  private markBlockNull (coord: coordinate): void {
    this.grid[coord.row][coord.col].id = null;
  }

  private removeBlock (coord: coordinate, dropMap: Map<string, number>): void {
    this.markBlockNull(coord);
    for (let row = 0; row < coord.row; row++) {
      const key = `${row},${coord.col}`;
      const prevValue = dropMap.get(key);
      dropMap.set(key, prevValue === undefined ? 1 : prevValue + 1);
    }
    this.numBlocksInColumn[coord.col]--;
  }

  private zeroOffsets (): void {
    for (const row of this.grid) {
      for (const block of row) {
        block.xoffset = 0;
        block.yoffset = 0;
      }
    }
  }

  private applyDrop (dropMap: Map<string, number>): void {
    // note: it's important to apply the drop from bottom to top...
    for (let row = this.grid.length - 2; row >= 0; row--) {
      for (let col = 0; col < this.grid[0].length; col++) {
        const key = `${row},${col}`;
        const val = dropMap.get(key);
        if (val !== undefined) {
          const thisBlock = this.grid[row][col];
          const aboveBlock = this.grid[row + val][col];
          aboveBlock.id = thisBlock.id;
          thisBlock.id = null;
          aboveBlock.yoffset = val;
          this.animating = true;
        }
      }
    }
  }

  private applyLeftShift (): void {
    // eslint-disable-next-line no-return-assign
    const leftShift = this.numBlocksInColumn.map((val) => val === 0).map((sum => value => sum += value ? 1 : 0)(0));
    for (let col = 1; col < this.numColumns; col++) {
      const mv = leftShift[col - 1];
      if (mv > 0) {
        for (let row = 0; row < this.numRows; row++) {
          const thisBlock = this.grid[row][col];
          const leftBlock = this.grid[row][col - mv];
          leftBlock.id = thisBlock.id;
          thisBlock.id = null;
          leftBlock.xoffset = mv;
        }
        this.numBlocksInColumn[col - mv] = this.numBlocksInColumn[col];
        this.numBlocksInColumn[col] = 0;
      }
    }
  }

  updateBlocks (): void {
    if (!this.needsPop) return;
    const dropMap = new Map<string, number>();
    for (const coord of this.popList) {
      this.removeBlock(coord, dropMap);
    }
    this.popList = [];
    this.zeroOffsets();
    this.applyDrop(dropMap);
    this.applyLeftShift();
    this.needsPop = false;
    const cursorLocation = { row: this.selectionCache.row, col: this.selectionCache.col };
    this.selectionCache = { row: -1, col: -1 };
    this.updateSelection(cursorLocation);
  }

  computeScore (n: number): number {
    return 5 * (n ** 2 + (n > 15 ? 2 * n ** 2 : 0) + (n > 30 ? 2 * n ** 2 : 0));
  }

  decrementOffsets (amount: number): boolean {
    let hasOffset = false;
    for (const row of this.grid) {
      for (const block of row) {
        block.xoffset = Math.max(block.xoffset - amount, 0);
        block.yoffset = Math.max(block.yoffset - amount, 0);
        if (block.xoffset > 0 || block.yoffset > 0) {
          hasOffset = true;
        }
      }
    }
    return hasOffset;
  }

  serialize (): serializationPayload {
    return {
      griddata: this.grid.map((x) => x.map((y) => y.id)),
      score: this.score,
      serializedGameDuration: this.serializedGameDuration + performance.now() - this.gameStartTime
    };
  }

  deserialize (payload: serializationPayload): void {
    const data = payload.griddata;
    this.initializeGrid(data.length, data[0].length, 1, 0);

    this.numBlocksInColumn = new Array(this.numColumns).fill(0);
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        this.grid[row][col].id = data[row][col];
        this.numBlocksInColumn[col] += data[row][col] !== null ? 1 : 0;
      }
    }

    this.score = payload.score;
    this.blocksDirty = true;
    this.serializedGameDuration = 'serializedGameDuration' in payload ? payload.serializedGameDuration : 0;
  }
}

export default GameState;
