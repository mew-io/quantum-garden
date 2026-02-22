/**
 * Plant Variant Registry
 *
 * This is the single file to update when adding a new plant variant.
 * Import the variant and add it to the PLANT_VARIANTS array below.
 */

import type { PlantVariant } from "./types";

// Ground Cover
import { softMoss } from "./plants/ground-cover/soft-moss";
import { pebblePatch } from "./plants/ground-cover/pebble-patch";

// Grasses
import { meadowTuft } from "./plants/grasses/meadow-tuft";
import { whisperReed } from "./plants/grasses/whisper-reed";

// Flowers
import { simpleBloom } from "./plants/flowers/simple-bloom";
import { quantumTulip } from "./plants/flowers/quantum-tulip";
import { dewdropDaisy } from "./plants/flowers/dewdrop-daisy";
import { midnightPoppy } from "./plants/flowers/midnight-poppy";
import { bellCluster } from "./plants/flowers/bell-cluster";
import { zenLotus } from "./plants/flowers/zen-lotus";

// Shrubs
import { cloudBush } from "./plants/shrubs/cloud-bush";
import { berryThicket } from "./plants/shrubs/berry-thicket";

// Trees
import { saplingHope } from "./plants/trees/sapling-hope";
import { weepingWillow } from "./plants/trees/weeping-willow";

// Ethereal
import { pulsingOrb } from "./plants/ethereal/pulsing-orb";
import { fractalBloom } from "./plants/ethereal/fractal-bloom";
import { phoenixFlame } from "./plants/ethereal/phoenix-flame";
import { crystalCluster } from "./plants/ethereal/crystal-cluster";
import { kaleidoscopeStar } from "./plants/ethereal/kaleidoscope-star";
import { vortexSpiral } from "./plants/ethereal/vortex-spiral";
import { nebulaBloom } from "./plants/ethereal/nebula-bloom";
import { auroraWisp } from "./plants/ethereal/aurora-wisp";
import { prismaticFern } from "./plants/ethereal/prismatic-fern";
import { quantumRose } from "./plants/ethereal/quantum-rose";
import { starMoss } from "./plants/ethereal/star-moss";
import { dreamVine } from "./plants/ethereal/dream-vine";
import { cosmicLotus } from "./plants/ethereal/cosmic-lotus";
import { sumiSpirit } from "./plants/ethereal/sumi-spirit";

// Geometric
import { sacredMandala } from "./plants/geometric/sacred-mandala";
import { crystalLattice } from "./plants/geometric/crystal-lattice";
import { stellarGeometry } from "./plants/geometric/stellar-geometry";
import { metatronsCube } from "./plants/geometric/metatrons-cube";

// Ethereal Vector
import { pulsingOrbVector } from "./plants/ethereal-vector/pulsing-orb-vector";
import { phoenixFlameVector } from "./plants/ethereal-vector/phoenix-flame-vector";
import { kaleidoscopeStarVector } from "./plants/ethereal-vector/kaleidoscope-star-vector";
import { vortexSpiralVector } from "./plants/ethereal-vector/vortex-spiral-vector";

// Watercolor
import { watercolorFlower } from "./plants/watercolor/watercolor-flower";
import { watercolorFlowerV2 } from "./plants/watercolor/watercolor-flower-v2";
import { quantumFern } from "./plants/watercolor/quantum-fern";

export const PLANT_VARIANTS: PlantVariant[] = [
  // Ground Cover (very common)
  softMoss,
  pebblePatch,
  // Grasses (common)
  meadowTuft,
  whisperReed,
  // Flowers (moderate to uncommon)
  simpleBloom,
  quantumTulip,
  dewdropDaisy,
  midnightPoppy,
  bellCluster,
  zenLotus,
  // Shrubs (uncommon)
  cloudBush,
  berryThicket,
  // Trees (rare)
  saplingHope,
  weepingWillow,
  // Ethereal (rare - abstract artistic patterns)
  pulsingOrb,
  fractalBloom,
  phoenixFlame,
  crystalCluster,
  kaleidoscopeStar,
  vortexSpiral,
  nebulaBloom,
  auroraWisp,
  prismaticFern,
  quantumRose,
  starMoss,
  dreamVine,
  cosmicLotus,
  sumiSpirit,
  // Geometric (rare - minimalist line-work patterns)
  sacredMandala,
  crystalLattice,
  stellarGeometry,
  metatronsCube,
  // Ethereal Vector (very rare - colorful smooth vectors with looping)
  pulsingOrbVector,
  phoenixFlameVector,
  kaleidoscopeStarVector,
  vortexSpiralVector,
  // Watercolor (rare - painterly layered transparency)
  watercolorFlower,
  watercolorFlowerV2,
  quantumFern,
];

export function getVariantById(id: string): PlantVariant | undefined {
  return PLANT_VARIANTS.find((v) => v.id === id);
}

export function getAllVariants(): PlantVariant[] {
  return [...PLANT_VARIANTS];
}
