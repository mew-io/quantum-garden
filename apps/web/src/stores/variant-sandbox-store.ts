import { create } from "zustand";
import type { PlantVariant, GlyphKeyframe } from "@quantum-garden/shared";
import {
  PLANT_VARIANTS,
  getEffectiveKeyframes,
  getBaseTotalDuration,
} from "@quantum-garden/shared";

export type PlaybackSpeed = 0.5 | 1 | 2 | 5 | 10;
export type Background = "white" | "dark" | "checkerboard";
export type ViewMode = "gallery" | "detail";

interface VariantSandboxState {
  // View mode
  viewMode: ViewMode;

  // Variant selection
  selectedVariantId: string | null;
  selectedKeyframeIndex: number | null;
  selectedColorVariation: string | null;

  // Playback state
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  currentTime: number; // seconds into the lifecycle

  // View settings
  scale: number;
  background: Background;
  showGrid: boolean;

  // Editing state (for future keyframe editing)
  isDirty: boolean;
  editedKeyframes: Map<string, GlyphKeyframe>; // variantId:keyframeIndex -> edited keyframe

  // Computed helpers
  getSelectedVariant: () => PlantVariant | null;
  getCurrentKeyframeIndex: () => number;
  getKeyframeDurations: () => number[];
  getTotalDuration: () => number;

  // Actions
  selectVariant: (variantId: string | null) => void;
  selectKeyframe: (index: number | null) => void;
  selectColorVariation: (name: string | null) => void;

  // Playback actions
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setCurrentTime: (time: number) => void;
  seekToKeyframe: (index: number) => void;
  reset: () => void;

  // View actions
  setScale: (scale: number) => void;
  setBackground: (bg: Background) => void;
  toggleGrid: () => void;

  // Navigation actions
  setViewMode: (mode: ViewMode) => void;
  openVariantDetail: (variantId: string) => void;
  goToGallery: () => void;
}

export const useVariantSandboxStore = create<VariantSandboxState>((set, get) => ({
  // Initial state
  viewMode: "gallery",

  selectedVariantId: null,
  selectedKeyframeIndex: null,
  selectedColorVariation: null,

  isPlaying: false,
  playbackSpeed: 1,
  currentTime: 0,

  scale: 2,
  background: "dark",
  showGrid: false,

  isDirty: false,
  editedKeyframes: new Map(),

  // Computed helpers
  getSelectedVariant: () => {
    const { selectedVariantId } = get();
    if (!selectedVariantId) return null;
    return PLANT_VARIANTS.find((v) => v.id === selectedVariantId) ?? null;
  },

  getCurrentKeyframeIndex: () => {
    const variant = get().getSelectedVariant();
    if (!variant) return 0;

    const keyframes = getEffectiveKeyframes(variant);
    const { currentTime } = get();
    let accumulated = 0;

    for (let i = 0; i < keyframes.length; i++) {
      const keyframe = keyframes[i];
      if (!keyframe) continue;
      const duration = keyframe.duration;
      if (currentTime < accumulated + duration) {
        return i;
      }
      accumulated += duration;
    }

    // If variant loops, wrap around
    if (variant.loop) {
      const total = get().getTotalDuration();
      if (total > 0) {
        const wrappedTime = currentTime % total;
        return get().getCurrentKeyframeIndex.call({ ...get(), currentTime: wrappedTime });
      }
    }

    return keyframes.length - 1;
  },

  getKeyframeDurations: () => {
    const variant = get().getSelectedVariant();
    if (!variant) return [];
    return getEffectiveKeyframes(variant).map((kf) => kf.duration);
  },

  getTotalDuration: () => {
    const variant = get().getSelectedVariant();
    if (!variant) return 0;
    return getBaseTotalDuration(variant);
  },

  // Actions
  selectVariant: (variantId) =>
    set({
      selectedVariantId: variantId,
      selectedKeyframeIndex: null,
      selectedColorVariation: null,
      currentTime: 0,
      isPlaying: false,
    }),

  selectKeyframe: (index) => set({ selectedKeyframeIndex: index }),

  selectColorVariation: (name) => set({ selectedColorVariation: name }),

  // Playback actions
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  setCurrentTime: (time) => {
    const state = get();
    const total = state.getTotalDuration();
    const variant = state.getSelectedVariant();

    if (variant?.loop && total > 0) {
      // Loop: wrap time
      set({ currentTime: time % total });
    } else {
      // Clamp to [0, total]
      set({ currentTime: Math.max(0, Math.min(time, total)) });
    }
  },

  seekToKeyframe: (index) => {
    const variant = get().getSelectedVariant();
    if (!variant) return;

    const keyframes = getEffectiveKeyframes(variant);
    let time = 0;
    for (let i = 0; i < index && i < keyframes.length; i++) {
      time += keyframes[i]?.duration ?? 0;
    }
    set({ currentTime: time, selectedKeyframeIndex: index });
  },

  reset: () =>
    set({
      viewMode: "gallery",
      selectedVariantId: null,
      selectedKeyframeIndex: null,
      selectedColorVariation: null,
      isPlaying: false,
      playbackSpeed: 1,
      currentTime: 0,
      scale: 2,
      background: "dark",
      showGrid: false,
    }),

  // View actions
  setScale: (scale) => set({ scale }),
  setBackground: (background) => set({ background }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  // Navigation actions
  setViewMode: (mode) => set({ viewMode: mode }),
  openVariantDetail: (variantId) =>
    set({
      viewMode: "detail",
      selectedVariantId: variantId,
      selectedKeyframeIndex: null,
      selectedColorVariation: null,
      currentTime: 0,
      isPlaying: false,
    }),
  goToGallery: () =>
    set({
      viewMode: "gallery",
      isPlaying: false,
    }),
}));
