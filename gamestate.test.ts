import { describe, expect, it } from 'vitest';
import GameState from './gamestate';

interface TestPayload {
  griddata: Array<Array<number | null>>
  score: number
  serializedGameDuration: number
}

const makeStateFromGrid = (griddata: Array<Array<number | null>>, score: number = 0): GameState => {
  const state = new GameState(() => {});
  const payload: TestPayload = {
    griddata,
    score,
    serializedGameDuration: 0
  };
  state.deserialize(payload);
  return state;
};

describe('GameState', () => {
  it('initializes with expected block count', () => {
    const state = new GameState(() => {});
    state.initializeGrid(6, 4, 3, 0);
    expect(state.getNumBlocksRemaining()).toBe(24);
    expect(state.getScore()).toBe(0);
  });

  it('detects when no moves remain', () => {
    const state = makeStateFromGrid([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]);
    expect(state.hasMoreMoves()).toBe(false);
  });

  it('detects available moves when adjacent matches exist', () => {
    const state = makeStateFromGrid([
      [1, 2, 3],
      [4, 2, 6],
      [7, 8, 9]
    ]);
    expect(state.hasMoreMoves()).toBe(true);
  });

  it('counts number of available moves as removable clusters', () => {
    const state = makeStateFromGrid([
      [1, 1, 2],
      [3, 4, 2],
      [5, 6, 7]
    ]);

    expect(state.getAvailableMoves()).toBe(2);
  });

  it('builds pop preview score from selected cluster', () => {
    const state = makeStateFromGrid([
      [1, 2, 3],
      [1, 4, 5],
      [6, 7, 8]
    ]);

    state.updateSelection({ row: 0, col: 0 });
    expect(state.getNumBlocksToPop()).toBe(2);
    expect(state.getPopListScore()).toBe(state.computeScore(2));
  });

  it('applies pop, updates score, and supports undo', () => {
    let soundCalls = 0;
    const state = new GameState(() => { soundCalls++; });
    state.deserialize({
      griddata: [
        [1, 2, 3],
        [1, 4, 5],
        [6, 7, 8]
      ],
      score: 0,
      serializedGameDuration: 0
    });

    state.updateSelection({ row: 0, col: 0 });
    state.doPop();
    expect(soundCalls).toBe(1);
    expect(state.getScore()).toBe(state.computeScore(2));

    state.updateBlocks();
    expect(state.getNumBlocksRemaining()).toBe(7);
    expect(state.getTotalMoves()).toBe(1);
    expect(state.getLargestCluster()).toBe(2);
    expect(state.hasUndo()).toBe(true);

    state.undo();
    expect(state.getScore()).toBe(0);
    expect(state.getTotalMoves()).toBe(0);
    expect(state.getLargestCluster()).toBe(0);
    expect(state.getNumBlocksRemaining()).toBe(9);
    expect(state.hasUndo()).toBe(false);
  });

  it('still removes blocks if selection changes after a pop is committed', () => {
    const state = makeStateFromGrid([
      [1, 2, 3],
      [1, 4, 5],
      [6, 7, 8]
    ]);

    state.updateSelection({ row: 0, col: 0 });
    state.doPop();

    // Touch/pointer cleanup can clear hover state before the next frame.
    state.updateSelection({ row: -1, col: -1 });
    state.updateBlocks();

    expect(state.getNumBlocksRemaining()).toBe(7);
    expect(state.getScore()).toBe(state.computeScore(2));
  });

  it('supports redo after undo', () => {
    const state = makeStateFromGrid([
      [1, 2, 3],
      [1, 4, 5],
      [6, 7, 8]
    ]);

    state.updateSelection({ row: 0, col: 0 });
    state.doPop();
    state.updateBlocks();

    const afterPop = state.serialize();
    expect(state.hasUndo()).toBe(true);
    expect(state.hasRedo()).toBe(false);

    state.undo();
    expect(state.hasRedo()).toBe(true);

    state.redo();
    expect(state.serialize().griddata).toEqual(afterPop.griddata);
    expect(state.getScore()).toBe(afterPop.score);
    expect(state.getTotalMoves()).toBe(afterPop.totalMoves ?? 0);
    expect(state.getLargestCluster()).toBe(afterPop.largestCluster ?? 0);
  });

  it('clears redo stack after a new action', () => {
    const state = makeStateFromGrid([
      [1, 1, 3],
      [2, 4, 5],
      [2, 7, 8]
    ]);

    state.updateSelection({ row: 0, col: 0 });
    state.doPop();
    state.updateBlocks();
    state.undo();

    expect(state.hasRedo()).toBe(true);

    state.updateSelection({ row: 1, col: 0 });
    state.doPop();
    expect(state.hasRedo()).toBe(false);
  });

  it('does not pop or play sound when selection is invalid', () => {
    let soundCalls = 0;
    const stateWithSound = new GameState(() => { soundCalls++; });
    stateWithSound.deserialize({
      griddata: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ],
      score: 0,
      serializedGameDuration: 0
    });

    stateWithSound.updateSelection({ row: 0, col: 0 });
    expect(stateWithSound.getNumBlocksToPop()).toBe(0);
    stateWithSound.doPop();

    expect(soundCalls).toBe(0);
    expect(stateWithSound.getScore()).toBe(0);
    expect(stateWithSound.hasUndo()).toBe(false);
  });

  it('serializes and deserializes grid + score correctly', () => {
    const state = makeStateFromGrid([
      [1, null, 3],
      [4, 5, null],
      [null, 8, 9]
    ], 123);

    const payload = state.serialize();
    const restored = new GameState(() => {});
    restored.deserialize(payload);

    expect(restored.serialize().griddata).toEqual(payload.griddata);
    expect(restored.getScore()).toBe(123);
    expect(restored.getTotalMoves()).toBe(payload.totalMoves ?? 0);
    expect(restored.getLargestCluster()).toBe(payload.largestCluster ?? 0);
  });

  it('animates drop offsets and eventually settles', () => {
    const state = makeStateFromGrid([
      [1, 9, 9],
      [2, 9, 8],
      [2, 7, 6]
    ]);

    state.updateSelection({ row: 1, col: 0 });
    state.doPop();
    state.updateBlocks();

    expect(state.animating).toBe(true);

    let stillAnimating = true;
    for (let i = 0; i < 30; i++) {
      stillAnimating = state.decrementOffsets(0.1);
    }

    expect(stillAnimating).toBe(false);
  });
});
