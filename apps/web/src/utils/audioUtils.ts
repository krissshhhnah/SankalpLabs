/**
 * Web Audio API synthesizer for workshop alerts and audio cues.
 * Completely synthesized client-side with zero external assets/files.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
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

  /**
   * Plays a resonant Tibetan singing bowl / workshop gong chime.
   * Multi-frequency harmonic decay that sounds serene and elegant.
   */
  public playChime(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // D major pentatonic overtone series for crystal-clear alert
      const harmonics = [
        { freq: 587.33, gain: 0.35, decay: 3.2 },  // D5 (Fundamental)
        { freq: 880.0, gain: 0.22, decay: 2.8 },   // A5
        { freq: 1174.66, gain: 0.16, decay: 2.4 }, // D6
        { freq: 1479.98, gain: 0.10, decay: 1.8 }, // F#6
        { freq: 1760.0, gain: 0.08, decay: 1.5 },  // A6
      ];

      harmonics.forEach(({ freq, gain: targetGain, decay }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle attack followed by exponential natural resonance decay
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(targetGain, now + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + decay + 0.1);
      });
    } catch (e) {
      console.warn('Unable to play audio chime:', e);
    }
  }

  /**
   * Deep meditation gong sound for workshop timer completion.
   */
  public playDeepGong(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const baseFreq = 220; // A3

      [1, 1.414, 2.01, 2.76].forEach((ratio, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * ratio, now);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.3 / (idx + 1), now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.6);
      });
    } catch (e) {
      console.warn('Unable to play gong sound:', e);
    }
  }

  /**
   * Subtle pleasant micro-interaction tick
   */
  public playClick(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }
}

export const soundEffects = new SoundEffects();
