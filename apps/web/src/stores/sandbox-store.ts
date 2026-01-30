import { create } from "zustand";

export type Scale = 8 | 16 | 24 | 32;
export type VisualState = "superposed" | "collapsed";
export type Background = "garden" | "white" | "dark" | "checkerboard";

interface SandboxState {
  // View settings
  scale: Scale;
  visualState: VisualState;
  background: Background;
  showGrid: boolean;

  // Selection (null = show all)
  selectedPatternIndex: number | null;
  selectedPaletteIndex: number | null;

  // Actions
  setScale: (scale: Scale) => void;
  setVisualState: (state: VisualState) => void;
  setBackground: (bg: Background) => void;
  toggleGrid: () => void;
  selectPattern: (index: number | null) => void;
  selectPalette: (index: number | null) => void;
  reset: () => void;
}

export const useSandboxStore = create<SandboxState>((set) => ({
  // View settings
  scale: 16,
  visualState: "collapsed",
  background: "garden",
  showGrid: false,

  // Selection
  selectedPatternIndex: null,
  selectedPaletteIndex: null,

  // Actions
  setScale: (scale) => set({ scale }),
  setVisualState: (visualState) => set({ visualState }),
  setBackground: (background) => set({ background }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  selectPattern: (index) => set({ selectedPatternIndex: index }),
  selectPalette: (index) => set({ selectedPaletteIndex: index }),
  reset: () =>
    set({
      scale: 16,
      visualState: "collapsed",
      background: "garden",
      showGrid: false,
      selectedPatternIndex: null,
      selectedPaletteIndex: null,
    }),
}));
