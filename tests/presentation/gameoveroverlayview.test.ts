// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import GameOverOverlayView from '@/presentation/gameoveroverlayview';

describe('GameOverOverlayView', () => {
  it('renders Play Again and Change Mode buttons', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);

    const primary = view.container.querySelector('button.game-over-action-primary');
    const secondary = view.container.querySelector('button.game-over-action-secondary');

    expect(primary).not.toBeNull();
    expect(secondary).not.toBeNull();
    expect(primary?.textContent).toBe('Play Again');
    expect(secondary?.textContent).toBe('Change Mode');

    document.body.removeChild(view.container);
  });

  it('clicking Play Again fires play-again callback', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);
    const callback = vi.fn();
    view.addPlayAgainClickListener(callback);

    (view.container.querySelector('button.game-over-action-primary') as HTMLButtonElement).click();

    expect(callback).toHaveBeenCalledOnce();
    document.body.removeChild(view.container);
  });

  it('clicking Change Mode fires change-mode callback', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);
    const callback = vi.fn();
    view.addChangeModeClickListener(callback);

    (view.container.querySelector('button.game-over-action-secondary') as HTMLButtonElement).click();

    expect(callback).toHaveBeenCalledOnce();
    document.body.removeChild(view.container);
  });

  it('clicking Play Again does not fire change-mode callback', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);
    const playAgain = vi.fn();
    const changeMode = vi.fn();
    view.addPlayAgainClickListener(playAgain);
    view.addChangeModeClickListener(changeMode);

    (view.container.querySelector('button.game-over-action-primary') as HTMLButtonElement).click();

    expect(playAgain).toHaveBeenCalledOnce();
    expect(changeMode).not.toHaveBeenCalled();
    document.body.removeChild(view.container);
  });

  it('setVisible(false) hides the container', () => {
    const view = new GameOverOverlayView();
    view.setVisible(false);
    expect(view.container.style.display).toBe('none');
  });
});
