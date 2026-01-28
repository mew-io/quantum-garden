/**
 * Spatial Grid - Efficient spatial indexing for plant lookups
 *
 * Divides the canvas into cells for O(1) average-case lookups
 * instead of O(n) brute-force iteration through all plants.
 *
 * Used by the ObservationSystem to quickly find plants within
 * observation regions without iterating through all 1000+ plants.
 */

import type { Plant, Position } from "@quantum-garden/shared";

/**
 * Spatial grid for efficient plant lookups.
 *
 * Plants are indexed by their position into grid cells.
 * Queries for plants in a region only check relevant cells.
 */
export class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, Set<Plant>> = new Map();
  private plantCells: Map<string, string[]> = new Map();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
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
   */
  rebuild(plants: Plant[]): void {
    this.cells.clear();
    this.plantCells.clear();

    for (const plant of plants) {
      this.addPlant(plant);
    }
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
}
