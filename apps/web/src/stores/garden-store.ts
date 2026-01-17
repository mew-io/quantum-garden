import { create } from "zustand";
import type { Plant, ObservationRegion, Reticle, Position } from "@quantum-garden/shared";

/**
 * Client-side garden state.
 *
 * Manages the visual and interactive state of the garden,
 * separate from server-persisted data.
 */
interface GardenState {
  // Plants loaded from server
  plants: Plant[];
  setPlants: (plants: Plant[]) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;

  // Active observation region (never rendered, but tracked for logic)
  activeRegion: ObservationRegion | null;
  setActiveRegion: (region: ObservationRegion | null) => void;

  // Reticle state
  reticle: Reticle | null;
  setReticle: (reticle: Reticle) => void;
  updateReticlePosition: (position: Position) => void;

  // Dwell tracking
  dwellTarget: string | null; // Plant ID currently being dwelled on
  dwellProgress: number; // 0-1 progress toward observation
  setDwellTarget: (plantId: string | null) => void;
  setDwellProgress: (progress: number) => void;
  resetDwell: () => void;

  // System state
  isInCooldown: boolean;
  setIsInCooldown: (inCooldown: boolean) => void;
}

export const useGardenStore = create<GardenState>((set) => ({
  // Plants
  plants: [],
  setPlants: (plants) => set({ plants }),
  updatePlant: (id, updates) =>
    set((state) => ({
      plants: state.plants.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  // Observation region
  activeRegion: null,
  setActiveRegion: (region) => set({ activeRegion: region }),

  // Reticle
  reticle: null,
  setReticle: (reticle) => set({ reticle }),
  updateReticlePosition: (position) =>
    set((state) => ({
      reticle: state.reticle ? { ...state.reticle, position } : null,
    })),

  // Dwell
  dwellTarget: null,
  dwellProgress: 0,
  setDwellTarget: (plantId) => set({ dwellTarget: plantId }),
  setDwellProgress: (progress) => set({ dwellProgress: progress }),
  resetDwell: () => set({ dwellTarget: null, dwellProgress: 0 }),

  // System
  isInCooldown: false,
  setIsInCooldown: (inCooldown) => set({ isInCooldown: inCooldown }),
}));
