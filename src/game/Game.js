import { GameLoop } from './GameLoop.js';
import { Input } from './Input.js';
import { Renderer } from './Renderer.js';
import { overlaps } from './Collision.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.player = new Player(48, 124);
    this.enemies = [new Enemy(230, 124, 1), new Enemy(285, 124, 2)];
    this.bullets = [];
    this.effects = [];
    this.paused = false;
    this.time = 0;
    this.score = 0;

    this.loop = new GameLoop({
      update: (delta) => this.update(delta),
      render: () => this.render(),
    });
  }

  getInput() {
    return this.input;
  }

  start() {
    this.render();
    this.loop.start();
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

    if (this.input.consumeAction('dodge')) {
      if (this.player.dodge(this.input)) {
        this.effects.push({ type: 'dodge', x: this.player.x, y: this.player.y, life: 0.2, maxLife: 0.2 });
      }
    }

    ['skill1', 'skill2', 'skill3', 'skill4'].forEach((skill, index) => {
      if (this.input.consumeAction(skill)) this.useSkill(index + 1);
    });

    if (this.input.isActionDown('fire') && this.player.canFire()) {
      this.fire();
    }

    this.enemies.forEach((enemy) => enemy.update(delta, this.player));

    this.bullets = this.bullets.filter((bullet) => {
      bullet.x += bullet.vx * delta;
      bullet.y += bullet.vy * delta;
      bullet.life -= delta;

      for (const enemy of this.enemies) {
        if (enemy.alive && overlaps(bullet, enemy)) {
          const defeated = enemy.hit(bullet.damage);
          bullet.life = 0;
          this.effects.push({ type: defeated ? 'defeat' : 'hit', x: enemy.x, y: enemy.y, life: 0.16, maxLife: 0.16 });
          if (defeated) this.score += 100;
          break;
        }
      }

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

    this.bullets.push({
      x: originX,
      y: originY,
      width: 3,
      height: 2,
      vx: aim.x * speed,
      vy: aim.y * speed,
      life: 0.75,
      damage: 1,
    });
    this.player.fired();
    this.effects.push({ type: 'muzzle', x: originX, y: originY, life: 0.06, maxLife: 0.06 });
  }

  useSkill(number) {
    const aim = this.input.getAim();
    const baseX = this.player.x + this.player.width / 2;
    const baseY = this.player.y + this.player.height / 2;
    const radius = 14 + number * 3;

    this.effects.push({
      type: 'skill',
      number,
      x: baseX + aim.x * 18,
      y: baseY + aim.y * 18,
      radius,
      life: 0.35,
      maxLife: 0.35,
    });
  }

  render() {
    this.renderer.render(this.player, this.bullets, this.enemies, this.effects, this.score);
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
  }
}
