/**
 * Procedural ambient sound generator using the Web Audio API.
 *
 * Produces a gentle, evolving pad by layering:
 *  - Filtered brown noise (wind-like texture)
 *  - Two detuned sine oscillators (warm tonal bed)
 *
 * This replaces the static MP3 file so we have zero dependency on
 * Git LFS or any external audio asset.
 */

/** Create a brown-noise source (random walk, −6 dB/octave roll-off). */
function createBrownNoise(ctx: AudioContext): AudioNode {
  const bufferSize = 2 * ctx.sampleRate; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5; // normalise amplitude
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Band-pass so it sounds like soft wind, not static
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 300;
  filter.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.value = 0.12;

  source.connect(filter);
  filter.connect(gain);
  source.start();

  return gain;
}

/** Create a soft sine-pad oscillator. */
function createPad(ctx: AudioContext, freq: number, vol: number): AudioNode {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;

  const gain = ctx.createGain();
  gain.gain.value = vol;

  osc.connect(gain);
  osc.start();

  return gain;
}

export interface AmbientHandle {
  /** Set output volume (0 – 1). */
  setVolume(v: number): void;
  /** Stop and release all resources. */
  stop(): void;
}

/**
 * Start a procedural ambient loop.
 *
 * @param volume  Initial volume (0 – 1).
 * @returns A handle to control or stop the ambient sound.
 */
export function startAmbient(volume: number): AmbientHandle {
  const ctx = new AudioContext();

  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);

  // Layer 1 – filtered brown noise (wind)
  const noise = createBrownNoise(ctx);
  noise.connect(master);

  // Layer 2 – two detuned sine pads (warm bed, ≈ C3 + slight detune)
  const pad1 = createPad(ctx, 131, 0.06); // C3
  const pad2 = createPad(ctx, 134, 0.06); // slightly sharp → slow beating

  pad1.connect(master);
  pad2.connect(master);

  return {
    setVolume(v: number) {
      master.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
    },
    stop() {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      // Allow the fade-out to finish before closing
      setTimeout(() => void ctx.close(), 500);
    },
  };
}
