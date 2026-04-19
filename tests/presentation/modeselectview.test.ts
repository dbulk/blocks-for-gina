// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import ModeSelectView from '@/presentation/modeselectview';

describe('ModeSelectView', () => {
  it('renders with arcade and sandbox play buttons', () => {
    const view = new ModeSelectView();
    document.body.appendChild(view.container);

    const buttons = view.container.querySelectorAll('button.mode-card-play');
    expect(buttons.length).toBe(2);

    const modeIds = Array.from(buttons).map((btn) => (btn as HTMLButtonElement).dataset.modeId);
    expect(modeIds).toContain('arcade');
    expect(modeIds).toContain('sandbox');

    document.body.removeChild(view.container);
  });

  it('clicking arcade card calls callback with "arcade"', () => {
    const view = new ModeSelectView();
    document.body.appendChild(view.container);
    const callback = vi.fn();
    view.addModeCardClickListener(callback);

    const arcadeBtn = view.container.querySelector('button[data-mode-id="arcade"]') as HTMLButtonElement;
    arcadeBtn.click();

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('arcade');

    document.body.removeChild(view.container);
  });

  it('clicking sandbox card calls callback with "sandbox"', () => {
    const view = new ModeSelectView();
    document.body.appendChild(view.container);
    const callback = vi.fn();
    view.addModeCardClickListener(callback);

    const sandboxBtn = view.container.querySelector('button[data-mode-id="sandbox"]') as HTMLButtonElement;
    sandboxBtn.click();

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('sandbox');

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
