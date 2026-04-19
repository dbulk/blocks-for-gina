type SessionUIState = 'preGame' | 'inGame' | 'paused' | 'gameOverSummary';

type OverlayKey = 'start' | 'gameOver';

interface OverlayView {
  container: HTMLDivElement
  setVisible: (visible: boolean) => void
}

class OverlayManager {
  private readonly layer: HTMLDivElement;
  private readonly overlays = new Map<OverlayKey, OverlayView>();

  constructor (layer: HTMLDivElement) {
    this.layer = layer;
  }

  register (key: OverlayKey, overlay: OverlayView): void {
    this.overlays.set(key, overlay);
    this.layer.appendChild(overlay.container);
  }

  setState (state: SessionUIState): void {
    switch (state) {
      case 'preGame':
        this.setLayerVisibility(true);
        this.setOverlayVisibility('start', true);
        this.setOverlayVisibility('gameOver', false);
        return;
      case 'gameOverSummary':
        this.setLayerVisibility(true);
        this.setOverlayVisibility('start', false);
        this.setOverlayVisibility('gameOver', true);
        return;
      case 'inGame':
      case 'paused':
      default:
        this.setLayerVisibility(false);
        this.setOverlayVisibility('start', false);
        this.setOverlayVisibility('gameOver', false);
    }
  }

  private setLayerVisibility (visible: boolean): void {
    this.layer.style.display = visible ? 'block' : 'none';
  }

  private setOverlayVisibility (key: OverlayKey, visible: boolean): void {
    this.overlays.get(key)?.setVisible(visible);
  }
}

export default OverlayManager;
export type { SessionUIState };
