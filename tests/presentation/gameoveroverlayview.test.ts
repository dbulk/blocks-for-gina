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

  it('shows Time\'s Up title for timed mode', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);

    view.setSummary('timed', 500, '01:00', 40, 10, 8, 20, [], null, null, false);

    expect(view.container.textContent).toContain("Time's Up!");
    expect(view.container.textContent).not.toContain('Game Over');

    document.body.removeChild(view.container);
  });

  it('shows Game Over title for arcade mode', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);

    view.setSummary('arcade', 200, '00:45', 20, 0, 5, 10, [], null, null, false);

    expect(view.container.textContent).toContain('Game Over');
    expect(view.container.textContent).not.toContain("Time's Up!");

    document.body.removeChild(view.container);
  });

  it('hides blocks remaining card for timed mode', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);

    view.setSummary('timed', 300, '01:00', 35, 15, 6, 18, [], null, null, false);
    const cards = Array.from(view.container.querySelectorAll('div[style*="border"]'));
    const remainingCard = cards.find(c => c.textContent?.includes('Blocks Remaining'));

    expect((remainingCard as HTMLElement | undefined)?.style.display).toBe('none');

    document.body.removeChild(view.container);
  });

  it('shows sprint title and move budget usage in summary', () => {
    const view = new GameOverOverlayView();
    document.body.appendChild(view.container);

    view.setSummary('sprint', 240, '00:30', 22, 8, 5, 9, [], null, null, false);

    expect(view.container.textContent).toContain('Sprint Complete!');
    expect(view.container.textContent).toContain('9/10');

    document.body.removeChild(view.container);
  });
});
