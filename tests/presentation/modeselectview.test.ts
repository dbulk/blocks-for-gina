// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import ModeSelectView from '@/presentation/modeselectview';

const ALL_MODES = [
  { id: 'arcade', name: 'Arcade', description: 'Play until there are no valid moves.', implemented: true },
  { id: 'sandbox', name: 'Sandbox', description: 'Custom board.', implemented: true },
  { id: 'timed', name: 'Timed', description: 'Beat the clock.', implemented: true },
  { id: 'sprint', name: 'Sprint', description: 'Fixed move budget.', implemented: true },
  { id: 'antigravity', name: 'Antigravity', description: 'Blocks float upward.', implemented: false },
  { id: 'cascade', name: 'Cascade', description: 'Chain reactions.', implemented: false },
  { id: 'precision', name: 'Precision', description: 'Min cluster size required.', implemented: false },
  { id: 'zen', name: 'Zen', description: 'No pressure.', implemented: false }
];

describe('ModeSelectView', () => {
  it('renders all modes as toggle buttons after setModes()', () => {
    const view = new ModeSelectView();
    view.setModes(ALL_MODES);
    document.body.appendChild(view.container);

    const toggles = view.container.querySelectorAll('button.mode-toggle');
    expect(toggles.length).toBe(8);

    const modeIds = Array.from(toggles).map((btn) => (btn as HTMLButtonElement).dataset.modeId);
    expect(modeIds).toContain('arcade');
    expect(modeIds).toContain('sandbox');
    expect(modeIds).toContain('timed');
    expect(modeIds).toContain('sprint');
    expect(modeIds).toContain('antigravity');

    document.body.removeChild(view.container);
  });

  it('arcade toggle is selected by default', () => {
    const view = new ModeSelectView();
    view.setModes(ALL_MODES);
    document.body.appendChild(view.container);

    const arcadeToggle = view.container.querySelector('button.mode-toggle[data-mode-id="arcade"]') as HTMLButtonElement;
    const sandboxToggle = view.container.querySelector('button.mode-toggle[data-mode-id="sandbox"]') as HTMLButtonElement;
    expect(arcadeToggle.classList.contains('selected')).toBe(true);
    expect(sandboxToggle.classList.contains('selected')).toBe(false);

    document.body.removeChild(view.container);
  });

  it('clicking sandbox toggle selects it and deselects arcade', () => {
    const view = new ModeSelectView();
    view.setModes(ALL_MODES);
    document.body.appendChild(view.container);

    const arcadeToggle = view.container.querySelector('button.mode-toggle[data-mode-id="arcade"]') as HTMLButtonElement;
    const sandboxToggle = view.container.querySelector('button.mode-toggle[data-mode-id="sandbox"]') as HTMLButtonElement;
    sandboxToggle.click();

    expect(sandboxToggle.classList.contains('selected')).toBe(true);
    expect(arcadeToggle.classList.contains('selected')).toBe(false);

    document.body.removeChild(view.container);
  });

  it('clicking Play calls callback with selected mode', () => {
    const view = new ModeSelectView();
    view.setModes(ALL_MODES);
    document.body.appendChild(view.container);
    const callback = vi.fn();
    view.addModeCardClickListener(callback);

    const sandboxToggle = view.container.querySelector('button.mode-toggle[data-mode-id="sandbox"]') as HTMLButtonElement;
    sandboxToggle.click();
    const playBtn = view.container.querySelector('button.mode-play-btn') as HTMLButtonElement;
    playBtn.click();

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('sandbox');

    document.body.removeChild(view.container);
  });

  it('Play defaults to arcade without selecting a toggle', () => {
    const view = new ModeSelectView();
    view.setModes(ALL_MODES);
    document.body.appendChild(view.container);
    const callback = vi.fn();
    view.addModeCardClickListener(callback);

    const playBtn = view.container.querySelector('button.mode-play-btn') as HTMLButtonElement;
    playBtn.click();

    expect(callback).toHaveBeenCalledWith('arcade');

    document.body.removeChild(view.container);
  });

  it('setModes replaces existing toggles', () => {
    const view = new ModeSelectView();
    view.setModes([{ id: 'arcade', name: 'Arcade', description: '', implemented: true }]);
    view.setModes(ALL_MODES);
    document.body.appendChild(view.container);

    const toggles = view.container.querySelectorAll('button.mode-toggle');
    expect(toggles.length).toBe(8);

    document.body.removeChild(view.container);
  });

  it('setVisible(false) hides the container', () => {
    const view = new ModeSelectView();
    view.setVisible(false);
    expect(view.container.style.display).toBe('none');
  });

  it('setVisible(true) shows the container', () => {
    const view = new ModeSelectView();
    view.setVisible(false);
    view.setVisible(true);
    expect(view.container.style.display).toBe('flex');
  });
});

