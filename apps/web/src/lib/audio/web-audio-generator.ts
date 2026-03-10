/**
 * Web Audio Generator - Procedural sound synthesis
 *
 * Generates sounds programmatically using the Web Audio API.
 * No audio files required - all sounds are synthesized in real-time.
 *
 * Sound Philosophy:
 * - Germination: Bright, ascending chimes (pentatonic scale)
 * - Observation: Warm tones mapped to plant palette color
 * - Entanglement: Harmonic intervals (5ths) suggesting connection
 * - Ambient: Handled by file-based MP3 loop (see audio-manager.ts)
 */

/** Pentatonic scale intervals (semitones from root) */
const PENTATONIC_SCALE = [0, 2, 4, 7, 9, 12, 14, 16];

/** Base frequency for middle C (C4) */
const BASE_FREQ = 261.63;

/** Sound generation parameters */
const PARAMS = {
  /** Master gain for all generated sounds */
  MASTER_GAIN: 0.3,

  /** Germination chime settings */
  GERMINATION: {
    /** Duration in seconds */
    DURATION: 0.5,
    /** Attack time in seconds */
    ATTACK: 0.02,
    /** Decay time in seconds */
    DECAY: 0.3,
    /** Base octave (4 = middle C) */
    OCTAVE: 5,
    /** Number of random notes to play */
    NOTE_COUNT: 3,
    /** Delay between notes */
    NOTE_DELAY: 0.08,
  },

  /** Observation tone settings */
  OBSERVATION: {
    /** Duration in seconds */
    DURATION: 0.8,
    /** Attack time */
    ATTACK: 0.05,
    /** Release time */
    RELEASE: 0.4,
    /** Base frequency multiplier */
    FREQ_BASE: 300,
    /** Frequency range */
    FREQ_RANGE: 200,
  },

  /** Entanglement harmony settings */
  ENTANGLEMENT: {
    /** Duration in seconds */
    DURATION: 1.2,
    /** Interval between notes (perfect 5th = 7 semitones) */
    INTERVAL: 7,
    /** Note delay */
    NOTE_DELAY: 0.15,
    /** Base octave */
    OCTAVE: 4,
  },
};

/**
 * WebAudioGenerator - Synthesizes sounds procedurally
 *
 * Uses Web Audio API oscillators, filters, and envelopes
 * to create musical sounds without audio files.
 */
export class WebAudioGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = false;

  /**
   * Initialize the audio context.
   * Must be called from a user gesture due to browser autoplay policies.
   */
  init(): void {
    if (this.ctx) return;

    this.ctx = new AudioContext();

    // Create master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = PARAMS.MASTER_GAIN;
    this.masterGain.connect(this.ctx.destination);
  }

  /**
   * Enable or disable sound generation.
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set master volume (0.0 to 1.0).
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(volume * PARAMS.MASTER_GAIN, this.ctx?.currentTime ?? 0);
    }
  }

  /**
   * Resume audio context if suspended.
   * Call this on user interaction if sounds don't play.
   */
  async resume(): Promise<void> {
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
  }

  /**
   * Convert a semitone offset to frequency.
   */
  private semitoneToFreq(semitones: number, baseOctave: number = 4): number {
    const octaveOffset = (baseOctave - 4) * 12;
    return BASE_FREQ * Math.pow(2, (semitones + octaveOffset) / 12);
  }

  /**
   * Get a random note from the pentatonic scale.
   */
  private randomPentatonicNote(octave: number = 4): number {
    const index = Math.floor(Math.random() * PENTATONIC_SCALE.length);
    return this.semitoneToFreq(PENTATONIC_SCALE[index]!, octave);
  }

  /**
   * Play a germination chime - bright, ascending tones.
   *
   * @param pan - Stereo pan position (-1 to 1)
   */
  playGerminationChime(pan: number = 0): void {
    if (!this.ctx || !this.masterGain || !this.isEnabled) return;

    const now = this.ctx.currentTime;
    const { DURATION, ATTACK, OCTAVE, NOTE_COUNT, NOTE_DELAY } = PARAMS.GERMINATION;

    // Create stereo panner
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    panner.connect(this.masterGain);

    // Play multiple ascending notes
    for (let i = 0; i < NOTE_COUNT; i++) {
      const noteTime = now + i * NOTE_DELAY;
      const freq = this.randomPentatonicNote(OCTAVE);

      // Create oscillator
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      // Create gain envelope
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.3, noteTime + ATTACK);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + DURATION);

      // Connect and play
      osc.connect(gain);
      gain.connect(panner);

      osc.start(noteTime);
      osc.stop(noteTime + DURATION);
    }

    // Clean up panner after all notes finish
    setTimeout(
      () => {
        panner.disconnect();
      },
      (DURATION + NOTE_DELAY * NOTE_COUNT) * 1000 + 100
    );
  }

  /**
   * Play an observation tone - warm sound mapped to palette hue.
   *
   * @param hue - Color hue (0-360) to map to frequency
   * @param pan - Stereo pan position (-1 to 1)
   */
  playObservationTone(hue: number, pan: number = 0): void {
    if (!this.ctx || !this.masterGain || !this.isEnabled) return;

    const now = this.ctx.currentTime;
    const { DURATION, ATTACK, RELEASE, FREQ_BASE, FREQ_RANGE } = PARAMS.OBSERVATION;

    // Map hue (0-360) to frequency
    const normalizedHue = ((hue % 360) + 360) % 360;
    const freq = FREQ_BASE + (normalizedHue / 360) * FREQ_RANGE;

    // Create stereo panner
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    panner.connect(this.masterGain);

    // Create main oscillator (warm triangle wave)
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    // Add subtle harmonic
    const osc2 = this.ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = freq * 2; // Octave up

    // Create gain envelope
    const gain = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    // Main oscillator envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + ATTACK);
    gain.gain.setValueAtTime(0.25, now + DURATION - RELEASE);
    gain.gain.exponentialRampToValueAtTime(0.001, now + DURATION);

    // Harmonic at lower volume
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + ATTACK);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + DURATION);

    // Connect
    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(panner);
    gain2.connect(panner);

    // Play
    osc.start(now);
    osc2.start(now);
    osc.stop(now + DURATION);
    osc2.stop(now + DURATION);

    // Clean up
    setTimeout(
      () => {
        panner.disconnect();
      },
      DURATION * 1000 + 100
    );
  }

  /**
   * Play entanglement harmony - two notes a perfect 5th apart.
   *
   * @param pan - Stereo pan position (-1 to 1)
   */
  playEntanglementHarmony(pan: number = 0): void {
    if (!this.ctx || !this.masterGain || !this.isEnabled) return;

    const now = this.ctx.currentTime;
    const { DURATION, INTERVAL, NOTE_DELAY, OCTAVE } = PARAMS.ENTANGLEMENT;

    // Create stereo panner
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    panner.connect(this.masterGain);

    // Pick a random root note from pentatonic scale
    const rootIndex = Math.floor(Math.random() * 5); // Only first 5 to stay in range
    const rootFreq = this.semitoneToFreq(PENTATONIC_SCALE[rootIndex]!, OCTAVE);
    const fifthFreq = rootFreq * Math.pow(2, INTERVAL / 12);

    // Play root note
    this.playNote(rootFreq, now, DURATION, panner);

    // Play fifth after delay
    this.playNote(fifthFreq, now + NOTE_DELAY, DURATION - NOTE_DELAY, panner);

    // Clean up
    setTimeout(
      () => {
        panner.disconnect();
      },
      DURATION * 1000 + 100
    );
  }

  /**
   * Play a single note with envelope.
   */
  private playNote(
    freq: number,
    startTime: number,
    duration: number,
    destination: AudioNode
  ): void {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gain.gain.setValueAtTime(0.2, startTime + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Dispose of all resources.
   */
  dispose(): void {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }

    this.masterGain = null;
  }
}

/**
 * Singleton instance of the Web Audio Generator.
 */
export const webAudioGenerator = new WebAudioGenerator();
