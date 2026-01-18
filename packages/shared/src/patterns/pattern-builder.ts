/**
 * Pattern Builder Utilities
 *
 * Provides functions to programmatically generate 64x64 glyph patterns.
 * Used by variant definitions to create detailed plant patterns.
 */

/** Standard grid size for patterns */
export const PATTERN_SIZE = 64;

/** Create an empty 64x64 pattern */
export function createEmptyPattern(): number[][] {
  return Array.from({ length: PATTERN_SIZE }, () => Array.from({ length: PATTERN_SIZE }, () => 0));
}

/** Create a filled 64x64 pattern */
export function createFilledPattern(): number[][] {
  return Array.from({ length: PATTERN_SIZE }, () => Array.from({ length: PATTERN_SIZE }, () => 1));
}

/**
 * Draw a filled circle on a pattern
 */
export function drawCircle(
  pattern: number[][],
  centerX: number,
  centerY: number,
  radius: number,
  fill: number = 1
): void {
  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy <= radius * radius) {
        pattern[y]![x] = fill;
      }
    }
  }
}

/**
 * Draw a hollow circle (ring) on a pattern
 */
export function drawRing(
  pattern: number[][],
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  fill: number = 1
): void {
  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distSq = dx * dx + dy * dy;
      if (distSq >= innerRadius * innerRadius && distSq <= outerRadius * outerRadius) {
        pattern[y]![x] = fill;
      }
    }
  }
}

/**
 * Draw a filled ellipse on a pattern
 */
export function drawEllipse(
  pattern: number[][],
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  fill: number = 1
): void {
  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      if (dx * dx + dy * dy <= 1) {
        pattern[y]![x] = fill;
      }
    }
  }
}

/**
 * Draw a filled rectangle on a pattern
 */
export function drawRect(
  pattern: number[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  fill: number = 1
): void {
  for (let y = Math.max(0, y1); y <= Math.min(PATTERN_SIZE - 1, y2); y++) {
    for (let x = Math.max(0, x1); x <= Math.min(PATTERN_SIZE - 1, x2); x++) {
      pattern[y]![x] = fill;
    }
  }
}

/**
 * Draw a line using Bresenham's algorithm
 */
export function drawLine(
  pattern: number[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number = 1,
  fill: number = 1
): void {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  let x = x1;
  let y = y1;

  while (true) {
    // Draw a circle at each point for thickness
    if (thickness <= 1) {
      if (x >= 0 && x < PATTERN_SIZE && y >= 0 && y < PATTERN_SIZE) {
        pattern[y]![x] = fill;
      }
    } else {
      drawCircle(pattern, x, y, thickness / 2, fill);
    }

    if (x === x2 && y === y2) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

/**
 * Draw a curved line (quadratic bezier)
 */
export function drawCurve(
  pattern: number[][],
  x1: number,
  y1: number,
  cpX: number,
  cpY: number,
  x2: number,
  y2: number,
  thickness: number = 1,
  fill: number = 1
): void {
  const steps = 50;
  let prevX = x1;
  let prevY = y1;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;

    const x = Math.round(mt * mt * x1 + 2 * mt * t * cpX + t * t * x2);
    const y = Math.round(mt * mt * y1 + 2 * mt * t * cpY + t * t * y2);

    drawLine(pattern, prevX, prevY, x, y, thickness, fill);
    prevX = x;
    prevY = y;
  }
}

/**
 * Draw a petal shape (teardrop/leaf)
 */
export function drawPetal(
  pattern: number[][],
  tipX: number,
  tipY: number,
  baseX: number,
  baseY: number,
  width: number,
  fill: number = 1
): void {
  // Calculate direction and perpendicular
  const dx = baseX - tipX;
  const dy = baseY - tipY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const nx = dx / len;
  const ny = dy / len;
  const px = -ny;
  const py = nx;

  // Fill the petal area
  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      // Project point onto petal axis
      const relX = x - tipX;
      const relY = y - tipY;
      const along = relX * nx + relY * ny;
      const perp = Math.abs(relX * px + relY * py);

      if (along >= 0 && along <= len) {
        // Width varies along length: 0 at tip, max at middle, 0 at base
        const t = along / len;
        const widthAtT = width * Math.sin(t * Math.PI);
        if (perp <= widthAtT) {
          pattern[y]![x] = fill;
        }
      }
    }
  }
}

/**
 * Scatter random dots on a pattern
 */
export function scatterDots(
  pattern: number[][],
  count: number,
  minRadius: number,
  maxRadius: number,
  seed: number = 12345
): void {
  // Simple seeded random
  let s = seed;
  const random = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  for (let i = 0; i < count; i++) {
    const x = Math.floor(random() * PATTERN_SIZE);
    const y = Math.floor(random() * PATTERN_SIZE);
    const radius = minRadius + random() * (maxRadius - minRadius);
    drawCircle(pattern, x, y, radius);
  }
}

/**
 * Draw grass blade with curve
 */
export function drawGrassBlade(
  pattern: number[][],
  baseX: number,
  baseY: number,
  height: number,
  lean: number, // -1 to 1, negative = left, positive = right
  thickness: number = 2
): void {
  const tipX = baseX + lean * height * 0.3;
  const tipY = baseY - height;
  const cpX = baseX + lean * height * 0.5;
  const cpY = baseY - height * 0.6;

  drawCurve(pattern, baseX, baseY, cpX, cpY, tipX, tipY, thickness);
}

/**
 * Apply a mask to clear pixels outside a circle
 */
export function maskCircle(
  pattern: number[][],
  centerX: number,
  centerY: number,
  radius: number
): void {
  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy > radius * radius) {
        pattern[y]![x] = 0;
      }
    }
  }
}

/**
 * Copy and scale a pattern
 */
export function copyPattern(source: number[][]): number[][] {
  return source.map((row) => [...row]);
}

/**
 * Invert a pattern (0 becomes 1, 1 becomes 0)
 */
export function invertPattern(pattern: number[][]): void {
  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      pattern[y]![x] = pattern[y]![x] ? 0 : 1;
    }
  }
}

/**
 * Shift pattern by offset (wraps around)
 */
export function shiftPattern(pattern: number[][], offsetX: number, offsetY: number): number[][] {
  const result = createEmptyPattern();
  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      const srcX = (((x - offsetX) % PATTERN_SIZE) + PATTERN_SIZE) % PATTERN_SIZE;
      const srcY = (((y - offsetY) % PATTERN_SIZE) + PATTERN_SIZE) % PATTERN_SIZE;
      result[y]![x] = pattern[srcY]![srcX]!;
    }
  }
  return result;
}

/**
 * Mirror pattern horizontally
 */
export function mirrorHorizontal(pattern: number[][]): number[][] {
  const result = createEmptyPattern();
  for (let y = 0; y < PATTERN_SIZE; y++) {
    for (let x = 0; x < PATTERN_SIZE; x++) {
      result[y]![x] = pattern[y]![PATTERN_SIZE - 1 - x]!;
    }
  }
  return result;
}
