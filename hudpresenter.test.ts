import { describe, expect, it } from 'vitest';
import GameState from './gamestate';
import HudPresenter from './hudpresenter';

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
  it('returns expected metrics in stable order', () => {
    const state = makeStateFromGrid([
      [1, 2],
      [3, 4]
    ]);
    const presenter = new HudPresenter();

    const metrics = presenter.getMetrics(state);

    expect(metrics.map((m) => m.key)).toEqual(['blocks', 'time', 'score']);
    expect(metrics.map((m) => m.order)).toEqual([10, 20, 30]);
    expect(metrics.every((m) => m.visible)).toBe(true);
  });

  it('shows baseline values with no preview deltas when nothing is selected', () => {
    const state = makeStateFromGrid([
      [1, 2],
      [3, 4]
    ], 123);
    const presenter = new HudPresenter();

    const metrics = presenter.getMetrics(state);
    const blocks = getByKey(metrics, 'blocks');
    const score = getByKey(metrics, 'score');
    const time = getByKey(metrics, 'time');

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
  });

  it('shows preview deltas and accent tone when a valid cluster is selected', () => {
    const state = makeStateFromGrid([
      [1, 2, 3],
      [1, 4, 5],
      [6, 7, 8]
    ], 50);
    const presenter = new HudPresenter();

    state.updateSelection({ row: 0, col: 0 });

    const metrics = presenter.getMetrics(state);
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

    const metrics = presenter.getMetrics(state);
    const blocks = getByKey(metrics, 'blocks');
    const score = getByKey(metrics, 'score');

    expect(blocks?.delta).toBeUndefined();
    expect(score?.delta).toBeUndefined();
    expect(score?.value).toBe('77');
  });
});
