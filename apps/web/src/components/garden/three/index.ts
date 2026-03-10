/**
 * Three.js Garden Components
 *
 * Exports the Three.js-based garden rendering system.
 */

export { GardenScene } from "./garden-scene";
export { SceneManager } from "./core/scene-manager";
export { TextureAtlas, getTextureAtlas, disposeTextureAtlas } from "./core/texture-atlas";
export { PlantInstancer } from "./plants/plant-instancer";
export type { RenderablePlant } from "./plants/plant-instancer";

// Overlay components
export { OverlayManager } from "./overlays";
export { EntanglementOverlay } from "./overlays/entanglement-overlay";
export { FeedbackOverlay } from "./overlays/feedback-overlay";
