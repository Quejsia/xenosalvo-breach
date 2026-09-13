import { GameLoop } from './GameLoop.js';
import { Input } from './Input.js';
import { Renderer } from './Renderer.js';
import { Player } from './entities/Player.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.player = new Player(48, 132);
    this.paused = false;

    this.loop = new GameLoop({
      update: (delta) => this.update(delta),
      render: () => this.render(),
    });
  }

  start() {
    this.loop.start();
  }

  setPaused(value) {
    this.paused = value;
  }

  update(delta) {
    if (this.paused) return;
    this.player.update(delta, this.input);
  }

  render() {
    this.renderer.render(this.player);
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
  }
}
