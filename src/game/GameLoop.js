export class GameLoop {
  constructor({ update, render }) {
    this.update = update;
    this.render = render;
    this.running = false;
    this.lastTime = 0;
    this.frameId = null;

    this.frame = (time) => {
      if (!this.running) return;

      const delta = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.update(delta);
      this.render();
      this.frameId = requestAnimationFrame(this.frame);
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }
}
