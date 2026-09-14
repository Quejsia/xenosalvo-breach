const VIEW_WIDTH = 320;
const WORLD_WIDTH = 960;

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = VIEW_WIDTH;
    this.worldWidth = WORLD_WIDTH;
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  update(target, delta) {
    const desiredX = target.x + target.width / 2 - this.width * 0.42;
    const maxX = Math.max(0, this.worldWidth - this.width);
    const clamped = Math.max(0, Math.min(maxX, desiredX));
    const smoothing = Math.min(delta * 10, 1);
    this.x += (clamped - this.x) * smoothing;

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - delta);
      const strength = this.shakeStrength * (this.shakeTime > 0 ? this.shakeTime / 0.2 : 0);
      this.offsetX = (Math.random() * 2 - 1) * strength;
      this.offsetY = (Math.random() * 2 - 1) * strength;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.shakeStrength = 0;
    }
  }

  shake(strength = 2, duration = 0.2) {
    this.shakeStrength = Math.max(this.shakeStrength, strength);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}
