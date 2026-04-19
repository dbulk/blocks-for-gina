class AudioController {
  private readonly soundEffect: HTMLAudioElement;
  private readonly music: HTMLAudioElement;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;

  constructor (soundEffectSrc: string, musicSrc: string) {
    this.soundEffect = new Audio(soundEffectSrc);
    this.music = new Audio(musicSrc);
    this.music.loop = true;
  }

  startMusic (): void {
    this.setMusicEnabled(this.musicEnabled);
  }

  setMusicEnabled (enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.music.play().catch(() => { });
      return;
    }

    this.music.pause();
  }

  setSoundEnabled (enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  applySettings (isMusicEnabled: boolean, isSoundEnabled: boolean): void {
    this.setMusicEnabled(isMusicEnabled);
    this.setSoundEnabled(isSoundEnabled);
  }

  playSoundEffect (): void {
    if (!this.soundEnabled) {
      return;
    }

    this.soundEffect.currentTime = 0;
    this.soundEffect.play().catch(() => { });
  }
}

export default AudioController;
