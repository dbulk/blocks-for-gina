class GameLoopManager {
  private rafId: number | null = null;

  start (tick: () => void): void {
    if (this.rafId !== null) {
      return;
    }

    const run = (): void => {
      tick();
      this.rafId = requestAnimationFrame(run);
    };

    this.rafId = requestAnimationFrame(run);
  }

  stop (): void {
    if (this.rafId === null) {
      return;
    }

    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}

export default GameLoopManager;
