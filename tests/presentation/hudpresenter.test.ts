import { describe, expect, it } from 'vitest';
import GameState from '@/core/gamestate';
import HudPresenter from '@/presentation/hudpresenter';

const makeStateFromGrid = (griddata: Array<Array<number | null>>, score: number = 0): GameState => {
  const state = new GameState(() => {});
  state.deserialize({
    griddata,
    score,
    serializedGameDuration: 0
  });
  return state;
};

const getByKey = (metrics: ReturnType<HudPresenter['getMetrics']>, key: string) => {
  const metric = metrics.find((m) => m.key === key);
  expect(metric).toBeDefined();
  return metric;
};

describe('HudPresenter', () => {
  it('returns expected metrics in stable order for arcade mode', () => {
    const state = makeStateFromGrid([
      [1, 2],
      [3, 4]
    ]);
    const presenter = new HudPresenter();

    const metrics = presenter.getMetrics(state, 'arcade');
    const visibleKeys = metrics.filter((m) => m.visible).sort((a, b) => a.order - b.order).map((m) => m.key);

    expect(visibleKeys).toEqual(['mode', 'blocks', 'time', 'score']);
  });

  it('shows baseline values with no preview deltas when nothing is selected', () => {
    const state = makeStateFromGrid([
      [1, 2],
      [3, 4]
    ], 123);
    const presenter = new HudPresenter();

    const metrics = presenter.getMetrics(state, 'arcade');
    const blocks = getByKey(metrics, 'blocks');
    const score = getByKey(metrics, 'score');
    const time = getByKey(metrics, 'time');
    const mode = getByKey(metrics, 'mode');

    expect(blocks?.label).toBe('Blocks');
    expect(blocks?.value).toBe('4');
    expect(blocks?.delta).toBeUndefined();
    expect(blocks?.tone).toBe('default');

    expect(score?.label).toBe('Score');
    expect(score?.value).toBe('123');
    expect(score?.delta).toBeUndefined();
    expect(score?.tone).toBe('default');

    expect(time?.label).toBe('Time');
    expect(time?.value).toMatch(/^(\d+:)?\d{2}:\d{2}$/);

    expect(mode?.value).toBe('Arcade');
    expect(mode?.visible).toBe(true);
  });

  it('shows preview deltas and accent tone when a valid cluster is selected', () => {
    const state = makeStateFromGrid([
      [1, 2, 3],
      [1, 4, 5],
      [6, 7, 8]
    ], 50);
    const presenter = new HudPresenter();

    state.updateSelection({ row: 0, col: 0 });

    const metrics = presenter.getMetrics(state, 'arcade');
    const blocks = getByKey(metrics, 'blocks');
    const score = getByKey(metrics, 'score');

    expect(blocks?.delta).toBe('2 selected');
    expect(blocks?.tone).toBe('accent');

    expect(score?.delta).toBe(`+${state.computeScore(2)}`);
    expect(score?.tone).toBe('accent');
  });

  it('keeps baseline state when hovered selection is not a valid pop', () => {
    const state = makeStateFromGrid([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ], 77);
    const presenter = new HudPresenter();

    state.updateSelection({ row: 1, col: 1 });

    const metrics = presenter.getMetrics(state, 'arcade');
    const blocks = getByKey(metrics, 'blocks');
    const score = getByKey(metrics, 'score');

    expect(blocks?.delta).toBeUndefined();
    expect(score?.delta).toBeUndefined();
    expect(score?.value).toBe('77');
  });

  it('shows sandbox mode label for sandbox mode', () => {
    const state = makeStateFromGrid([[1, 2], [3, 4]]);
    const presenter = new HudPresenter();

    const metrics = presenter.getMetrics(state, 'sandbox');
    const mode = getByKey(metrics, 'mode');

    expect(mode?.value).toBe('Sandbox');
  });

  it('shows timed mode with countdown and no moves metric', () => {
    const state = makeStateFromGrid([[1, 2], [3, 4]]);
    const presenter = new HudPresenter();

    const metrics = presenter.getMetrics(state, 'timed');
    const time = getByKey(metrics, 'time');
    const movesMetric = metrics.find((m) => m.key === 'moves');
    const mode = getByKey(metrics, 'mode');

    expect(mode?.value).toBe('Timed');
    expect(time?.label).toBe('Time Left');
    expect(time?.visible).toBe(true);
    expect(movesMetric?.visible).toBe(false);
  });

  it('shows sprint mode with remaining moves and hides time', () => {
    const state = makeStateFromGrid([[1, 2], [3, 4]]);
    const presenter = new HudPresenter();

    const metrics = presenter.getMetrics(state, 'sprint');
    const movesMetric = getByKey(metrics, 'moves');
    const time = metrics.find((m) => m.key === 'time');
    const mode = getByKey(metrics, 'mode');

    expect(mode?.value).toBe('Sprint');
    expect(movesMetric?.label).toBe('Moves Left');
    expect(movesMetric?.visible).toBe(true);
    expect(time?.visible).toBe(false);
  });

  it('shows warning tone on sprint moves when budget nearly exhausted', () => {
    const state = makeStateFromGrid([[1, 2], [3, 4]]);
    // simulate 6 moves used (4 remaining out of 10 — <= 5 threshold)
    for (let i = 0; i < 6; i++) {
      (state as any).totalMoves++;
    }
    const presenter = new HudPresenter();

    const metrics = presenter.getMetrics(state, 'sprint');
    const movesMetric = getByKey(metrics, 'moves');

    expect(movesMetric?.tone).toBe('warning');
    expect(movesMetric?.value).toBe('4');
  });
});
