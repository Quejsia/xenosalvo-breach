import { TileMap } from './TileMap.js';

export class Level {
  constructor() {
    this.tileMap = new TileMap();
    this.spawn = { x: 48, y: 116 };
  }

  get width() {
    return this.tileMap.getWorldWidth();
  }

  get height() {
    return this.tileMap.getWorldHeight();
  }

  reset() {
    this.tileMap = new TileMap();
  }
}
