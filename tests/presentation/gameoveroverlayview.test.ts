// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import GameOverOverlayView from '@/presentation/gameoveroverlayview';

describe('GameOverOverlayView', () => {
  it('renders Play Again button', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);

    const primary = view.container.querySelector('button.game-over-action-primary');

    expect(primary).not.toBeNull();
    expect(primary?.textContent).toBe('New Game');

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

  it('clicking Play Again fires play-again callback only once', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);
    const playAgain = vi.fn();
    view.addPlayAgainClickListener(playAgain);

    (view.container.querySelector('button.game-over-action-primary') as HTMLButtonElement).click();

    expect(playAgain).toHaveBeenCalledOnce();
    document.body.removeChild(view.container);
  });

  it('setVisible(false) hides the container', () => {
    const view = new GameOverOverlayView();
    view.setVisible(false);
    expect(view.container.style.display).toBe('none');
  });

  it('renders sandbox personal best summary instead of ranked highscores', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);

    view.setSummary('sandbox', 120, '01:15', 10, 5, 4, 6, [], null, {
      score: 140,
      elapsedSeconds: 70,
      rows: 8,
      columns: 12,
      playedAt: 1
    }, true);

    expect(view.container.textContent).toContain('Sandbox Personal Best');
    expect(view.container.textContent).toContain('New personal best');
    expect(view.container.textContent).toContain('140 pts');
    expect(view.container.textContent).not.toContain('High Scores');

    document.body.removeChild(view.container);
  });
});
