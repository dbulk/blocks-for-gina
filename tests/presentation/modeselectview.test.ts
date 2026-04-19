// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import ModeSelectView from '@/presentation/modeselectview';

describe('ModeSelectView', () => {
  it('renders arcade and sandbox as toggle buttons', () => {
    const view = new ModeSelectView();
    document.body.appendChild(view.container);

    const toggles = view.container.querySelectorAll('button.mode-toggle');
    expect(toggles.length).toBe(2);

    const modeIds = Array.from(toggles).map((btn) => (btn as HTMLButtonElement).dataset.modeId);
    expect(modeIds).toContain('arcade');
    expect(modeIds).toContain('sandbox');

    document.body.removeChild(view.container);
  });

  it('arcade toggle is selected by default', () => {
    const view = new ModeSelectView();
    document.body.appendChild(view.container);

    const arcadeToggle = view.container.querySelector('button.mode-toggle[data-mode-id="arcade"]') as HTMLButtonElement;
    const sandboxToggle = view.container.querySelector('button.mode-toggle[data-mode-id="sandbox"]') as HTMLButtonElement;
    expect(arcadeToggle.classList.contains('selected')).toBe(true);
    expect(sandboxToggle.classList.contains('selected')).toBe(false);

    document.body.removeChild(view.container);
  });

  it('clicking sandbox toggle selects it and deselects arcade', () => {
    const view = new ModeSelectView();
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
    document.body.appendChild(view.container);
    const callback = vi.fn();
    view.addModeCardClickListener(callback);

    // Select sandbox, then play
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
    document.body.appendChild(view.container);
    const callback = vi.fn();
    view.addModeCardClickListener(callback);

    const playBtn = view.container.querySelector('button.mode-play-btn') as HTMLButtonElement;
    playBtn.click();

    expect(callback).toHaveBeenCalledWith('arcade');

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
