import type GameState from '@/core/gamestate';
import type { HudMetric } from '@/presentation/hudmetric';
import { TIMED_MODE_DURATION_SECONDS, SPRINT_MODE_MAX_MOVES } from '@/core/moderules';
import { getModeMetadata } from '@/core/moderegistry';

class HudPresenter {
  getMetrics (gameState: GameState, modeId: string = 'arcade'): HudMetric[] {
    const blocksSelected = gameState.getNumBlocksToPop();
    const score = gameState.getScore();
    const selectedScore = gameState.getPopListScore();
    const remainingBlocks = gameState.getNumBlocksRemaining();

    const t = gameState.getPlayedDuration();
    const elapsedSeconds = t.hours * 3600 + t.minutes * 60 + t.seconds;

    const formatTime = (totalSeconds: number): string => {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return (h > 0 ? `${h}:` : '') + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
    };

    const modeLabel = getModeMetadata(modeId)?.name ?? modeId;

    const metrics: HudMetric[] = [
      {
        key: 'mode',
        label: 'Mode',
        value: modeLabel,
        order: 5,
        visible: true
      },
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
        label: modeId === 'timed' ? 'Time Left' : 'Time',
        value: modeId === 'timed'
          ? formatTime(Math.max(0, TIMED_MODE_DURATION_SECONDS - elapsedSeconds))
          : formatTime(elapsedSeconds),
        tone: modeId === 'timed' && (TIMED_MODE_DURATION_SECONDS - elapsedSeconds) <= 30 ? 'warning' : 'default',
        order: modeId === 'timed' ? 8 : 20,
        visible: modeId !== 'sprint' && modeId !== 'infinite'
      },
      {
        key: 'moves',
        label: 'Moves Left',
        value: Math.max(0, SPRINT_MODE_MAX_MOVES - gameState.getTotalMoves()).toString(),
        tone: (SPRINT_MODE_MAX_MOVES - gameState.getTotalMoves()) <= 5 ? 'warning' : 'default',
        order: 8,
        visible: modeId === 'sprint'
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

    return metrics;
  }
}

export default HudPresenter;
