/**
 * Plant Variant Registry
 *
 * This is the single file to update when adding a new plant variant.
 * Import the variant and add it to the PLANT_VARIANTS array below.
 *
 * All variants use the watercolor render mode.
 */

import type { PlantVariant } from "./types";

// Watercolor — Original
import { watercolorFlower } from "./plants/watercolor/watercolor-flower";
import { watercolorFlowerV2 } from "./plants/watercolor/watercolor-flower-v2";
import { quantumFern } from "./plants/watercolor/quantum-fern";
import { wcBellCluster } from "./plants/watercolor/wc-bell-cluster";

// Watercolor — Ground Cover
import { wcSoftMoss } from "./plants/watercolor/wc-soft-moss";
import { wcPebblePatch } from "./plants/watercolor/wc-pebble-patch";

// Watercolor — Grasses
import { wcMeadowTuft } from "./plants/watercolor/wc-meadow-tuft";
import { wcWhisperReed } from "./plants/watercolor/wc-whisper-reed";

// Watercolor — Flowers
import { wcSimpleBloom } from "./plants/watercolor/wc-simple-bloom";
import { wcQuantumTulip } from "./plants/watercolor/wc-quantum-tulip";
import { wcDewdropDaisy } from "./plants/watercolor/wc-dewdrop-daisy";
import { wcMidnightPoppy } from "./plants/watercolor/wc-midnight-poppy";
import { wcZenLotus } from "./plants/watercolor/wc-zen-lotus";
import { wcWildflowerSpray } from "./plants/watercolor/wc-wildflower-spray";
import { wcHydrangeaPuff } from "./plants/watercolor/wc-hydrangea-puff";
import { wcFoxgloveSpire } from "./plants/watercolor/wc-foxglove-spire";

// Watercolor — Shrubs
import { wcCloudBush } from "./plants/watercolor/wc-cloud-bush";
import { wcBerryThicket } from "./plants/watercolor/wc-berry-thicket";

// Watercolor — Trees
import { wcSaplingHope } from "./plants/watercolor/wc-sapling-hope";
import { wcWeepingWillow } from "./plants/watercolor/wc-weeping-willow";

// Watercolor — Ethereal
import { wcPulsingOrb } from "./plants/watercolor/wc-pulsing-orb";
import { wcFractalBloom } from "./plants/watercolor/wc-fractal-bloom";
import { wcPhoenixFlame } from "./plants/watercolor/wc-phoenix-flame";
import { wcCrystalCluster } from "./plants/watercolor/wc-crystal-cluster";
import { wcKaleidoscopeStar } from "./plants/watercolor/wc-kaleidoscope-star";
import { wcVortexSpiral } from "./plants/watercolor/wc-vortex-spiral";
import { wcNebulaBloom } from "./plants/watercolor/wc-nebula-bloom";
import { wcAuroraWisp } from "./plants/watercolor/wc-aurora-wisp";
import { wcPrismaticFern } from "./plants/watercolor/wc-prismatic-fern";
import { wcQuantumRose } from "./plants/watercolor/wc-quantum-rose";
import { wcStarMoss } from "./plants/watercolor/wc-star-moss";
import { wcDreamVine } from "./plants/watercolor/wc-dream-vine";
import { wcCosmicLotus } from "./plants/watercolor/wc-cosmic-lotus";
import { wcSumiSpirit } from "./plants/watercolor/wc-sumi-spirit";
import { wcStarlightDaisy } from "./plants/watercolor/wc-starlight-daisy";
import { wcRadiantLily } from "./plants/watercolor/wc-radiant-lily";
import { wcGlowingBluebell } from "./plants/watercolor/wc-glowing-bluebell";
import { wcSunfireCosmos } from "./plants/watercolor/wc-sunfire-cosmos";
import { wcLuminousTulip } from "./plants/watercolor/wc-luminous-tulip";
import { wcEmberPeony } from "./plants/watercolor/wc-ember-peony";

// Watercolor — Geometric
import { wcSacredMandala } from "./plants/watercolor/wc-sacred-mandala";
import { wcCrystalLattice } from "./plants/watercolor/wc-crystal-lattice";
import { wcStellarGeometry } from "./plants/watercolor/wc-stellar-geometry";
import { wcMetatronsCube } from "./plants/watercolor/wc-metatrons-cube";

// Watercolor — Ethereal Vector
import { wcPulsingOrbVector } from "./plants/watercolor/wc-pulsing-orb-vector";
import { wcPhoenixFlameVector } from "./plants/watercolor/wc-phoenix-flame-vector";
import { wcKaleidoscopeStarVector } from "./plants/watercolor/wc-kaleidoscope-star-vector";
import { wcVortexSpiralVector } from "./plants/watercolor/wc-vortex-spiral-vector";

export const PLANT_VARIANTS: PlantVariant[] = [
  // Original watercolor variants
  watercolorFlower,
  watercolorFlowerV2,
  quantumFern,
  wcBellCluster,
  // Ground Cover
  wcSoftMoss,
  wcPebblePatch,
  // Grasses
  wcMeadowTuft,
  wcWhisperReed,
  // Flowers
  wcSimpleBloom,
  wcQuantumTulip,
  wcDewdropDaisy,
  wcMidnightPoppy,
  wcZenLotus,
  wcWildflowerSpray,
  wcHydrangeaPuff,
  wcFoxgloveSpire,
  // Shrubs
  wcCloudBush,
  wcBerryThicket,
  // Trees
  wcSaplingHope,
  wcWeepingWillow,
  // Ethereal
  wcPulsingOrb,
  wcFractalBloom,
  wcPhoenixFlame,
  wcCrystalCluster,
  wcKaleidoscopeStar,
  wcVortexSpiral,
  wcNebulaBloom,
  wcAuroraWisp,
  wcPrismaticFern,
  wcQuantumRose,
  wcStarMoss,
  wcDreamVine,
  wcCosmicLotus,
  wcSumiSpirit,
  wcStarlightDaisy,
  wcRadiantLily,
  wcGlowingBluebell,
  wcSunfireCosmos,
  wcLuminousTulip,
  wcEmberPeony,
  // Geometric
  wcSacredMandala,
  wcCrystalLattice,
  wcStellarGeometry,
  wcMetatronsCube,
  // Ethereal Vector
  wcPulsingOrbVector,
  wcPhoenixFlameVector,
  wcKaleidoscopeStarVector,
  wcVortexSpiralVector,
];

export function getVariantById(id: string): PlantVariant | undefined {
  return PLANT_VARIANTS.find((v) => v.id === id);
}

export function getAllVariants(): PlantVariant[] {
  return [...PLANT_VARIANTS];
}

/**
 * Returns only variants eligible for spawning (not disabled).
 * Use this for rarity-weighted selection during evolution and seeding.
 */
export function getSpawnableVariants(): PlantVariant[] {
  return PLANT_VARIANTS.filter((v) => !v.disabled);
}
