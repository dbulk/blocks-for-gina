// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import UINodes from '@/presentation/uinodes';

describe('UINodes color count handling', () => {
  it('does not render a settings expand button or settings panel in the gameplay toolbar', () => {
    const ui = new UINodes();
    ui.createUI();

    const toolbar = ui['div'];
    const buttonLabels = Array.from(toolbar.querySelectorAll('button')).map((button) => button.textContent);

    expect(buttonLabels).not.toContain('Settings');
    expect(toolbar.querySelector('.settings-expandy')).toBeNull();
  });

  it('does not render board or generation controls in the gameplay toolbar', () => {
    const ui = new UINodes();
    ui.createUI();

    const toolbar = ui['div'];
    const toolbarText = ui['div'].textContent ?? '';

    expect(toolbarText).not.toContain('Board');
    expect(toolbarText).not.toContain('Generation');
    expect(toolbarText).not.toContain('Actions');
    expect(toolbar.querySelector('#rows')).toBeNull();
    expect(toolbar.querySelector('#columns')).toBeNull();
    expect(toolbar.querySelector('#clusterstrength')).toBeNull();
    expect(toolbar.querySelector('#game-mode')).toBeNull();
  });

  it('renders appearance controls directly in the gameplay toolbar', () => {
    const ui = new UINodes();
    ui.createUI();

    const toolbar = ui['div'];

    expect(toolbar.querySelector('#block-style')).not.toBeNull();
    expect(toolbar.querySelector('#colors')).not.toBeNull();
  });

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

  it('emits a layout change when visible color input count changes', () => {
    const ui = new UINodes();
    ui.createUI();

    const onLayoutChange = vi.fn();
    ui.addLayoutChangeListener(onLayoutChange);

    ui.setColorInputCount(8);

    expect(onLayoutChange).toHaveBeenCalledOnce();
  });
});
