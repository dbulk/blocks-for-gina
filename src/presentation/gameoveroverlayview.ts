import type { HighScoreEntry } from '@/persistence/highscores';

class GameOverOverlayView {
  private readonly fadeDurationMs = 4000;
  readonly container: HTMLDivElement;
  private readonly title: HTMLDivElement;
  private readonly metricsGrid: HTMLDivElement;
  private readonly scoreValue: HTMLSpanElement;
  private readonly timeValue: HTMLSpanElement;
  private readonly blocksPoppedValue: HTMLSpanElement;
  private readonly blocksRemainingValue: HTMLSpanElement;
  private readonly largestClusterValue: HTMLSpanElement;
  private readonly movesValue: HTMLSpanElement;
  private readonly leaderboardTitle: HTMLDivElement;
  private readonly leaderboardList: HTMLDivElement;
  private readonly playAgainButton: HTMLButtonElement;

  constructor () {
    this.container = document.createElement('div');
    this.container.style.display = 'none';
    this.container.style.opacity = '0';
    this.container.style.transition = `opacity ${this.fadeDurationMs}ms ease, transform ${this.fadeDurationMs}ms ease`;
    this.container.style.position = 'absolute';
    this.container.style.left = '50%';
    this.container.style.top = '50%';
    this.container.style.transform = 'translate(-50%, -46%) scale(0.98)';
    this.container.style.width = 'min(90%, 420px)';
    this.container.style.padding = '10px 12px';
    this.container.style.border = '2px solid #0089b3';
    this.container.style.borderRadius = '8px';
    this.container.style.color = '#fff';
    this.container.style.textAlign = 'center';
    this.container.style.userSelect = 'none';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';

    this.title = document.createElement('div');
    this.title.textContent = 'Game Over';
    this.title.style.fontSize = '24px';
    this.title.style.fontWeight = '700';

    this.metricsGrid = document.createElement('div');
    this.metricsGrid.style.marginTop = '10px';
    this.metricsGrid.style.display = 'grid';
    this.metricsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
    this.metricsGrid.style.gap = '8px';

    this.scoreValue = this.createMetricCell('Score');
    this.timeValue = this.createMetricCell('Time');
    this.blocksPoppedValue = this.createMetricCell('Blocks Popped');
    this.blocksRemainingValue = this.createMetricCell('Blocks Remaining');
    this.largestClusterValue = this.createMetricCell('Largest Cluster');
    this.movesValue = this.createMetricCell('Moves');

    this.leaderboardTitle = document.createElement('div');
    this.leaderboardTitle.style.marginTop = '10px';
    this.leaderboardTitle.style.fontSize = '14px';
    this.leaderboardTitle.style.fontWeight = '700';
    this.leaderboardTitle.style.color = '#d5f4ff';
    this.leaderboardTitle.textContent = 'High Scores';

    this.leaderboardList = document.createElement('div');
    this.leaderboardList.style.marginTop = '6px';
    this.leaderboardList.style.display = 'grid';
    this.leaderboardList.style.gap = '4px';

    this.playAgainButton = document.createElement('button');
    this.playAgainButton.textContent = 'New Game';
    this.playAgainButton.className = 'game-over-action-primary';

    const actionRow = document.createElement('div');
    actionRow.className = 'game-over-action-row';
    actionRow.appendChild(this.playAgainButton);

    this.container.appendChild(this.title);
    this.container.appendChild(this.metricsGrid);
    this.container.appendChild(this.leaderboardTitle);
    this.container.appendChild(this.leaderboardList);
    this.container.appendChild(actionRow);
  }

  setVisible (onoff: boolean): void {
    if (onoff) {
      this.container.style.display = 'block';
      this.container.style.opacity = '0';
      this.container.style.transform = 'translate(-50%, -46%) scale(0.98)';
      this.container.getBoundingClientRect();
      this.container.style.opacity = '1';
      this.container.style.transform = 'translate(-50%, -50%) scale(1)';
      return;
    }

    this.container.style.opacity = '0';
    this.container.style.transform = 'translate(-50%, -46%) scale(0.98)';
    window.setTimeout(() => {
      if (this.container.style.opacity === '0') {
        this.container.style.display = 'none';
      }
    }, this.fadeDurationMs);
  }

  setSummary (
    score: number,
    time: string,
    blocksPopped: number,
    blocksRemaining: number,
    largestCluster: number,
    totalMoves: number,
    highScores: HighScoreEntry[],
    rank: number | null
  ): void {
    this.scoreValue.textContent = `${score}`;
    this.timeValue.textContent = time;
    this.blocksPoppedValue.textContent = `${blocksPopped}`;
    this.blocksRemainingValue.textContent = `${blocksRemaining}`;
    this.largestClusterValue.textContent = `${largestCluster}`;
    this.movesValue.textContent = `${totalMoves}`;
    this.renderLeaderboard(highScores, rank);
  }

  addPlayAgainClickListener (func: () => void): void {
    this.playAgainButton.addEventListener('click', func);
  }

  private createMetricCell (labelText: string): HTMLSpanElement {
    const card = document.createElement('div');
    card.style.border = '1px solid #0089b3';
    card.style.borderRadius = '8px';
    card.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    card.style.padding = '8px';
    card.style.textAlign = 'left';

    const label = document.createElement('div');
    label.textContent = labelText;
    label.style.fontSize = '12px';
    label.style.color = '#d5f4ff';
    label.style.lineHeight = '1.1';

    const value = document.createElement('span');
    value.textContent = '--';
    value.style.display = 'block';
    value.style.marginTop = '4px';
    value.style.fontSize = '18px';
    value.style.fontWeight = '700';
    value.style.lineHeight = '1.1';
    value.style.whiteSpace = 'nowrap';

    card.appendChild(label);
    card.appendChild(value);
    this.metricsGrid.appendChild(card);
    return value;
  }

  private renderLeaderboard (highScores: HighScoreEntry[], rank: number | null): void {
    this.leaderboardList.textContent = '';

    if (highScores.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No scores yet.';
      empty.style.fontSize = '13px';
      empty.style.color = '#ccc';
      this.leaderboardList.appendChild(empty);
      return;
    }

    const topToShow = highScores.slice(0, 5);
    for (let i = 0; i < topToShow.length; i++) {
      const entry = topToShow[i];
      const row = document.createElement('div');
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '28px 1fr auto';
      row.style.gap = '8px';
      row.style.alignItems = 'center';
      row.style.fontSize = '13px';
      row.style.padding = '3px 6px';
      row.style.borderRadius = '6px';
      row.style.backgroundColor = rank === i + 1 ? 'rgba(0, 137, 179, 0.18)' : 'rgba(0, 0, 0, 0.2)';

      const place = document.createElement('span');
      place.textContent = `#${i + 1}`;
      place.style.color = '#d5f4ff';

      const detail = document.createElement('span');
      detail.textContent = `${entry.score} pts • ${entry.rows}x${entry.columns}`;
      detail.style.color = '#fff';

      const time = document.createElement('span');
      time.textContent = this.formatSeconds(entry.elapsedSeconds);
      time.style.color = '#ccc';

      row.appendChild(place);
      row.appendChild(detail);
      row.appendChild(time);
      this.leaderboardList.appendChild(row);
    }

    if (rank !== null && rank > 5) {
      const note = document.createElement('div');
      note.textContent = `Your rank: #${rank}`;
      note.style.marginTop = '4px';
      note.style.fontSize = '12px';
      note.style.color = '#9dcfdf';
      this.leaderboardList.appendChild(note);
    }
  }

  private formatSeconds (totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(safeSeconds / 3600);
    const m = Math.floor((safeSeconds % 3600) / 60);
    const s = safeSeconds % 60;
    const hoursPrefix = h > 0 ? `${h}:` : '';
    return `${hoursPrefix}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}

export default GameOverOverlayView;
