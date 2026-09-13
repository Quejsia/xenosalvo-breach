export const TILE_SIZE = 16;
export const WORLD_WIDTH_TILES = 60;
export const WORLD_HEIGHT_TILES = 12;

const SOLID_TILES = new Set([1, 2, 3]);

export class TileMap {
  constructor() {
    this.width = WORLD_WIDTH_TILES;
    this.height = WORLD_HEIGHT_TILES;
    this.tiles = this.createLayout();
  }

  createLayout() {
    const tiles = Array.from({ length: this.height }, () => Array(this.width).fill(0));
    const groundRow = 8;

    for (let x = 0; x < this.width; x += 1) {
      tiles[groundRow][x] = 1;
      tiles[groundRow + 1][x] = 2;
      tiles[groundRow + 2][x] = 2;
      tiles[groundRow + 3][x] = 3;
    }

    const platforms = [
      { x: 9, y: 6, w: 5 },
      { x: 18, y: 5, w: 4 },
      { x: 28, y: 7, w: 6 },
      { x: 40, y: 5, w: 5 },
      { x: 51, y: 6, w: 4 },
    ];

    platforms.forEach(({ x, y, w }) => {
      for (let tileX = x; tileX < x + w; tileX += 1) tiles[y][tileX] = 1;
    });

    return tiles;
  }

  getTile(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return 3;
    return this.tiles[ty][tx];
  }

  isSolid(tx, ty) {
    return SOLID_TILES.has(this.getTile(tx, ty));
  }

  getWorldWidth() {
    return this.width * TILE_SIZE;
  }

  getWorldHeight() {
    return this.height * TILE_SIZE;
  }

  forEachVisibleTile(cameraX, callback) {
    const startX = Math.max(0, Math.floor(cameraX / TILE_SIZE) - 1);
    const endX = Math.min(this.width - 1, Math.ceil((cameraX + 320) / TILE_SIZE) + 1);
    for (let y = 0; y < this.height; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const tile = this.tiles[y][x];
        if (tile) callback(tile, x, y);
      }
    }
  }
}
