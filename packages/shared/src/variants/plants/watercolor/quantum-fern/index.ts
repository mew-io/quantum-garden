import type { PlantVariant, WatercolorBuildContext, WatercolorElement } from "../../../types";

function buildQuantumFernElements(ctx: WatercolorBuildContext): WatercolorElement[] {
  const elements: WatercolorElement[] = [];

  // Seeded RNG for per-plant variation
  let s = ctx.seed & 0x7fffffff;
  if (s === 0) s = 1;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Path A: read properties from Python circuit's extra dict (via plant.traits)
  // Fallback values used for unobserved plants (ctx.traits is null)
  const branchCount = typeof ctx.traits?.branchCount === "number" ? ctx.traits.branchCount : 4;
  const asymmetry = typeof ctx.traits?.asymmetry === "number" ? ctx.traits.asymmetry : 0.1;
  const leafDensity = typeof ctx.traits?.leafDensity === "number" ? ctx.traits.leafDensity : 0.5;

  // Lifecycle openness (0=tight bud, 1=fully open)
  const openness =
    ctx.keyframeName === "dormant"
      ? 0
      : ctx.keyframeName === "sprout"
        ? ctx.keyframeProgress * 0.3
        : ctx.keyframeName === "frond"
          ? 0.3 + ctx.keyframeProgress * 0.6
          : ctx.keyframeName === "mature"
            ? 0.9 + ctx.keyframeProgress * 0.1
            : Math.max(0, 1 - ctx.keyframeProgress); // fade

  if (openness <= 0) return elements;

  // Fern color set
  const darkGreen = "#2D5A27";
  const midGreen = "#4A8F3F";
  const lightGreen = "#8BC34A";
  const stemColor = "#1E3A1C";

  // Central stem (rachis)
  const stemBottom = 56;
  const stemTop = 12;
  const stemMidX = 32;
  elements.push({
    shape: {
      type: "stem",
      points: [
        [stemMidX, stemBottom],
        [stemMidX + (rng() - 0.5) * 4 * asymmetry, (stemBottom + stemTop) / 2],
        [stemMidX + (rng() - 0.5) * 6 * asymmetry, stemTop + 6],
        [stemMidX, stemTop],
      ],
      thickness: 0.7 + openness * 0.4,
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: openness,
    color: stemColor,
    opacity: 0.65,
    zOffset: 0,
  });

  // Primary branches along the stem
  for (let i = 0; i < branchCount; i++) {
    if (openness < (i / branchCount) * 0.6) break; // stagger reveal

    // Position along stem with asymmetry bias
    const t = (i + 0.5) / branchCount;
    const y = stemBottom - t * (stemBottom - stemTop);
    const asymBias = (rng() - 0.5) * asymmetry * 8;
    const side = i % 2 === 0 ? 1 : -1;
    const branchAngle = side * (0.5 + rng() * 0.4 + asymmetry * 0.3);
    const branchLength = (6 + rng() * 6) * openness;

    // Branch stem
    const bx = stemMidX + asymBias;
    const endX = bx + Math.sin(branchAngle) * branchLength * side;
    const endY = y - Math.cos(branchAngle) * branchLength * 0.6;

    elements.push({
      shape: {
        type: "stem",
        points: [
          [bx, y],
          [bx + (endX - bx) * 0.5, y + (endY - y) * 0.5],
          [endX, endY],
          [endX, endY],
        ],
        thickness: 0.4 + openness * 0.2,
      },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: midGreen,
      opacity: 0.55,
      zOffset: 0.5,
    });

    // Leaflets along each branch (density-controlled)
    const leafletCount = Math.floor(2 + leafDensity * 4);
    for (let j = 0; j < leafletCount; j++) {
      if (rng() > leafDensity + 0.3) continue;
      const lt = (j + 0.5) / leafletCount;
      const lx = bx + (endX - bx) * lt;
      const ly = y + (endY - y) * lt;
      const leafAngle = branchAngle * side + (rng() - 0.5) * 0.4;
      const isMain = j < 2;

      elements.push({
        shape: {
          type: "leaf",
          width: isMain ? 2.5 : 1.8,
          length: isMain ? 5 : 3.5,
        },
        position: { x: lx, y: ly },
        rotation: leafAngle,
        scale: (0.5 + rng() * 0.5) * openness,
        color: rng() > 0.5 ? darkGreen : lightGreen,
        opacity: 0.5 + rng() * 0.25,
        zOffset: 1.0 + j * 0.1,
      });
    }
  }

  // Fiddlehead tip when young
  if (openness < 0.5) {
    elements.push({
      shape: { type: "disc", radius: 1.2 + (1 - openness) * 1.5 },
      position: { x: stemMidX, y: stemTop + 2 },
      rotation: 0,
      scale: 1 - openness * 1.5,
      color: midGreen,
      opacity: 0.4 + (1 - openness) * 0.3,
      zOffset: 2.0,
    });
  }

  return elements;
}

export const quantumFern: PlantVariant = {
  id: "quantum-fern",
  name: "Quantum Fern",
  description:
    "A delicate fern whose branching geometry is directly encoded by a custom quantum interference circuit. Qubit measurements determine branch count, structural symmetry, and leaflet density.",
  rarity: 0.08,
  requiresObservationToGerminate: true,
  renderMode: "watercolor",
  keyframes: [],
  // Path A: custom Python circuit returns plant-specific properties in extra dict
  circuitId: "quantum_fern",
  // No quantumMapping needed — Python circuit handles everything
  watercolorConfig: {
    keyframes: [
      { name: "dormant", duration: 10 },
      { name: "sprout", duration: 18 },
      { name: "frond", duration: 35 },
      { name: "mature", duration: 50 },
      { name: "fade", duration: 20 },
    ],
    wcEffect: {
      layers: 3,
      opacity: 0.45,
      spread: 0.05,
      colorVariation: 0.03,
    },
    buildElements: buildQuantumFernElements,
  },
};
