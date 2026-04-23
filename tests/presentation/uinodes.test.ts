// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import UINodes from '@/presentation/uinodes';

describe('UINodes color count handling', () => {
  it('returns only active color inputs when color input count is increased', () => {
    const ui = new UINodes();
    ui.createUI();

    ui.setColorInputCount(8);
    ui.setInputColors([
      '#111111', '#222222', '#333333', '#444444', '#555555',
      '#666666', '#777777', '#888888', '#999999', '#aaaaaa'
    ]);

    const output: string[] = [];
    ui.getInputColors(output);

    expect(output).toEqual([
      '#111111', '#222222', '#333333', '#444444',
      '#555555', '#666666', '#777777', '#888888'
    ]);
  });

  it('clamps requested color input count to supported max', () => {
    const ui = new UINodes();
    ui.createUI();

    ui.setColorInputCount(999);
    const output: string[] = [];
    ui.getInputColors(output);

    expect(output.length).toBe(10);
  });
});
