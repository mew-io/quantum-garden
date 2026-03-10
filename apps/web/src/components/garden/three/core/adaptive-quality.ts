/**
 * Adaptive Quality Manager - Automatic rendering quality adaptation
 *
 * Monitors FPS and adjusts rendering quality across 4 tiers to maintain
 * smooth performance on varying hardware. Uses hysteresis to prevent
 * oscillation between tiers.
 *
 * Tiers: ultra → high → medium → low
 *
 * Subsystems consume QualitySettings to adjust their rendering:
 * - SceneManager: pixel ratio, bloom, sparkle quality
 * - WatercolorPlantOverlay: frustum culling, layer count, segments
 * - PlantInstancer: shader quality (ghosts, HSV, atmospheric)
 * - OverlayManager: render target resolution
 * - QuantumParticleOverlay: particle count
 */

export type QualityTier = "ultra" | "high" | "medium" | "low";

export interface QualitySettings {
  tier: QualityTier;
  /** Renderer pixel ratio */
  pixelRatio: number;
  /** Whether bloom post-processing is enabled */
  bloomEnabled: boolean;
  /** Sparkle neighbor search radius (1 = 3x3, 0 = center only, -1 = disabled) */
  sparkleNeighborRadius: number;
  /** Shader quality level (0=ultra, 1=high, 2=medium, 3=low) */
  qualityLevel: number;
  /** Watercolor layer multiplier (1.0 = full, 0.6, 0.4, or fixed 2) */
  watercolorLayerScale: number;
  /** Watercolor fixed layer count (0 = use scale, >0 = fixed count) */
  watercolorFixedLayers: number;
  /** Shape geometry segments */
  shapeSegments: number;
  /** Tube geometry tubular segments */
  tubeTubularSegments: number;
  /** Tube geometry radial segments */
  tubeRadialSegments: number;
  /** Circle geometry segments */
  circleSegments: number;
  /** Max quantum particles */
  particleMax: number;
  /** Overlay render target resolution scale */
  overlayResolutionScale: number;
}

const TIER_ORDER: QualityTier[] = ["ultra", "high", "medium", "low"];

const TIER_SETTINGS: Record<QualityTier, QualitySettings> = {
  ultra: {
    tier: "ultra",
    pixelRatio: 2.0,
    bloomEnabled: true,
    sparkleNeighborRadius: 1,
    qualityLevel: 0,
    watercolorLayerScale: 1.0,
    watercolorFixedLayers: 0,
    shapeSegments: 16,
    tubeTubularSegments: 32,
    tubeRadialSegments: 6,
    circleSegments: 24,
    particleMax: 800,
    overlayResolutionScale: 1.0,
  },
  high: {
    tier: "high",
    pixelRatio: 1.5,
    bloomEnabled: true,
    sparkleNeighborRadius: 1,
    qualityLevel: 1,
    watercolorLayerScale: 0.6,
    watercolorFixedLayers: 0,
    shapeSegments: 12,
    tubeTubularSegments: 24,
    tubeRadialSegments: 4,
    circleSegments: 16,
    particleMax: 600,
    overlayResolutionScale: 1.0,
  },
  medium: {
    tier: "medium",
    pixelRatio: 1.0,
    bloomEnabled: false,
    sparkleNeighborRadius: 0,
    qualityLevel: 2,
    watercolorLayerScale: 0.4,
    watercolorFixedLayers: 0,
    shapeSegments: 8,
    tubeTubularSegments: 16,
    tubeRadialSegments: 4,
    circleSegments: 16,
    particleMax: 400,
    overlayResolutionScale: 0.75,
  },
  low: {
    tier: "low",
    pixelRatio: 0.75,
    bloomEnabled: false,
    sparkleNeighborRadius: -1,
    qualityLevel: 3,
    watercolorLayerScale: 0,
    watercolorFixedLayers: 2,
    shapeSegments: 6,
    tubeTubularSegments: 12,
    tubeRadialSegments: 3,
    circleSegments: 12,
    particleMax: 200,
    overlayResolutionScale: 0.5,
  },
};

/** Hysteresis configuration */
const HYSTERESIS = {
  /** FPS below this triggers downgrade */
  DOWN_THRESHOLD_FPS: 45,
  /** FPS above this triggers upgrade */
  UP_THRESHOLD_FPS: 55,
  /** How long FPS must stay below threshold to downgrade (ms) */
  DOWN_DELAY_MS: 2000,
  /** How long FPS must stay above threshold to upgrade (ms) */
  UP_DELAY_MS: 5000,
  /** Cooldown after any tier change (ms) */
  COOLDOWN_MS: 3000,
};

export type QualityChangeCallback = (settings: QualitySettings) => void;

export class AdaptiveQualityManager {
  private currentTierIndex: number = 0; // starts at ultra
  private downTimer: number = 0;
  private upTimer: number = 0;
  private cooldownTimer: number = 0;
  private locked: boolean = false;
  private forcedTier: QualityTier | null = null;
  private callbacks: QualityChangeCallback[] = [];
  private devicePixelRatio: number;

  constructor() {
    this.devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1;
    // Cap ultra pixel ratio to device's actual ratio
    TIER_SETTINGS.ultra.pixelRatio = Math.min(this.devicePixelRatio, 2.0);
    TIER_SETTINGS.high.pixelRatio = Math.min(this.devicePixelRatio, 1.5);
  }

  /** Get current quality settings. */
  get settings(): QualitySettings {
    if (this.forcedTier) return { ...TIER_SETTINGS[this.forcedTier] };
    return { ...TIER_SETTINGS[TIER_ORDER[this.currentTierIndex]!] };
  }

  /** Get current tier name. */
  get tier(): QualityTier {
    if (this.forcedTier) return this.forcedTier;
    return TIER_ORDER[this.currentTierIndex]!;
  }

  /** Register a callback for quality changes. */
  onChange(callback: QualityChangeCallback): void {
    this.callbacks.push(callback);
  }

  /** Remove a change callback. */
  offChange(callback: QualityChangeCallback): void {
    const idx = this.callbacks.indexOf(callback);
    if (idx >= 0) this.callbacks.splice(idx, 1);
  }

  /** Lock auto-adaptation (manual mode). */
  lock(): void {
    this.locked = true;
  }

  /** Unlock auto-adaptation. */
  unlock(): void {
    this.locked = false;
    this.resetTimers();
  }

  /** Force a specific tier (for testing). Pass null to return to auto. */
  forceTier(tier: QualityTier | null): void {
    const prev = this.settings;
    this.forcedTier = tier;
    if (tier) {
      this.currentTierIndex = TIER_ORDER.indexOf(tier);
    }
    const next = this.settings;
    if (prev.tier !== next.tier) {
      this.notifyChange(next);
    }
  }

  /**
   * Called each frame with current FPS.
   * Evaluates whether to change quality tier based on hysteresis.
   */
  update(fps: number, deltaTimeMs: number): void {
    if (this.locked || this.forcedTier) return;

    // Cooldown after a tier change
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= deltaTimeMs;
      return;
    }

    // Check for downgrade
    if (fps > 0 && fps < HYSTERESIS.DOWN_THRESHOLD_FPS) {
      this.downTimer += deltaTimeMs;
      this.upTimer = 0;
    } else if (fps > HYSTERESIS.UP_THRESHOLD_FPS) {
      this.upTimer += deltaTimeMs;
      this.downTimer = 0;
    } else {
      // In the dead zone - reset both timers
      this.downTimer = 0;
      this.upTimer = 0;
    }

    // Downgrade: move to next lower tier
    if (this.downTimer >= HYSTERESIS.DOWN_DELAY_MS) {
      if (this.currentTierIndex < TIER_ORDER.length - 1) {
        this.currentTierIndex++;
        this.notifyChange(this.settings);
        this.resetTimers();
        this.cooldownTimer = HYSTERESIS.COOLDOWN_MS;
      } else {
        this.downTimer = 0; // already at lowest
      }
    }

    // Upgrade: move to next higher tier
    if (this.upTimer >= HYSTERESIS.UP_DELAY_MS) {
      if (this.currentTierIndex > 0) {
        this.currentTierIndex--;
        this.notifyChange(this.settings);
        this.resetTimers();
        this.cooldownTimer = HYSTERESIS.COOLDOWN_MS;
      } else {
        this.upTimer = 0; // already at highest
      }
    }
  }

  private resetTimers(): void {
    this.downTimer = 0;
    this.upTimer = 0;
  }

  private notifyChange(settings: QualitySettings): void {
    for (const cb of this.callbacks) {
      cb(settings);
    }
  }

  dispose(): void {
    this.callbacks.length = 0;
  }
}
