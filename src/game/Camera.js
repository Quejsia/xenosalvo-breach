const VIEW_WIDTH = 320;
const WORLD_WIDTH = 960;

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = VIEW_WIDTH;
    this.worldWidth = WORLD_WIDTH;
  }

  update(target, delta) {
    const desiredX = target.x + target.width / 2 - this.width * 0.42;
    const maxX = Math.max(0, this.worldWidth - this.width);
    const clamped = Math.max(0, Math.min(maxX, desiredX));
    const smoothing = Math.min(delta * 10, 1);
    this.x += (clamped - this.x) * smoothing;
  }

  reset() {
    this.x = 0;
    this.y = 0;
  }
}
