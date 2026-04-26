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
  totalMoves?: number
  largestCluster?: number
  blocksPopped?: number
  cascadeCurrentChainDepth?: number
  cascadeBestChainDepth?: number
  cascadeComboBonus?: number
  precisionTargetSize?: number
  precisionStrikes?: number
  precisionStreak?: number
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

type GravityDirection = 'down' | 'up';

const isEqual = (a: coordinate, b: coordinate): boolean =>
  a.row === b.row && a.col === b.col;

class GameState {
  private grid: item[][] = [];
  popList: coordinate[] = [];
  private pendingPopList: coordinate[] = [];
  blocksDirty = true;
  animating = false;
  private score: number = 0;
  private totalMoves: number = 0;
  private largestCluster: number = 0;
  private blocksPopped: number = 0;
  private gameStartTime: number = 0;
  private serializedGameDuration: number = 0;
  private numBlocksInColumn: number[] = [];
  private hasMoreMovesCache: boolean = false;
  private availableMovesCache: number = 0;
  private hasMoreMovesDirty: boolean = true;
  private needsPop: boolean = false;
  private cascadeCurrentChainDepth: number = 0;
  private cascadeBestChainDepth: number = 0;
  private cascadeComboBonus: number = 0;
  private precisionTargetSize: number = 2;
  private precisionStrikes: number = 0;
  private precisionStreak: number = 0;
  private gravityDirection: GravityDirection = 'down';

  private numRows: number = 0;
  private numColumns: number = 0;
  private selectionCache: coordinate = { row: -1, col: -1 };
  private readonly soundEffectCallback: () => void;
  private undostack: serializationPayload[] = [];
  private redostack: serializationPayload[] = [];

  constructor (soundEffectCallback: () => void) { this.soundEffectCallback = soundEffectCallback; }

  private shouldRunInvariantChecks (): boolean {
    const host = globalThis.location?.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '';
  }

  private assertInvariants (context: string): void {
    if (!this.shouldRunInvariantChecks()) {
      return;
    }

    if (this.numBlocksInColumn.length !== this.numColumns) {
      throw new Error(`Invariant failed (${context}): column count mismatch`);
    }

    let seenEmptyColumn = false;

    for (let col = 0; col < this.numColumns; col++) {
      let blockCount = 0;
      let seenGapInGravityDirection = false;

      const startRow = this.gravityDirection === 'down' ? this.numRows - 1 : 0;
      const endRow = this.gravityDirection === 'down' ? -1 : this.numRows;
      const step = this.gravityDirection === 'down' ? -1 : 1;

      for (let row = startRow; row !== endRow; row += step) {
        const block = this.grid[row][col];
        if (block.id === null) {
          seenGapInGravityDirection = true;
        } else {
          blockCount++;
          if (seenGapInGravityDirection) {
            throw new Error(`Invariant failed (${context}): floating block at row ${row}, col ${col}`);
          }
        }

        if (block.xoffset < 0) {
          throw new Error(`Invariant failed (${context}): negative x-offset at row ${row}, col ${col}`);
        }
      }

      if (blockCount !== this.numBlocksInColumn[col]) {
        throw new Error(`Invariant failed (${context}): column ${col} block count mismatch`);
      }

      if (blockCount === 0) {
        seenEmptyColumn = true;
      } else if (seenEmptyColumn) {
        throw new Error(`Invariant failed (${context}): non-empty column appears right of empty column at col ${col}`);
      }
    }
  }

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

  getTotalMoves (): number {
    return this.totalMoves;
  }

  getLargestCluster (): number {
    return this.largestCluster;
  }

  getBlocksPopped (): number {
    return this.blocksPopped;
  }

  getAvailableMoves (): number {
    this.refreshMoveAvailabilityCache();
    return this.availableMovesCache;
  }

  getAvailableClusterSizes (): number[] {
    const clusters = this.collectRemovableClusters();
    const sizes = new Set<number>();
    for (const cluster of clusters) {
      sizes.add(cluster.length);
    }
    return Array.from(sizes).sort((a, b) => a - b);
  }

  getCascadeCurrentChainDepth (): number {
    return this.cascadeCurrentChainDepth;
  }

  getCascadeBestChainDepth (): number {
    return this.cascadeBestChainDepth;
  }

  getCascadeComboBonus (): number {
    return this.cascadeComboBonus;
  }

  getPrecisionTargetSize (): number {
    return this.precisionTargetSize;
  }

  getPrecisionStrikes (): number {
    return this.precisionStrikes;
  }

  getPrecisionStreak (): number {
    return this.precisionStreak;
  }

  resetScore (): void {
    this.score = 0;
  }

  resetRoundStats (): void {
    this.totalMoves = 0;
    this.largestCluster = 0;
    this.blocksPopped = 0;
  }

  resetClock (): void {
    this.gameStartTime = performance.now();
    this.serializedGameDuration = 0;
  }

  resetUndo (): void {
    this.undostack = [];
    this.redostack = [];
  }

  resetModeRuntimeStats (): void {
    this.cascadeCurrentChainDepth = 0;
    this.cascadeBestChainDepth = 0;
    this.cascadeComboBonus = 0;
    this.precisionTargetSize = 2;
    this.precisionStrikes = 0;
    this.precisionStreak = 0;
  }

  setGravityDirection (direction: GravityDirection): void {
    this.gravityDirection = direction;
  }

  startCascadeTurn (): void {
    this.cascadeCurrentChainDepth = 0;
    this.cascadeComboBonus = 0;
  }

  recordCascadeWave (clusterSize: number, scoreMultiplier: number): void {
    if (clusterSize <= 0) {
      return;
    }
    this.cascadeCurrentChainDepth++;
    this.cascadeBestChainDepth = Math.max(this.cascadeBestChainDepth, this.cascadeCurrentChainDepth);
    this.cascadeComboBonus += Math.floor(this.computeScore(clusterSize) * Math.max(0, scoreMultiplier - 1));
  }

  setPrecisionTargetSize (size: number): void {
    this.precisionTargetSize = Math.max(2, Math.floor(size));
  }

  recordPrecisionMiss (): void {
    this.precisionStrikes = Math.min(3, this.precisionStrikes + 1);
    this.precisionStreak = 0;
  }

  getPrecisionHitMultiplier (): number {
    return 1 + Math.min(4, this.precisionStreak) * 0.25;
  }

  recordPrecisionExactHit (): void {
    this.precisionStreak++;
  }

  hasUndo (): boolean {
    return this.undostack.length > 0;
  }

  hasRedo (): boolean {
    return this.redostack.length > 0;
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
    this.popList = [];
    this.pendingPopList = [];
    this.selectionCache = { row: -1, col: -1 };
    this.needsPop = false;
    this.animating = false;

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
    this.hasMoreMovesDirty = true;
    this.resetModeRuntimeStats();
    this.assertInvariants('initializeGrid');
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

  clearSelectionTarget (): void {
    this.selectionCache = { row: -1, col: -1 };
  }

  hasMoreMoves (): boolean {
    this.refreshMoveAvailabilityCache();
    return this.hasMoreMovesCache;
  }

  private refreshMoveAvailabilityCache (): void {
    if (!this.hasMoreMovesDirty) {
      return;
    }

    this.availableMovesCache = this.computeAvailableMoves();
    this.hasMoreMovesCache = this.availableMovesCache > 0;
    this.hasMoreMovesDirty = false;
  }

  private collectRemovableClusters (): coordinate[][] {
    if (this.numRows === 0 || this.numColumns === 0) {
      return [];
    }

    const visited = new Uint8Array(this.numRows * this.numColumns);
    const indexFor = (row: number, col: number): number => row * this.numColumns + col;
    const clusters: coordinate[][] = [];

    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numColumns; col++) {
        const startIndex = indexFor(row, col);
        if (visited[startIndex] === 1) {
          continue;
        }

        const id = this.grid[row][col].id;
        if (id === null) {
          visited[startIndex] = 1;
          continue;
        }

        const stack = [{ row, col }];
        const cluster: coordinate[] = [];
        visited[startIndex] = 1;

        while (stack.length > 0) {
          const current = stack.pop();
          if (current === undefined) {
            continue;
          }

          cluster.push(current);

          const neighbors = [
            { row: current.row - 1, col: current.col },
            { row: current.row + 1, col: current.col },
            { row: current.row, col: current.col - 1 },
            { row: current.row, col: current.col + 1 }
          ];

          for (const neighbor of neighbors) {
            if (!this.isLocationInGrid(neighbor)) {
              continue;
            }
            const neighborIndex = indexFor(neighbor.row, neighbor.col);
            if (visited[neighborIndex] === 1) {
              continue;
            }
            if (this.grid[neighbor.row][neighbor.col].id !== id) {
              continue;
            }

            visited[neighborIndex] = 1;
            stack.push(neighbor);
          }
        }

        if (cluster.length > 1) {
          clusters.push(cluster);
        }
      }
    }

    return clusters;
  }

  private computeAvailableMoves (): number {
    return this.collectRemovableClusters().length;
  }

  private getFloodedCoordinates (coord: coordinate): coordinate[] {
    const ret = [];
    const queue = [coord];
    const visited = new Set<string>();
    const target = this.grid[coord.row][coord.col].id;

    while (queue.length > 0) {
      // check if this item is valid to look at
      const c = queue.shift(); // shift pops from front
      if (c === undefined) {
        continue;
      }
      if (!this.isLocationInGrid(c)) {
        continue;
      }
      const key = `${c.row},${c.col}`;
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      const block = this.grid[c.row][c.col].id;
      if (block === null || block !== target) {
        continue;
      }
      // this is a hit, add it to ret:
      ret.push(c);
      queue.push({ row: c.row + 1, col: c.col });
      queue.push({ row: c.row - 1, col: c.col });
      queue.push({ row: c.row, col: c.col + 1 });
      queue.push({ row: c.row, col: c.col - 1 });
    }

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

  doPop (options: { countMove?: boolean, scoreMultiplier?: number } = {}): number {
    if (this.popList.length === 0) {
      return 0;
    }

    const countMove = options.countMove ?? true;
    const scoreMultiplier = options.scoreMultiplier ?? 1;
    this.undostack.push(this.serialize());
    this.redostack = [];
    this.pendingPopList = [...this.popList];
    this.needsPop = true;
    if (countMove) {
      this.totalMoves++;
    }
    this.largestCluster = Math.max(this.largestCluster, this.pendingPopList.length);
    this.blocksPopped += this.pendingPopList.length;
    this.score += Math.floor(this.computeScore(this.pendingPopList.length) * scoreMultiplier);
    this.blocksDirty = true;
    this.soundEffectCallback();
    return this.pendingPopList.length;
  }

  popLargestCluster (options: { countMove?: boolean, scoreMultiplier?: number, minClusterSize?: number } = {}): number {
    const clusters = this.collectRemovableClusters();
    const minClusterSize = Math.max(2, options.minClusterSize ?? 2);
    const eligibleClusters = clusters.filter((cluster) => cluster.length >= minClusterSize);

    if (eligibleClusters.length === 0) {
      return 0;
    }

    let largest = eligibleClusters[0];
    for (let i = 1; i < eligibleClusters.length; i++) {
      if (eligibleClusters[i].length > largest.length) {
        largest = eligibleClusters[i];
      }
    }

    this.popList = [...largest];
    this.blocksDirty = true;
    return this.doPop(options);
  }

  private markBlockNull (coord: coordinate): void {
    this.grid[coord.row][coord.col].id = null;
  }

  private removeBlock (coord: coordinate, dropMap: Map<string, number>): void {
    this.markBlockNull(coord);

    if (this.gravityDirection === 'down') {
      for (let row = 0; row < coord.row; row++) {
        const key = `${row},${coord.col}`;
        const prevValue = dropMap.get(key);
        dropMap.set(key, prevValue === undefined ? 1 : prevValue + 1);
      }
    } else {
      for (let row = coord.row + 1; row < this.numRows; row++) {
        const key = `${row},${coord.col}`;
        const prevValue = dropMap.get(key);
        dropMap.set(key, prevValue === undefined ? 1 : prevValue + 1);
      }
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
    if (this.gravityDirection === 'down') {
      // note: it's important to apply the drop from bottom to top...
      for (let row = this.grid.length - 2; row >= 0; row--) {
        for (let col = 0; col < this.grid[0].length; col++) {
          const key = `${row},${col}`;
          const val = dropMap.get(key);
          if (val !== undefined) {
            const thisBlock = this.grid[row][col];
            if (thisBlock.id === null) {
              continue;
            }
            const destinationBlock = this.grid[row + val][col];
            destinationBlock.id = thisBlock.id;
            destinationBlock.xoffset = thisBlock.xoffset;
            thisBlock.id = null;
            thisBlock.xoffset = 0;
            thisBlock.yoffset = 0;
            destinationBlock.yoffset = val;
            this.animating = true;
          }
        }
      }
      return;
    }

    // antigravity settles from top to bottom so lower blocks float upward.
    for (let row = 1; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[0].length; col++) {
        const key = `${row},${col}`;
        const val = dropMap.get(key);
        if (val !== undefined) {
          const thisBlock = this.grid[row][col];
          if (thisBlock.id === null) {
            continue;
          }
          const destinationBlock = this.grid[row - val][col];
          destinationBlock.id = thisBlock.id;
          destinationBlock.xoffset = thisBlock.xoffset;
          thisBlock.id = null;
          thisBlock.xoffset = 0;
          thisBlock.yoffset = 0;
          destinationBlock.yoffset = -val;
          this.animating = true;
        }
      }
    }
  }

  private applyLeftShift (): void {
    const leftShift = this.numBlocksInColumn.map((val) => val === 0).map((sum => value => sum += value ? 1 : 0)(0));
    for (let col = 1; col < this.numColumns; col++) {
      const mv = leftShift[col - 1];
      if (mv > 0) {
        for (let row = 0; row < this.numRows; row++) {
          const thisBlock = this.grid[row][col];
          const leftBlock = this.grid[row][col - mv];
          const id = thisBlock.id;
          leftBlock.id = thisBlock.id;
          leftBlock.yoffset = thisBlock.yoffset;
          leftBlock.xoffset = id === null ? 0 : mv;
          thisBlock.id = null;
          thisBlock.xoffset = 0;
          thisBlock.yoffset = 0;
          if (id !== null) {
            this.animating = true;
          }
        }
        this.numBlocksInColumn[col - mv] = this.numBlocksInColumn[col];
        this.numBlocksInColumn[col] = 0;
      }
    }
  }

  updateBlocks (): void {
    if (!this.needsPop) return;
    const dropMap = new Map<string, number>();
    for (const coord of this.pendingPopList) {
      this.removeBlock(coord, dropMap);
    }
    this.pendingPopList = [];
    this.popList = [];
    this.zeroOffsets();
    this.applyDrop(dropMap);
    this.applyLeftShift();
    this.hasMoreMovesDirty = true;
    this.needsPop = false;
    const cursorLocation = { row: this.selectionCache.row, col: this.selectionCache.col };
    this.selectionCache = { row: -1, col: -1 };
    this.updateSelection(cursorLocation);
    this.assertInvariants('updateBlocks');
  }

  refillNullBlocksFromTop (numBlockTypes: number): void {
    if (numBlockTypes <= 0 || this.numRows === 0 || this.numColumns === 0) {
      return;
    }

    let addedAny = false;
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numColumns; col++) {
        const block = this.grid[row][col];
        if (block.id !== null) {
          continue;
        }

        block.id = Math.floor(Math.random() * numBlockTypes);
        block.xoffset = 0;
        block.yoffset = row + 1;
        addedAny = true;
      }
    }

    if (!addedAny) {
      return;
    }

    this.numBlocksInColumn = new Array(this.numColumns).fill(this.numRows);
    this.blocksDirty = true;
    this.hasMoreMovesDirty = true;
    this.animating = true;
    this.assertInvariants('refillNullBlocksFromTop');
  }

  undo (): void {
    const state = this.undostack.pop();
    if (state !== undefined) {
      this.redostack.push(this.serialize());
      this.resetClock();
      this.deserialize(state);
    }
  }

  redo (): void {
    const state = this.redostack.pop();
    if (state !== undefined) {
      this.undostack.push(this.serialize());
      this.resetClock();
      this.deserialize(state);
    }
  }

  computeScore (n: number): number {
    return 5 * (n ** 2 + (n > 15 ? 2 * n ** 2 : 0) + (n > 30 ? 2 * n ** 2 : 0));
  }

  decrementOffsets (amount: number): boolean {
    let hasOffset = false;
    for (const row of this.grid) {
      for (const block of row) {
        block.xoffset = Math.max(block.xoffset - amount, 0);
        if (block.yoffset > 0) {
          block.yoffset = Math.max(block.yoffset - amount, 0);
        } else if (block.yoffset < 0) {
          block.yoffset = Math.min(block.yoffset + amount, 0);
        }
        if (block.xoffset !== 0 || block.yoffset !== 0) {
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
      serializedGameDuration: this.serializedGameDuration + performance.now() - this.gameStartTime,
      totalMoves: this.totalMoves,
      largestCluster: this.largestCluster,
      blocksPopped: this.blocksPopped,
      cascadeCurrentChainDepth: this.cascadeCurrentChainDepth,
      cascadeBestChainDepth: this.cascadeBestChainDepth,
      cascadeComboBonus: this.cascadeComboBonus,
      precisionTargetSize: this.precisionTargetSize,
      precisionStrikes: this.precisionStrikes,
      precisionStreak: this.precisionStreak
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
    this.totalMoves = 'totalMoves' in payload ? payload.totalMoves ?? 0 : 0;
    this.largestCluster = 'largestCluster' in payload ? payload.largestCluster ?? 0 : 0;
    this.blocksPopped = 'blocksPopped' in payload ? payload.blocksPopped ?? 0 : 0;
    this.cascadeCurrentChainDepth = 'cascadeCurrentChainDepth' in payload ? payload.cascadeCurrentChainDepth ?? 0 : 0;
    this.cascadeBestChainDepth = 'cascadeBestChainDepth' in payload ? payload.cascadeBestChainDepth ?? 0 : 0;
    this.cascadeComboBonus = 'cascadeComboBonus' in payload ? payload.cascadeComboBonus ?? 0 : 0;
    this.precisionTargetSize = 'precisionTargetSize' in payload ? Math.max(2, payload.precisionTargetSize ?? 2) : 2;
    this.precisionStrikes = 'precisionStrikes' in payload ? Math.max(0, payload.precisionStrikes ?? 0) : 0;
    this.precisionStreak = 'precisionStreak' in payload ? Math.max(0, payload.precisionStreak ?? 0) : 0;
    this.blocksDirty = true;
    this.hasMoreMovesDirty = true;
    this.serializedGameDuration = 'serializedGameDuration' in payload ? payload.serializedGameDuration : 0;
    this.assertInvariants('deserialize');
  }
}

export default GameState;
