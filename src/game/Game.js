import { GameLoop } from './GameLoop.js';
import { Input } from './Input.js';
import { MobileRenderer } from './MobileRenderer.js';
import { Player } from './entities/Player.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new MobileRenderer(canvas);
    this.input = new Input();
    this.player = new Player(48, 124);
    this.bullets = [];
    this.effects = [];
    this.paused = false;
    this.time = 0;

    this.loop = new GameLoop({
      update: (delta) => this.update(delta),
      render: () => this.render(),
    });
  }

  start() {
    this.loop.start();
  }

  getInput() {
    return this.input;
  }

  setPaused(value) {
    this.paused = value;
    if (value) {
      this.input.setMove(0, 0);
      this.input.setActionDown('fire', false);
    }
  }

  update(delta) {
    if (this.paused) return;
    this.time += delta;
    this.player.update(delta, this.input);

    if (this.input.consumeAction('dodge') && this.player.dodge(this.input)) {
      this.effects.push({ type: 'dodge', x: this.player.x, y: this.player.y, life: 0.2, maxLife: 0.2 });
    }

    ['skill1', 'skill2', 'skill3', 'skill4'].forEach((skill, index) => {
      if (this.input.consumeAction(skill)) this.useSkill(index + 1);
    });

    if (this.input.isActionDown('fire') && this.player.canFire()) this.fire();

    this.bullets = this.bullets.filter((bullet) => {
      bullet.x += bullet.vx * delta;
      bullet.y += bullet.vy * delta;
      bullet.life -= delta;
      return bullet.life > 0 && bullet.x > -10 && bullet.x < 330 && bullet.y > 20 && bullet.y < 180;
    });

    this.effects = this.effects.filter((effect) => {
      effect.life -= delta;
      return effect.life > 0;
    });
  }

  fire() {
    const aim = this.input.getAim();
    const originX = this.player.x + this.player.width / 2 + aim.x * 5;
    const originY = this.player.y + this.player.height / 2 + aim.y * 5;
    const speed = 240;
    this.bullets.push({ x: originX, y: originY, vx: aim.x * speed, vy: aim.y * speed, life: 0.75 });
    this.player.fired();
    this.effects.push({ type: 'muzzle', x: originX, y: originY, life: 0.06, maxLife: 0.06 });
  }

  useSkill(number) {
    const aim = this.input.getAim();
    const baseX = this.player.x + this.player.width / 2;
    const baseY = this.player.y + this.player.height / 2;
    this.effects.push({
      type: 'skill',
      number,
      x: baseX + aim.x * 18,
      y: baseY + aim.y * 18,
      radius: 14 + number * 3,
      life: 0.35,
      maxLife: 0.35,
    });
  }

  render() {
    this.renderer.render(this.player, this.bullets, this.effects);
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
  }
}
