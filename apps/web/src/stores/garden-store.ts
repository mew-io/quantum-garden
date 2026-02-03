import { create } from "zustand";
import {
  UI_TIMING,
  type Plant,
  type ObservationRegion,
  type Reticle,
  type Position,
  type QuantumEvent,
} from "@quantum-garden/shared";

/**
 * Notification type determines visual styling.
 */
export type NotificationType = "germination" | "wave" | "entanglement" | "error";

/**
 * Evolution event notification.
 */
export interface EvolutionNotification {
  id: string;
  message: string;
  timestamp: number;
  type: NotificationType;
}

/**
 * Context for the observation panel showing quantum circuit info.
 */
export interface ObservationContext {
  plantId: string;
  circuitId: string;
  isEntangled: boolean;
}

/**
 * Evolution system statistics.
 */
export interface EvolutionStats {
  dormantCount: number;
  trackedCount: number;
}

/**
 * Performance metrics from the render loop.
 */
export interface PerformanceStats {
  /** Frames per second (rolling average) */
  fps: number;
  /** Frame time in milliseconds (rolling average) */
  frameTimeMs: number;
  /** Number of draw calls in the last frame */
  drawCalls: number;
  /** Number of triangles rendered in the last frame */
  triangles: number;
}

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

  // Time-travel mode
  isTimeTravelMode: boolean;
  timeTravelTimestamp: Date | null;
  setTimeTravelMode: (enabled: boolean) => void;
  setTimeTravelTimestamp: (timestamp: Date | null) => void;

  // Evolution notifications
  notifications: EvolutionNotification[];
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;

  // Observation context panel
  observationContext: ObservationContext | null;
  setObservationContext: (context: ObservationContext) => void;
  clearObservationContext: () => void;

  // Evolution system state
  evolutionPaused: boolean;
  setEvolutionPaused: (paused: boolean) => void;
  evolutionStats: EvolutionStats | null;
  setEvolutionStats: (stats: EvolutionStats | null) => void;
  lastGerminationTime: number | null;
  setLastGerminationTime: (time: number | null) => void;

  // Quantum event log
  eventLog: QuantumEvent[];
  addEvent: (event: Omit<QuantumEvent, "id">) => void;
  clearEventLog: () => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  historicalEventsLoaded: boolean;
  setHistoricalEventsLoaded: (loaded: boolean) => void;

  // Performance monitoring
  performanceStats: PerformanceStats | null;
  setPerformanceStats: (stats: PerformanceStats | null) => void;

  // Entanglement detail panel
  entanglementRevealedGroupId: string | null;
  setEntanglementRevealed: (groupId: string | null) => void;
  getPartnerPlants: (groupId: string) => Plant[] | undefined;
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

  // Time-travel
  isTimeTravelMode: false,
  timeTravelTimestamp: null,
  setTimeTravelMode: (enabled) =>
    set({
      isTimeTravelMode: enabled,
      timeTravelTimestamp: enabled ? null : null, // Reset timestamp when disabled
    }),
  setTimeTravelTimestamp: (timestamp) => set({ timeTravelTimestamp: timestamp }),

  // Evolution notifications (max 3 visible at once)
  notifications: [],
  addNotification: (message, type = "germination") =>
    set((state) => {
      const newNotification: EvolutionNotification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        message,
        timestamp: Date.now(),
        type,
      };
      // Keep only the most recent notifications (max configured limit)
      const keepCount = UI_TIMING.MAX_NOTIFICATIONS - 1;
      const existingNotifications = state.notifications.slice(-keepCount);
      return {
        notifications: [...existingNotifications, newNotification],
      };
    }),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // Observation context panel
  observationContext: null,
  setObservationContext: (context) => set({ observationContext: context }),
  clearObservationContext: () => set({ observationContext: null }),

  // Evolution system state
  evolutionPaused: true, // Starts paused until system initializes
  setEvolutionPaused: (paused) => set({ evolutionPaused: paused }),
  evolutionStats: null,
  setEvolutionStats: (stats) => set({ evolutionStats: stats }),
  lastGerminationTime: null,
  setLastGerminationTime: (time) => set({ lastGerminationTime: time }),

  // Quantum event log (FIFO queue with max 50 events)
  eventLog: [],
  addEvent: (event) =>
    set((state) => {
      const newEvent: QuantumEvent = {
        ...event,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      // Keep only the most recent 50 events
      const updatedLog = [...state.eventLog, newEvent].slice(-50);
      return { eventLog: updatedLog };
    }),
  clearEventLog: () => set({ eventLog: [], historicalEventsLoaded: false }),
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  historicalEventsLoaded: false,
  setHistoricalEventsLoaded: (loaded) => set({ historicalEventsLoaded: loaded }),

  // Performance monitoring
  performanceStats: null,
  setPerformanceStats: (stats) => set({ performanceStats: stats }),

  // Entanglement detail panel
  entanglementRevealedGroupId: null,
  setEntanglementRevealed: (groupId: string | null) =>
    set({ entanglementRevealedGroupId: groupId }),
  getPartnerPlants: (groupId: string): Plant[] => {
    const state = useGardenStore.getState();
    return state.plants.filter((plant: Plant) => plant.entanglementGroupId === groupId);
  },
}));
