import type GameState from './gamestate';
import type { HudMetric } from './hudmetric';

class HudPresenter {
  getMetrics (gameState: GameState): HudMetric[] {
    const blocksSelected = gameState.getNumBlocksToPop();
    const score = gameState.getScore();
    const selectedScore = gameState.getPopListScore();
    const remainingBlocks = gameState.getNumBlocksRemaining();

    const t = gameState.getPlayedDuration();
    const h = t.hours > 0 ? `${t.hours}:` : '';
    const m = t.minutes.toString().padStart(2, '0');
    const s = t.seconds.toString().padStart(2, '0');
    const clock = `${h}${m}:${s}`;

    return [
      {
        key: 'blocks',
        label: 'Blocks',
        value: remainingBlocks.toString(),
        delta: blocksSelected > 0 ? `${blocksSelected} selected` : undefined,
        tone: blocksSelected > 0 ? 'accent' : 'default',
        order: 10,
        visible: true
      },
      {
        key: 'time',
        label: 'Time',
        value: clock,
        order: 20,
        visible: true
      },
      {
        key: 'score',
        label: 'Score',
        value: score.toString(),
        delta: blocksSelected > 0 ? `+${selectedScore}` : undefined,
        tone: blocksSelected > 0 ? 'accent' : 'default',
        order: 30,
        visible: true
      }
    ];
  }
}

export default HudPresenter;
