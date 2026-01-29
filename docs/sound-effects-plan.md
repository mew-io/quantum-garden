# Sound Effects System Plan

_Created: 2026-01-29_
_Status: Planning (not yet implemented)_

---

## Overview

This document outlines the plan for adding ambient sound effects to enhance the Quantum Garden experience. Sound is optional and designed to complement the meditative, contemplative nature of observing quantum phenomena.

---

## Design Philosophy

### Guiding Principles

1. **Meditative, not distracting** - Sounds should enhance calm observation, never startle or interrupt
2. **Optional by default** - Sound starts muted; users opt-in when ready
3. **Minimal and purposeful** - Each sound has a clear role; avoid sonic clutter
4. **Responsive to actions** - Feedback sounds acknowledge user interactions
5. **Spatially aware** - Sounds positioned relative to where events occur (optional)

### Inspiration

- Ambient games: Journey, Flower, Proteus
- Nature soundscapes: Rain, wind through leaves, gentle chimes
- Scientific aesthetics: Soft electronic tones, crystalline resonances

---

## Sound Categories

### 1. Ambient Background (Continuous)

Low-volume atmospheric loop that plays while the garden is active.

| Sound           | Description                 | Behavior                         |
| --------------- | --------------------------- | -------------------------------- |
| Garden ambience | Soft wind, distant nature   | Loops continuously at low volume |
| Quantum hum     | Subtle electronic undertone | Optional overlay, very quiet     |

**Characteristics:**

- 2-3 minute seamless loops
- Volume: 15-25% max
- Crossfade on loop restart

### 2. Evolution Events (Triggered)

Sounds that play when plants germinate or evolve.

| Event             | Sound           | Description                                    |
| ----------------- | --------------- | ---------------------------------------------- |
| Germination       | Soft chime      | Gentle bell or crystal tone when plant sprouts |
| Wave germination  | Multiple chimes | Cascading tones for multi-plant germination    |
| First observation | Special tone    | Unique sound for user's first-ever observation |

**Characteristics:**

- Short (0.5-2 seconds)
- Soft attack, gentle decay
- Can overlap (polyphony for wave events)

### 3. Observation Feedback (Triggered)

Sounds that acknowledge user observations.

| Event                | Sound          | Description                                          |
| -------------------- | -------------- | ---------------------------------------------------- |
| Observation complete | Resonant tone  | Confirmation when plant collapses from superposition |
| Entanglement reveal  | Harmonic chord | When entangled partners are revealed together        |

**Characteristics:**

- Slightly more prominent than evolution sounds
- Harmonic relationship between observation sounds
- Spatial positioning based on plant location (stereo pan)

### 4. UI Feedback (Triggered)

Subtle sounds for interface interactions.

| Event             | Sound             | Description                                 |
| ----------------- | ----------------- | ------------------------------------------- |
| Panel open/close  | Soft click        | Confirmation for debug panel, context panel |
| Time-travel scrub | Scrubbing texture | Subtle texture while dragging timeline      |
| Button hover      | Micro-tone        | Very subtle (optional, may omit)            |

**Characteristics:**

- Extremely subtle, almost subliminal
- Fast response (no latency)
- Should not fatigue with repetition

---

## Technical Approach

### Recommended Library: Howler.js

**Rationale:**

- Mature, well-maintained library (MIT license)
- Handles Web Audio API complexity
- Automatic format fallback (MP3 → OGG)
- Sprite support for multiple sounds in one file
- Volume control, fade, spatial audio
- Small footprint (~10KB gzipped)

**Alternative: Web Audio API directly**

- More control but more code
- Consider for v2 if complex spatial audio needed

### Architecture

```
apps/web/src/
├── lib/
│   └── audio/
│       ├── audio-manager.ts    # Singleton managing all audio
│       ├── sound-sprites.ts    # Sound definitions and timing
│       └── hooks/
│           └── use-audio.ts    # React hook for components
├── public/
│   └── sounds/
│       ├── ambient-loop.mp3    # Background ambience
│       ├── effects.mp3         # Sprite sheet for short sounds
│       └── effects.ogg         # OGG fallback
```

### AudioManager Singleton

```typescript
// Conceptual API (not final implementation)
class AudioManager {
  // State
  private isMuted: boolean = true; // Start muted
  private masterVolume: number = 0.7;

  // Initialization
  init(): void;

  // User preference
  setMuted(muted: boolean): void;
  setVolume(volume: number): void;

  // Playback
  playAmbient(): void;
  stopAmbient(): void;
  playEffect(name: SoundEffect, options?: { pan?: number }): void;

  // Cleanup
  dispose(): void;
}
```

### Sound Sprite Format

Combine short sounds into a single sprite sheet for efficient loading:

```typescript
const SOUND_SPRITES = {
  germination: [0, 1200], // Start: 0ms, Duration: 1200ms
  observation: [1300, 1500], // Start: 1300ms, Duration: 1500ms
  entanglement: [2900, 2000], // Start: 2900ms, Duration: 2000ms
  waveChime1: [5000, 800],
  waveChime2: [5900, 800],
  waveChime3: [6800, 800],
  panelOpen: [7700, 200],
  panelClose: [8000, 200],
  firstObservation: [8300, 2500],
};
```

---

## User Preferences

### Controls

1. **Sound toggle** - Master on/off in toolbar
2. **Volume slider** - Available in settings/debug panel
3. **Persistence** - Store preference in localStorage

### Implementation

```typescript
// localStorage keys
const SOUND_PREF_KEYS = {
  ENABLED: "quantum-garden-sound-enabled",
  VOLUME: "quantum-garden-sound-volume",
};

// Default: sound disabled, volume at 70%
```

### UI Location

- Sound toggle button in toolbar (speaker icon)
- Volume slider in debug panel under "Audio" section
- Consider: settings modal for full control

---

## File Formats

### Primary: MP3

- Universal browser support
- Good compression for ambient loops
- Adequate quality at 128-192 kbps

### Fallback: OGG Vorbis

- Better quality at same bitrate
- Not supported in Safari (hence fallback)
- Howler.js handles format selection automatically

### Recommendations

| Sound Type     | Format  | Bitrate  | Sample Rate |
| -------------- | ------- | -------- | ----------- |
| Ambient loop   | MP3/OGG | 128 kbps | 44.1 kHz    |
| Effect sprites | MP3/OGG | 192 kbps | 44.1 kHz    |

### File Size Budget

- Ambient loop: ~1.5 MB (2 minutes)
- Effect sprites: ~200 KB (all effects combined)
- **Total: ~1.7 MB** (lazy loaded, not blocking)

---

## Loading Strategy

### Lazy Loading

1. **Page load**: No audio files loaded
2. **User enables sound**: Load ambient loop
3. **First interaction**: Preload effect sprites
4. **Background loading**: Don't block UI

### Implementation

```typescript
// Triggered when user enables sound
async function initializeAudio() {
  // Load in parallel
  await Promise.all([loadAmbientLoop(), loadEffectSprites()]);

  // Start ambient after loaded
  audioManager.playAmbient();
}
```

---

## Integration Points

### Where to trigger sounds

| Location          | Sound   | Integration Point                                  |
| ----------------- | ------- | -------------------------------------------------- |
| Germination       | Chime   | `evolution-worker.ts` or store subscription        |
| Observation       | Tone    | `use-observation.ts` onSuccess                     |
| First observation | Special | `use-observation.ts` with first-obs check          |
| Entanglement      | Chord   | `use-observation.ts` when partners updated         |
| Panel toggle      | Click   | `debug-panel.tsx`, `observation-context-panel.tsx` |
| Time-travel       | Scrub   | `time-travel-scrubber.tsx` on drag                 |

### React Hook Usage

```typescript
// In component
const { playEffect } = useAudio();

// On observation
useEffect(() => {
  if (observationResult) {
    playEffect("observation", { pan: calculatePan(plant.position) });
  }
}, [observationResult]);
```

---

## Implementation Tasks

### Phase 1: Foundation (1 session)

- [ ] Install Howler.js dependency
- [ ] Create AudioManager singleton
- [ ] Implement mute/volume controls
- [ ] Add sound toggle to toolbar
- [ ] Store preferences in localStorage

### Phase 2: Ambient Audio (1 session)

- [ ] Source or create ambient loop (royalty-free)
- [ ] Implement ambient playback with crossfade
- [ ] Connect to user preference state
- [ ] Handle browser autoplay restrictions

### Phase 3: Effect Sounds (1-2 sessions)

- [ ] Source or create effect sounds
- [ ] Create sprite sheet
- [ ] Implement sprite playback
- [ ] Integrate with observation system
- [ ] Integrate with evolution events

### Phase 4: Polish (1 session)

- [ ] Add volume slider to debug panel
- [ ] Fine-tune volumes and timing
- [ ] Test across browsers
- [ ] Add spatial panning for observations
- [ ] Consider: UI feedback sounds

---

## Sound Sources

### Royalty-Free Options

1. **Freesound.org** - Creative Commons sounds
2. **Zapsplat.com** - Free with attribution
3. **Sonniss.com GDC bundles** - Free professional sounds
4. **Custom creation** - Simple tones via Web Audio synthesis

### Sound Style Guide

- **Ambient**: Natural, organic, wind-like
- **Evolution**: Crystalline, bell-like, organic growth
- **Observation**: Electronic but warm, quantum-inspired
- **UI**: Minimal, almost imperceptible

---

## Browser Considerations

### Autoplay Policy

Modern browsers block audio autoplay until user interaction:

```typescript
// Must be called from user gesture (click, tap)
function enableSound() {
  audioContext.resume(); // Required in some browsers
  audioManager.init();
}
```

### Safari Specific

- Requires user interaction before any audio
- OGG not supported (MP3 fallback essential)
- Web Audio context may need unlocking

---

## Success Metrics

1. **Enhances experience** - User feedback that sound adds to meditation
2. **Not intrusive** - No complaints about sound being distracting
3. **Performant** - No frame drops or audio glitches
4. **Accessible** - Easy to disable, remembers preference

---

## Open Questions

1. **Sound creation**: Commission custom sounds or use royalty-free?
2. **Spatial audio**: Worth the complexity for stereo panning?
3. **Mobile**: Different volume/behavior for mobile devices?
4. **Accessibility**: Should screen readers announce sound state?

---

## References

- [Howler.js Documentation](https://howlerjs.com/)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay/)

---

_This plan will be refined during implementation. See TASKS.md for current status._
