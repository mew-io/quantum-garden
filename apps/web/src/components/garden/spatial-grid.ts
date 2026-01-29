/**
 * Spatial Grid - Efficient spatial indexing for plant lookups
 *
 * Divides the canvas into cells for O(1) average-case lookups
 * instead of O(n) brute-force iteration through all plants.
 *
 * Used by the ObservationSystem to quickly find plants within
 * observation regions without iterating through all 1000+ plants.
 *
 * The grid supports adaptive cell sizing based on plant distribution:
 * - Dense gardens get smaller cells (fewer plants per cell for faster queries)
 * - Sparse gardens get larger cells (fewer cells to check)
 * - Cell size is bounded between minCellSize and maxCellSize
 */

import type { Plant, Position } from "@quantum-garden/shared";

/** Configuration for adaptive cell sizing */
interface AdaptiveConfig {
  /** Target number of plants per cell for optimal query performance */
  targetPlantsPerCell: number;
  /** Minimum cell size (prevents too many tiny cells) */
  minCellSize: number;
  /** Maximum cell size (prevents too few large cells) */
  maxCellSize: number;
}

const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  targetPlantsPerCell: 12, // Balance between cell count and plants per cell
  minCellSize: 80, // No smaller than ~half a plant spacing
  maxCellSize: 300, // No larger than typical screen section
};

/**
 * Spatial grid for efficient plant lookups.
 *
 * Plants are indexed by their position into grid cells.
 * Queries for plants in a region only check relevant cells.
 *
 * Cell size can be fixed or adapt dynamically based on plant distribution.
 */
export class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, Set<Plant>> = new Map();
  private plantCells: Map<string, string[]> = new Map();
  private adaptiveConfig: AdaptiveConfig;
  private adaptiveModeEnabled: boolean;

  /**
   * Create a new spatial grid.
   * @param cellSize Initial cell size (or fixed size if adaptive mode is disabled)
   * @param adaptiveConfig Optional config for adaptive cell sizing (enables adaptive mode)
   */
  constructor(cellSize: number, adaptiveConfig?: Partial<AdaptiveConfig>) {
    this.cellSize = cellSize;
    this.adaptiveConfig = { ...DEFAULT_ADAPTIVE_CONFIG, ...adaptiveConfig };
    this.adaptiveModeEnabled = adaptiveConfig !== undefined;
  }

  /**
   * Get the cell key for a position.
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Rebuild the grid with new plant data.
   * In adaptive mode, recalculates optimal cell size based on plant distribution.
   */
  rebuild(plants: Plant[]): void {
    this.cells.clear();
    this.plantCells.clear();

    // Adapt cell size if enabled
    if (this.adaptiveModeEnabled && plants.length > 0) {
      this.cellSize = this.calculateOptimalCellSize(plants);
    }

    for (const plant of plants) {
      this.addPlant(plant);
    }
  }

  /**
   * Calculate optimal cell size based on plant distribution.
   *
   * The algorithm:
   * 1. Calculate the bounding box of all plants
   * 2. Estimate ideal cell count: plantCount / targetPlantsPerCell
   * 3. Calculate cell size: sqrt(area / cellCount)
   * 4. Clamp to min/max bounds
   *
   * This ensures:
   * - Dense clusters get smaller cells for faster queries
   * - Sparse distributions get larger cells to minimize overhead
   */
  private calculateOptimalCellSize(plants: Plant[]): number {
    const { targetPlantsPerCell, minCellSize, maxCellSize } = this.adaptiveConfig;

    // Calculate bounding box
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (const plant of plants) {
      minX = Math.min(minX, plant.position.x);
      maxX = Math.max(maxX, plant.position.x);
      minY = Math.min(minY, plant.position.y);
      maxY = Math.max(maxY, plant.position.y);
    }

    // Add padding to avoid edge cases where plants are exactly on bounds
    const padding = 10;
    const width = Math.max(maxX - minX + padding * 2, minCellSize);
    const height = Math.max(maxY - minY + padding * 2, minCellSize);
    const area = width * height;

    // Calculate ideal number of cells
    const idealCellCount = Math.max(1, plants.length / targetPlantsPerCell);

    // Calculate cell size (assuming square cells)
    const idealCellSize = Math.sqrt(area / idealCellCount);

    // Clamp to bounds
    return Math.min(maxCellSize, Math.max(minCellSize, idealCellSize));
  }

  /**
   * Add a plant to the grid.
   */
  private addPlant(plant: Plant): void {
    const key = this.getCellKey(plant.position.x, plant.position.y);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = new Set();
      this.cells.set(key, cell);
    }
    cell.add(plant);
    this.plantCells.set(plant.id, [key]);
  }

  /**
   * Get all plants within a circular region.
   * Checks cells that overlap with the region bounds.
   */
  getPlantsInRegion(center: Position, radius: number): Plant[] {
    const plants: Plant[] = [];
    const checked = new Set<string>();

    // Calculate cell range that could overlap with region
    const minCellX = Math.floor((center.x - radius) / this.cellSize);
    const maxCellX = Math.floor((center.x + radius) / this.cellSize);
    const minCellY = Math.floor((center.y - radius) / this.cellSize);
    const maxCellY = Math.floor((center.y + radius) / this.cellSize);

    // Check all cells in range
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cell = this.cells.get(key);
        if (cell) {
          for (const plant of cell) {
            if (!checked.has(plant.id)) {
              checked.add(plant.id);
              plants.push(plant);
            }
          }
        }
      }
    }

    return plants;
  }

  /**
   * Get the cell size used by this grid.
   */
  getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Get the number of non-empty cells.
   */
  getCellCount(): number {
    return this.cells.size;
  }

  /**
   * Get the total number of indexed plants.
   */
  getPlantCount(): number {
    return this.plantCells.size;
  }

  /**
   * Enable or disable adaptive cell sizing.
   * When enabled, cell size will be recalculated on each rebuild.
   * @param enabled Whether to enable adaptive mode
   * @param config Optional config overrides
   */
  setAdaptiveMode(enabled: boolean, config?: Partial<AdaptiveConfig>): void {
    this.adaptiveModeEnabled = enabled;
    if (config) {
      this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
    }
  }

  /**
   * Check if adaptive mode is enabled.
   */
  isAdaptiveModeEnabled(): boolean {
    return this.adaptiveModeEnabled;
  }

  /**
   * Get grid statistics for debugging/monitoring.
   */
  getStats(): {
    cellSize: number;
    cellCount: number;
    plantCount: number;
    avgPlantsPerCell: number;
    maxPlantsPerCell: number;
    adaptiveMode: boolean;
  } {
    const plantCount = this.plantCells.size;
    const cellCount = this.cells.size;

    let maxPlantsPerCell = 0;
    for (const cell of this.cells.values()) {
      maxPlantsPerCell = Math.max(maxPlantsPerCell, cell.size);
    }

    return {
      cellSize: this.cellSize,
      cellCount,
      plantCount,
      avgPlantsPerCell: cellCount > 0 ? plantCount / cellCount : 0,
      maxPlantsPerCell,
      adaptiveMode: this.adaptiveModeEnabled,
    };
  }
}
