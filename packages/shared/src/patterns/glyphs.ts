/**
 * Glyph pattern definitions for Quantum Garden plants.
 *
 * Each pattern is a 64x64 grid where:
 * - 1 = filled pixel
 * - 0 = empty pixel
 *
 * To add a new pattern:
 * 1. Add a new entry to GLYPH_PATTERNS with a descriptive name
 * 2. Define the 64x64 grid
 * 3. The pattern will automatically appear in the sandbox at /sandbox
 *
 * Note: These sandbox patterns are separate from variant definitions.
 * For now, they remain as simple 8x8-equivalent patterns for testing.
 */

import {
  createEmptyPattern,
  drawCircle,
  drawPetal,
  drawSmoothRadialBurst,
  drawStar,
  drawDots,
  drawGlowRing,
  drawSpiral,
  drawEllipse,
} from "./pattern-builder";

export interface GlyphPattern {
  name: string;
  description: string;
  grid: number[][];
}

/**
 * Helper to downscale a 64x64 pattern to 8x8 by sampling
 */
function downscale64to8(pattern64: number[][]): number[][] {
  const result: number[][] = [];
  for (let y = 0; y < 8; y++) {
    const row: number[] = [];
    for (let x = 0; x < 8; x++) {
      // Sample from the center of each 8x8 block in the 64x64 grid
      const srcX = Math.floor(x * 8 + 4);
      const srcY = Math.floor(y * 8 + 4);
      row.push(pattern64[srcY]?.[srcX] ?? 0);
    }
    result.push(row);
  }
  return result;
}

/**
 * Generate smooth curve-based patterns at 64x64 and downscale
 */
function generateCurvePattern(name: string): number[][] {
  const p = createEmptyPattern();
  const center = 32;

  switch (name) {
    case "smooth-starburst":
      // Smooth radiating burst with rounded forms
      drawCircle(p, center, center, 8);
      drawSmoothRadialBurst(p, center, center, 8, 28, 6, 2, 22.5);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = center + Math.cos(angle) * 26;
        const y = center + Math.sin(angle) * 26;
        drawCircle(p, Math.round(x), Math.round(y), 4);
      }
      break;

    case "smooth-flower":
      // Organic flower with round petals
      drawCircle(p, center, center, 6);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const tipX = center + Math.cos(angle) * 24;
        const tipY = center + Math.sin(angle) * 24;
        const baseX = center + Math.cos(angle) * 10;
        const baseY = center + Math.sin(angle) * 10;
        drawPetal(p, tipX, tipY, baseX, baseY, 10);
      }
      break;

    case "smooth-spiral":
      // Flowing spiral with thick curves
      drawCircle(p, center, center, 5);
      drawSpiral(p, center, center, 6, 28, 2, 4);
      break;

    case "smooth-aurora":
      // Smooth flowing waves
      for (let i = 0; i < 5; i++) {
        const yPos = 12 + i * 10;
        drawEllipse(p, center, yPos, 28 - i * 3, 8, 1);
      }
      break;

    case "smooth-rosette":
      // Concentric smooth circles
      drawCircle(p, center, center, 24);
      drawCircle(p, center, center, 18);
      drawCircle(p, center, center, 12);
      drawCircle(p, center, center, 6);
      drawStar(p, center, center, 8, 28, 20, 22.5);
      break;

    case "smooth-nebula":
      // Soft cloud-like form
      drawCircle(p, center, center, 16);
      drawCircle(p, center - 8, center - 8, 12);
      drawCircle(p, center + 8, center - 8, 10);
      drawCircle(p, center - 8, center + 8, 11);
      drawCircle(p, center + 8, center + 8, 9);
      break;

    case "smooth-dahlia":
      // Multi-layer petal bloom
      drawCircle(p, center, center, 7);
      // Outer layer
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const tipX = center + Math.cos(angle) * 26;
        const tipY = center + Math.sin(angle) * 26;
        const baseX = center + Math.cos(angle) * 14;
        const baseY = center + Math.sin(angle) * 14;
        drawPetal(p, tipX, tipY, baseX, baseY, 7);
      }
      // Inner layer
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
        const tipX = center + Math.cos(angle) * 18;
        const tipY = center + Math.sin(angle) * 18;
        const baseX = center + Math.cos(angle) * 10;
        const baseY = center + Math.sin(angle) * 10;
        drawPetal(p, tipX, tipY, baseX, baseY, 6);
      }
      break;

    case "smooth-zen":
      // Simple elegant circles
      drawCircle(p, center, center, 20);
      drawGlowRing(p, center, center, 24, 2);
      drawDots(
        p,
        [
          { x: center, y: center - 8 },
          { x: center, y: center + 8 },
          { x: center - 8, y: center },
          { x: center + 8, y: center },
        ],
        3
      );
      break;

    case "smooth-chrysanthemum":
      // Dense layered petals radiating outward
      drawCircle(p, center, center, 5);
      // Three layers of petals
      for (let layer = 0; layer < 3; layer++) {
        const petalCount = 8 + layer * 4; // 8, 12, 16 petals
        const length = 12 + layer * 7;
        const width = 6 - layer;
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2 + (layer * Math.PI) / 24;
          const tipX = center + Math.cos(angle) * length;
          const tipY = center + Math.sin(angle) * length;
          const baseX = center + Math.cos(angle) * 6;
          const baseY = center + Math.sin(angle) * 6;
          drawPetal(p, tipX, tipY, baseX, baseY, width);
        }
      }
      break;

    case "smooth-mandala":
      // Intricate symmetrical pattern
      drawCircle(p, center, center, 4);
      // Inner ring of circles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = center + Math.cos(angle) * 12;
        const y = center + Math.sin(angle) * 12;
        drawCircle(p, Math.round(x), Math.round(y), 3);
      }
      // Outer petals
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
        const tipX = center + Math.cos(angle) * 26;
        const tipY = center + Math.sin(angle) * 26;
        const baseX = center + Math.cos(angle) * 15;
        const baseY = center + Math.sin(angle) * 15;
        drawPetal(p, tipX, tipY, baseX, baseY, 6);
      }
      // Connecting rays
      drawSmoothRadialBurst(p, center, center, 8, 20, 1.5, 0.3, 22.5);
      break;

    case "smooth-sakura":
      // Cherry blossom with 5 rounded petals
      drawCircle(p, center, center, 4);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const tipX = center + Math.cos(angle) * 22;
        const tipY = center + Math.sin(angle) * 22;
        const baseX = center + Math.cos(angle) * 8;
        const baseY = center + Math.sin(angle) * 8;
        drawPetal(p, tipX, tipY, baseX, baseY, 11);
      }
      // Stamens
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10;
        const x = center + Math.cos(angle) * 6;
        const y = center + Math.sin(angle) * 6;
        drawCircle(p, Math.round(x), Math.round(y), 1.5);
      }
      break;

    case "smooth-cosmos":
      // Delicate flower with thin petals
      drawCircle(p, center, center, 6);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const tipX = center + Math.cos(angle) * 26;
        const tipY = center + Math.sin(angle) * 26;
        const baseX = center + Math.cos(angle) * 9;
        const baseY = center + Math.sin(angle) * 9;
        drawPetal(p, tipX, tipY, baseX, baseY, 5);
      }
      // Fine center detail
      drawStar(p, center, center, 8, 8, 4, 22.5);
      break;

    case "smooth-peony":
      // Full, layered bloom
      drawCircle(p, center, center, 8);
      // Multiple overlapping layers
      for (let layer = 0; layer < 2; layer++) {
        const petalCount = 10 - layer * 2;
        const radius = 22 - layer * 6;
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2 + layer * 0.3;
          const tipX = center + Math.cos(angle) * radius;
          const tipY = center + Math.sin(angle) * radius;
          const baseX = center + Math.cos(angle) * (radius - 10);
          const baseY = center + Math.sin(angle) * (radius - 10);
          drawPetal(p, tipX, tipY, baseX, baseY, 9);
        }
      }
      break;

    case "smooth-iris":
      // Three-fold symmetry with curved petals
      drawCircle(p, center, center, 5);
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        // Outer drooping petals
        const tipX = center + Math.cos(angle) * 26;
        const tipY = center + Math.sin(angle) * 22 + 4;
        const baseX = center + Math.cos(angle) * 12;
        const baseY = center + Math.sin(angle) * 12;
        drawPetal(p, tipX, tipY, baseX, baseY, 12);
        // Inner upright petals
        const innerAngle = angle + Math.PI / 6;
        const innerTipX = center + Math.cos(innerAngle) * 18;
        const innerTipY = center + Math.sin(innerAngle) * 18 - 2;
        drawPetal(p, innerTipX, innerTipY, center, center, 8);
      }
      break;

    case "smooth-lotus-open":
      // Open lotus with distinct layers
      drawCircle(p, center, center, 6);
      // Inner ring of petals
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const tipX = center + Math.cos(angle) * 15;
        const tipY = center + Math.sin(angle) * 15;
        drawPetal(p, tipX, tipY, center, center, 7);
      }
      // Outer ring of petals
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
        const tipX = center + Math.cos(angle) * 25;
        const tipY = center + Math.sin(angle) * 25;
        const baseX = center + Math.cos(angle) * 13;
        const baseY = center + Math.sin(angle) * 13;
        drawPetal(p, tipX, tipY, baseX, baseY, 8);
      }
      break;

    case "smooth-wildflower":
      // Asymmetric natural bloom
      drawCircle(p, center, center, 5);
      const petalPositions = [0, 0.7, 1.5, 2.3, 3.1, 4.0, 4.9, 5.6];
      for (let i = 0; i < petalPositions.length; i++) {
        const angle = petalPositions[i]!;
        const length = 18 + (i % 3) * 3;
        const width = 6 + (i % 2) * 2;
        const tipX = center + Math.cos(angle) * length;
        const tipY = center + Math.sin(angle) * length;
        const baseX = center + Math.cos(angle) * 7;
        const baseY = center + Math.sin(angle) * 7;
        drawPetal(p, tipX, tipY, baseX, baseY, width);
      }
      break;

    case "smooth-hibiscus":
      // Large dramatic tropical flower with overlapping petals
      drawCircle(p, center, center, 7);
      // 5 large overlapping petals
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const tipX = center + Math.cos(angle) * 27;
        const tipY = center + Math.sin(angle) * 27;
        const baseX = center + Math.cos(angle) * 11;
        const baseY = center + Math.sin(angle) * 11;
        drawPetal(p, tipX, tipY, baseX, baseY, 14);
      }
      // Prominent center
      drawStar(p, center, center, 5, 9, 4, 0);
      drawCircle(p, center, center, 3);
      break;

    case "smooth-orchid":
      // Exotic three-petal structure with elegant drooping
      drawCircle(p, center, center, 4);
      // Top two petals
      for (let i = 0; i < 2; i++) {
        const angle = -Math.PI / 2 + ((i - 0.5) * Math.PI) / 3;
        const tipX = center + Math.cos(angle) * 24;
        const tipY = center + Math.sin(angle) * 20;
        const baseX = center + Math.cos(angle) * 9;
        const baseY = center + Math.sin(angle) * 9;
        drawPetal(p, tipX, tipY, baseX, baseY, 10);
      }
      // Bottom lip petal (larger, drooping)
      drawPetal(p, center, center + 28, center, center + 10, 16);
      // Side petals
      drawPetal(p, center - 20, center + 6, center - 8, center, 7);
      drawPetal(p, center + 20, center + 6, center + 8, center, 7);
      break;

    case "smooth-magnolia":
      // Bold, simple 6-petal cup shape
      drawCircle(p, center, center, 8);
      // 6 thick petals in two layers
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 12;
        const tipX = center + Math.cos(angle) * 25;
        const tipY = center + Math.sin(angle) * 25;
        const baseX = center + Math.cos(angle) * 12;
        const baseY = center + Math.sin(angle) * 12;
        drawPetal(p, tipX, tipY, baseX, baseY, 11);
      }
      // Center stamen cluster
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = center + Math.cos(angle) * 5;
        const y = center + Math.sin(angle) * 5;
        drawCircle(p, Math.round(x), Math.round(y), 2);
      }
      break;

    case "smooth-anemone":
      // Delicate flower with thin petals and prominent center
      drawCircle(p, center, center, 9);
      drawCircle(p, center, center, 6);
      // 10 thin delicate petals
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const tipX = center + Math.cos(angle) * 26;
        const tipY = center + Math.sin(angle) * 26;
        const baseX = center + Math.cos(angle) * 11;
        const baseY = center + Math.sin(angle) * 11;
        drawPetal(p, tipX, tipY, baseX, baseY, 4);
      }
      // Dense center texture
      drawStar(p, center, center, 6, 7, 3, 0);
      break;

    case "smooth-firework":
      // Dynamic explosive burst with trailing sparks
      drawCircle(p, center, center, 6);
      // Primary burst rays (8)
      drawSmoothRadialBurst(p, center, center, 8, 26, 5, 0.5, 22.5);
      // Secondary sparkle rays (8, between primary)
      drawSmoothRadialBurst(p, center, center, 8, 18, 2, 0.3, 0);
      // Sparkle dots at endpoints
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
        const x = center + Math.cos(angle) * 28;
        const y = center + Math.sin(angle) * 28;
        drawCircle(p, Math.round(x), Math.round(y), 2);
      }
      break;

    case "smooth-pinwheel":
      // Rotating spiral with curved arms
      drawCircle(p, center, center, 5);
      // 6 curved spiral arms
      for (let i = 0; i < 6; i++) {
        const baseAngle = (i / 6) * Math.PI * 2;
        // Create curved arm with multiple petals
        for (let j = 0; j < 3; j++) {
          const t = j / 3;
          const angle = baseAngle + (t * Math.PI) / 4;
          const radius = 10 + t * 14;
          const tipX = center + Math.cos(angle) * radius;
          const tipY = center + Math.sin(angle) * radius;
          const baseX = center + Math.cos(angle) * (radius - 6);
          const baseY = center + Math.sin(angle) * (radius - 6);
          drawPetal(p, tipX, tipY, baseX, baseY, 5 - j);
        }
      }
      break;

    case "smooth-kaleidoscope":
      // Complex geometric-organic hybrid
      drawCircle(p, center, center, 4);
      // Inner star
      drawStar(p, center, center, 8, 10, 5, 0);
      // Mid-layer circles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = center + Math.cos(angle) * 14;
        const y = center + Math.sin(angle) * 14;
        drawCircle(p, Math.round(x), Math.round(y), 4);
      }
      // Outer petals with rays
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
        const tipX = center + Math.cos(angle) * 27;
        const tipY = center + Math.sin(angle) * 27;
        const baseX = center + Math.cos(angle) * 16;
        const baseY = center + Math.sin(angle) * 16;
        drawPetal(p, tipX, tipY, baseX, baseY, 5);
      }
      // Thin connecting rays
      drawSmoothRadialBurst(p, center, center, 16, 24, 1, 0.2, 11.25);
      break;

    case "smooth-garden":
      // Multiple flowers at different scales
      // Main flower
      drawCircle(p, center, center, 5);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const tipX = center + Math.cos(angle) * 18;
        const tipY = center + Math.sin(angle) * 18;
        drawPetal(p, tipX, tipY, center, center, 8);
      }
      // Smaller companion flowers
      const companions = [
        { x: center - 16, y: center - 10 },
        { x: center + 16, y: center - 10 },
        { x: center, y: center + 18 },
      ];
      for (const comp of companions) {
        drawCircle(p, comp.x, comp.y, 3);
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const tipX = comp.x + Math.cos(angle) * 8;
          const tipY = comp.y + Math.sin(angle) * 8;
          drawPetal(p, tipX, tipY, comp.x, comp.y, 4);
        }
      }
      break;

    case "smooth-supernova":
      // Explosive radiating energy with layers
      // Dense center
      drawCircle(p, center, center, 7);
      drawStar(p, center, center, 12, 10, 5, 0);
      // Inner burst (12 thick rays)
      drawSmoothRadialBurst(p, center, center, 12, 18, 4, 1, 15);
      // Outer burst (12 thin rays)
      drawSmoothRadialBurst(p, center, center, 12, 28, 2, 0.3, 0);
      // Energy rings
      drawGlowRing(p, center, center, 22, 2);
      // Scattered energy particles
      const particles = [
        { x: center - 25, y: center },
        { x: center + 25, y: center },
        { x: center, y: center - 25 },
        { x: center, y: center + 25 },
        { x: center - 18, y: center - 18 },
        { x: center + 18, y: center - 18 },
        { x: center - 18, y: center + 18 },
        { x: center + 18, y: center + 18 },
      ];
      drawDots(p, particles, 1.5);
      break;

    case "smooth-fractal":
      // Recursive petal structure
      drawCircle(p, center, center, 4);
      // First level - 5 petals
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const tipX = center + Math.cos(angle) * 24;
        const tipY = center + Math.sin(angle) * 24;
        const baseX = center + Math.cos(angle) * 10;
        const baseY = center + Math.sin(angle) * 10;
        drawPetal(p, tipX, tipY, baseX, baseY, 10);

        // Second level - smaller petals at endpoints
        const miniTipX = tipX + Math.cos(angle) * 6;
        const miniTipY = tipY + Math.sin(angle) * 6;
        drawPetal(p, miniTipX, miniTipY, tipX, tipY, 4);

        // Side mini petals
        const leftAngle = angle - Math.PI / 3;
        const rightAngle = angle + Math.PI / 3;
        const miniBase = 17;
        drawPetal(
          p,
          tipX + Math.cos(leftAngle) * 5,
          tipY + Math.sin(leftAngle) * 5,
          center + Math.cos(angle) * miniBase,
          center + Math.sin(angle) * miniBase,
          3
        );
        drawPetal(
          p,
          tipX + Math.cos(rightAngle) * 5,
          tipY + Math.sin(rightAngle) * 5,
          center + Math.cos(angle) * miniBase,
          center + Math.sin(angle) * miniBase,
          3
        );
      }
      break;

    case "smooth-phoenix":
      // Rising bird-like flame pattern
      drawCircle(p, center, center + 4, 6);
      // Body/core
      drawPetal(p, center, center - 8, center, center + 2, 9);
      // Wing-like flames
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 4; i++) {
          const baseAngle = side * (Math.PI / 4 + (i * Math.PI) / 8);
          const yOffset = -2 - i * 3;
          const length = 18 - i * 2;
          const tipX = center + Math.cos(baseAngle) * length;
          const tipY = center + yOffset + Math.sin(baseAngle) * length;
          drawPetal(p, tipX, tipY, center, center + yOffset, 6 - i);
        }
      }
      // Tail flames
      for (let i = 0; i < 3; i++) {
        const angle = Math.PI / 2 + ((i - 1) * Math.PI) / 6;
        const tipY = center + 20 + i * 4;
        drawPetal(p, center + Math.cos(angle) * 8, tipY, center, center + 6, 5);
      }
      break;

    case "smooth-nautilus":
      // Spiral shell pattern
      drawCircle(p, center, center, 4);
      // Logarithmic spiral with expanding chambers
      for (let i = 0; i < 16; i++) {
        const t = i / 16;
        const angle = t * Math.PI * 3;
        const radius = 4 + t * 20;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const size = 3 + t * 5;
        drawCircle(p, Math.round(x), Math.round(y), size);
      }
      // Connecting spiral curve
      drawSpiral(p, center, center, 4, 26, 1.5, 3);
      break;

    case "smooth-butterfly":
      // Symmetric wing structure
      drawCircle(p, center, center, 4);
      drawEllipse(p, center, center, 3, 8, 1);
      // Upper wings (both sides)
      for (let side = -1; side <= 1; side += 2) {
        // Large outer wing
        const outerTipX = center + side * 24;
        const outerTipY = center - 12;
        drawPetal(p, outerTipX, outerTipY, center + side * 8, center - 4, 14);
        drawCircle(p, Math.round(outerTipX), Math.round(outerTipY), 4);

        // Small inner wing
        const innerTipX = center + side * 16;
        const innerTipY = center + 8;
        drawPetal(p, innerTipX, innerTipY, center + side * 6, center + 2, 9);
        drawCircle(p, Math.round(innerTipX), Math.round(innerTipY), 2.5);
      }
      // Antennae
      drawPetal(p, center - 4, center - 18, center, center - 6, 2);
      drawPetal(p, center + 4, center - 18, center, center - 6, 2);
      break;

    case "smooth-crystal":
      // Geometric crystal growth
      drawCircle(p, center, center, 5);
      // Central diamond
      const crystalPoints = [
        { x: center, y: center - 20 },
        { x: center + 14, y: center },
        { x: center, y: center + 20 },
        { x: center - 14, y: center },
      ];
      for (let i = 0; i < crystalPoints.length; i++) {
        const p1 = crystalPoints[i]!;
        drawPetal(p, p1.x, p1.y, center, center, 8);
      }
      // Smaller crystals at cardinal points
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x = center + Math.cos(angle) * 24;
        const y = center + Math.sin(angle) * 24;
        drawStar(p, Math.round(x), Math.round(y), 4, 6, 3, 0);
      }
      break;

    case "smooth-nebula-bloom":
      // Cosmic cloud-flower hybrid
      // Multiple soft overlapping circles
      const nebulaCenters = [
        { x: center, y: center, r: 12 },
        { x: center - 10, y: center - 10, r: 10 },
        { x: center + 10, y: center - 10, r: 9 },
        { x: center - 12, y: center + 8, r: 11 },
        { x: center + 12, y: center + 8, r: 10 },
        { x: center, y: center + 14, r: 8 },
      ];
      for (const nc of nebulaCenters) {
        drawCircle(p, nc.x, nc.y, nc.r);
        drawGlowRing(p, nc.x, nc.y, nc.r + 4, 1);
      }
      // Star-like points emerging
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = center + Math.cos(angle) * 26;
        const y = center + Math.sin(angle) * 26;
        drawCircle(p, Math.round(x), Math.round(y), 2);
      }
      break;

    case "smooth-vortex":
      // Swirling energy pattern
      drawCircle(p, center, center, 4);
      // Multiple spiral arms with petals
      for (let arm = 0; arm < 5; arm++) {
        const baseAngle = (arm / 5) * Math.PI * 2;
        for (let step = 0; step < 8; step++) {
          const t = step / 8;
          const angle = baseAngle + t * Math.PI * 1.2;
          const radius = 8 + t * 18;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          const size = 6 - t * 3;
          drawCircle(p, Math.round(x), Math.round(y), size);
        }
      }
      // Central star
      drawStar(p, center, center, 5, 8, 3, 0);
      break;
  }

  return downscale64to8(p);
}

export const GLYPH_PATTERNS: GlyphPattern[] = [
  // Original patterns (legacy)
  {
    name: "cross",
    description: "Simple cross pattern - classic plant form",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    name: "diamond",
    description: "Diamond shape - pointed form expanding from center",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    name: "circle",
    description: "Hollow circle - rounded organic shape",
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    name: "square",
    description: "Hollow square - rectangular outline",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  // New firework-inspired patterns
  {
    name: "starburst",
    description: "Seeds exploding from central pod - radiating energy",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    name: "spiral",
    description: "Petals spiraling outward - pinwheel bloom",
    grid: [
      [0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 1, 0],
      [1, 0, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 0, 0, 1],
      [0, 1, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0],
    ],
  },
  {
    name: "dandelion",
    description: "Seeds dispersing spherically - airy burst",
    grid: [
      [0, 1, 0, 1, 1, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 1, 0, 1, 1, 0, 1, 0],
    ],
  },
  {
    name: "constellation",
    description: "Geometric spore release - retro star field",
    grid: [
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
    ],
  },
  {
    name: "mandala",
    description: "Concentric petal rings - symmetrical explosion",
    grid: [
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
    ],
  },
  {
    name: "cascade",
    description: "Graceful curves flowing outward - willow droop",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
    ],
  },
  {
    name: "sunburst",
    description: "Sun rays meeting flower petals - radiant bloom",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    name: "sporecloud",
    description: "Soft diffuse burst - ambient moss release",
    grid: [
      [0, 1, 0, 0, 0, 0, 1, 0],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [0, 1, 0, 0, 0, 0, 1, 0],
    ],
  },
  // Smooth curve-based patterns (organic, flowing shapes)
  {
    name: "bloom",
    description: "Smooth circular bloom - rounded petal explosion",
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    name: "petal",
    description: "Single smooth petal - teardrop form",
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    name: "flower",
    description: "Smooth four-petal flower - rounded cross",
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    name: "wave",
    description: "Flowing wave - smooth curved motion",
    grid: [
      [0, 0, 0, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    name: "orb",
    description: "Perfect smooth circle - pure radial form",
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    name: "leaf",
    description: "Smooth leaf shape - natural curve",
    grid: [
      [0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    name: "lotus",
    description: "Multi-layered smooth petals - concentric bloom",
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    name: "ripple",
    description: "Concentric smooth rings - water ripple",
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
  // Generated smooth curve-based patterns (64x64 downscaled to 8x8)
  {
    name: "smooth-starburst",
    description: "Smooth radiating burst - rounded organic rays",
    grid: generateCurvePattern("smooth-starburst"),
  },
  {
    name: "smooth-flower",
    description: "Organic flower - round smooth petals",
    grid: generateCurvePattern("smooth-flower"),
  },
  {
    name: "smooth-spiral",
    description: "Flowing spiral - thick smooth curves",
    grid: generateCurvePattern("smooth-spiral"),
  },
  {
    name: "smooth-aurora",
    description: "Smooth flowing waves - aurora borealis",
    grid: generateCurvePattern("smooth-aurora"),
  },
  {
    name: "smooth-rosette",
    description: "Concentric smooth circles - layered bloom",
    grid: generateCurvePattern("smooth-rosette"),
  },
  {
    name: "smooth-nebula",
    description: "Soft cloud form - organic overlap",
    grid: generateCurvePattern("smooth-nebula"),
  },
  {
    name: "smooth-dahlia",
    description: "Multi-layer petal bloom - full flower",
    grid: generateCurvePattern("smooth-dahlia"),
  },
  {
    name: "smooth-zen",
    description: "Simple elegant circles - minimalist form",
    grid: generateCurvePattern("smooth-zen"),
  },
  // Sophisticated botanical patterns (high-fidelity flower forms)
  {
    name: "smooth-chrysanthemum",
    description: "Dense layered petals - abundant bloom",
    grid: generateCurvePattern("smooth-chrysanthemum"),
  },
  {
    name: "smooth-mandala",
    description: "Intricate symmetrical pattern - geometric harmony",
    grid: generateCurvePattern("smooth-mandala"),
  },
  {
    name: "smooth-sakura",
    description: "Cherry blossom - five rounded petals",
    grid: generateCurvePattern("smooth-sakura"),
  },
  {
    name: "smooth-cosmos",
    description: "Delicate flower - thin elegant petals",
    grid: generateCurvePattern("smooth-cosmos"),
  },
  {
    name: "smooth-peony",
    description: "Full layered bloom - lush flower",
    grid: generateCurvePattern("smooth-peony"),
  },
  {
    name: "smooth-iris",
    description: "Three-fold symmetry - curved drooping petals",
    grid: generateCurvePattern("smooth-iris"),
  },
  {
    name: "smooth-lotus-open",
    description: "Open lotus - distinct layered rings",
    grid: generateCurvePattern("smooth-lotus-open"),
  },
  {
    name: "smooth-wildflower",
    description: "Asymmetric natural bloom - organic variation",
    grid: generateCurvePattern("smooth-wildflower"),
  },
  // Advanced floral and artistic patterns
  {
    name: "smooth-hibiscus",
    description: "Large tropical flower - dramatic overlapping petals",
    grid: generateCurvePattern("smooth-hibiscus"),
  },
  {
    name: "smooth-orchid",
    description: "Exotic three-petal - elegant drooping structure",
    grid: generateCurvePattern("smooth-orchid"),
  },
  {
    name: "smooth-magnolia",
    description: "Bold cup shape - thick layered petals",
    grid: generateCurvePattern("smooth-magnolia"),
  },
  {
    name: "smooth-anemone",
    description: "Delicate thin petals - prominent dark center",
    grid: generateCurvePattern("smooth-anemone"),
  },
  {
    name: "smooth-firework",
    description: "Dynamic explosive burst - trailing sparks",
    grid: generateCurvePattern("smooth-firework"),
  },
  {
    name: "smooth-pinwheel",
    description: "Rotating spiral - curved dynamic arms",
    grid: generateCurvePattern("smooth-pinwheel"),
  },
  {
    name: "smooth-kaleidoscope",
    description: "Complex geometric-organic - intricate symmetry",
    grid: generateCurvePattern("smooth-kaleidoscope"),
  },
  {
    name: "smooth-garden",
    description: "Multiple flowers - clustered composition",
    grid: generateCurvePattern("smooth-garden"),
  },
  {
    name: "smooth-supernova",
    description: "Explosive radiating energy - layered burst",
    grid: generateCurvePattern("smooth-supernova"),
  },
  {
    name: "smooth-fractal",
    description: "Recursive petal structure - self-similar form",
    grid: generateCurvePattern("smooth-fractal"),
  },
  // Artistic and abstract patterns
  {
    name: "smooth-phoenix",
    description: "Rising flame bird - wing-like energy",
    grid: generateCurvePattern("smooth-phoenix"),
  },
  {
    name: "smooth-nautilus",
    description: "Spiral shell - logarithmic chambers",
    grid: generateCurvePattern("smooth-nautilus"),
  },
  {
    name: "smooth-butterfly",
    description: "Symmetric wings - graceful insect form",
    grid: generateCurvePattern("smooth-butterfly"),
  },
  {
    name: "smooth-crystal",
    description: "Geometric growth - angular facets",
    grid: generateCurvePattern("smooth-crystal"),
  },
  {
    name: "smooth-nebula-bloom",
    description: "Cosmic cloud flower - soft overlapping forms",
    grid: generateCurvePattern("smooth-nebula-bloom"),
  },
  {
    name: "smooth-vortex",
    description: "Swirling energy - spiral arms with motion",
    grid: generateCurvePattern("smooth-vortex"),
  },
];

/**
 * Get a pattern by name
 */
export function getPatternByName(name: string): GlyphPattern | undefined {
  return GLYPH_PATTERNS.find((p) => p.name === name);
}

/**
 * Get a pattern by index (for quantum mapping)
 * Wraps around if index exceeds array length
 */
export function getPatternByIndex(index: number): GlyphPattern {
  const pattern = GLYPH_PATTERNS[index % GLYPH_PATTERNS.length];
  if (!pattern) {
    throw new Error(`No pattern at index ${index}`);
  }
  return pattern;
}
