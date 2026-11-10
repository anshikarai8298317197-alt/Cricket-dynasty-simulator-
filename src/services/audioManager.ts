/**
 * WICKET DYNASTY - Web Audio API Sound Effects Engine (Phase 05)
 * Synthesizes bat-ball contact, crowd cheers, boundary stingers, and wickets
 */

export class AudioManager {
  private static ctx: AudioContext | null = null;
  private static masterVolume: number = 0.8;
  private static sfxVolume: number = 0.8;
  private static crowdVolume: number = 0.7;
  private static isMuted: boolean = false;

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  static setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  static getMuted(): boolean {
    return this.isMuted;
  }

  static setVolumes(master: number, sfx: number, crowd: number) {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.crowdVolume = Math.max(0, Math.min(1, crowd));
  }

  /**
   * Crisp willow bat-ball contact crack
   */
  static playBatCrack() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

    const vol = this.masterVolume * this.sfxVolume * 0.9;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  /**
   * Turf bounce thud
   */
  static playBallBounce() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.06);

    const vol = this.masterVolume * this.sfxVolume * 0.4;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  /**
   * Four boundary cheer & celebratory audio tone
   */
  static playBoundaryFour() {
    if (this.isMuted) return;
    this.playBatCrack();
    const ctx = this.getContext();
    if (!ctx) return;

    // Fast arpeggiated celebratory chord
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + i * 0.06;
      const vol = this.masterVolume * this.crowdVolume * 0.25;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  /**
   * Massive six crowd roar & deep stinger
   */
  static playBoundarySix() {
    if (this.isMuted) return;
    this.playBatCrack();
    const ctx = this.getContext();
    if (!ctx) return;

    // Colossal multi-tone horn
    const freqs = [329.63, 440, 554.37, 659.25];
    freqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const vol = this.masterVolume * this.crowdVolume * 0.15;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    });
  }

  /**
   * Stumps shattered / wicket roar
   */
  static playWicket() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Wood crash + downward pitch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);

    const vol = this.masterVolume * this.sfxVolume * 0.5;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  /**
   * UI Click
   */
  static playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }
}
