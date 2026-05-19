/**
 * AudioSystem — synthesises game sound effects using the Web Audio API.
 * Zero file footprint: all sounds are generated procedurally at runtime.
 *
 * In environments without Web Audio support (e.g. Node.js test runner)
 * every method silently no-ops, so the rest of the game is unaffected.
 */
export class AudioSystem {
  private ctx: AudioContext | null = null;
  private unlocked = false;

  /** Initialise the AudioContext — safe to call multiple times. */
  init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
      this.unlocked = true;
    } catch {
      // Web Audio not available (e.g. SSR, old browser, test env)
    }
  }

  /**
   * Unlock audio playback — must be called from a user-gesture handler
   * (click / keydown) to satisfy browser autoplay policies.
   */
  unlock(): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
    this.unlocked = true;
  }

  // ------------------------------------------------------------------  internals

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.1,
    frequencyEnd?: number,
  ): void {
    if (!this.ctx || !this.unlocked) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    if (frequencyEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(frequencyEnd, 20),
        this.ctx.currentTime + duration,
      );
    }

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  private playNoise(duration: number, volume: number = 0.05): void {
    if (!this.ctx || !this.unlocked) return;

    const bufferSize = Math.max(1, Math.ceil(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * volume;
    }

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(this.ctx.currentTime);
  }

  // ------------------------------------------------------------------  public SFX

  /** Shooting — square wave with rapid frequency decay, short "pew". */
  playShoot(): void {
    this.playTone(880, 0.08, 'square', 0.08, 220);
  }

  /** Bullet hit — white noise burst, short "thwack". */
  playHit(): void {
    this.playNoise(0.05, 0.06);
  }

  /** Item pickup — rising triangle-wave arpegio, bright "ding". */
  playPickup(): void {
    this.playTone(523, 0.1, 'triangle', 0.08);
    setTimeout(() => this.playTone(784, 0.1, 'triangle', 0.08), 80);
  }

  /** Player hurt — low square wave with long decay, buzzy "ow". */
  playHurt(): void {
    this.playTone(150, 0.3, 'square', 0.1, 50);
  }

  /** Death — square wave rapid descent, descending "wahhh". */
  playDeath(): void {
    this.playTone(400, 0.5, 'square', 0.12, 30);
  }

  /** Extraction success — ascending C-E-G-C arpeggio, triumphant "ta-da!". */
  playExtract(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'triangle', 0.1), i * 100);
    });
  }
}
