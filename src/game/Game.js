import { GameLoop } from './GameLoop.js';
import { Input } from './Input.js';
import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Projectile } from './entities/Projectile.js';
import { Weapon } from './entities/Weapon.js';
import { Level } from './world/Level.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.level = new Level();
    this.camera = new Camera();
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.player = new Player(this.level.spawn.x, this.level.spawn.y, this.level.width);
    this.weapon = new Weapon();
    this.enemies = [
      new Enemy(230, 116, 1),
      new Enemy(420, 116, 2),
      new Enemy(650, 116, 3),
      new Enemy(820, 116, 4),
    ];
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

  getInput() { return this.input; }

  start() {
    this.render();
    this.loop.start();
  }

  setPaused(value) {
    this.paused = value;
    if (value) {
      this.input.setMove(0, 0);
      this.input.endFire();
    }
  }

  update(delta) {
    if (this.paused) return;
    this.time += delta;

    this.weapon.update(delta);
    this.player.update(delta, this.input, this.level.tileMap);
    this.camera.update(this.player, delta);

    if (this.input.consumeAction('dodge') && this.player.dodge(this.input)) {
      this.effects.push({ type: 'dodge', x: this.player.x, y: this.player.y, life: 0.2, maxLife: 0.2 });
    }

    ['skill1', 'skill2', 'skill3', 'skill4'].forEach((skill, index) => {
      if (this.input.consumeAction(skill)) this.useSkill(index + 1);
    });

    if (this.input.isActionDown('fire') && this.weapon.canFire()) {
      const projectile = this.weapon.fire(this.player, this.input, Projectile);
      if (projectile) {
        this.bullets.push(projectile);
        const aim = this.input.getAim();
        this.effects.push({
          type: 'muzzle',
          x: projectile.x,
          y: projectile.y,
          dx: aim.x,
          dy: aim.y,
          life: 0.07,
          maxLife: 0.07,
        });
      }
    }

    this.enemies.forEach((enemy) => enemy.update(delta, this.player));

    this.bullets = this.bullets.filter((bullet) => {
      const result = bullet.update(delta, this.level, this.enemies);

      if (result.terrain) {
        this.effects.push({ type: 'impact', x: bullet.x, y: bullet.y, life: 0.08, maxLife: 0.08 });
      }

      if (result.hit) {
        this.effects.push({
          type: result.defeated ? 'defeat' : 'hit',
          x: result.hit.x,
          y: result.hit.y,
          life: 0.16,
          maxLife: 0.16,
        });
        if (result.defeated) this.score += 100;
      }

      return bullet.alive;
    });

    this.effects = this.effects.filter((effect) => {
      effect.life -= delta;
      return effect.life > 0;
    });
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
    this.renderer.render(this.player, this.bullets, this.enemies, this.effects, this.score, this.camera, this.level);
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
  }
}
