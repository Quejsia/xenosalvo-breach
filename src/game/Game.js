import { GameLoop } from './GameLoop.js';
import { Input } from './Input.js';
import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { overlaps } from './Collision.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Projectile } from './entities/Projectile.js';
import { Weapon } from './entities/Weapon.js';
import { Level } from './world/Level.js';
import { ParticleSystem } from './systems/ParticleSystem.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.level = new Level();
    this.camera = new Camera();
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.weapon = new Weapon();
    this.particles = new ParticleSystem();
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.effects = [];
    this.paused = false;
    this.gameOver = false;
    this.time = 0;
    this.score = 0;
    this.createActors();
    this.loop = new GameLoop({ update: (delta) => this.update(delta), render: () => this.render() });
  }

  createActors() {
    this.player = new Player(this.level.spawn.x, this.level.spawn.y, this.level.width);
    this.enemies = [
      new Enemy(230, 116, 1),
      new Enemy(420, 116, 2),
      new Enemy(650, 116, 3),
      new Enemy(820, 116, 4),
    ];
    this.bullets = [];
    this.enemyBullets = [];
    this.effects = [];
    this.particles.clear();
    this.gameOver = false;
  }

  getInput() { return this.input; }
  isGameOver() { return this.gameOver; }

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

  restart() {
    this.createActors();
    this.camera.reset();
    this.weapon.reset?.();
    this.time = 0;
    this.score = 0;
    this.paused = false;
    this.input.setMove(0, 0);
    this.input.endFire();
    this.input.consumeAction('restart');
    this.render();
  }

  update(delta) {
    if (this.paused) return;
    this.time += delta;

    if (this.gameOver) {
      this.particles.update(delta);
      if (this.input.consumeAction('restart')) this.restart();
      return;
    }

    this.weapon.update(delta);
    this.player.update(delta, this.input, this.level.tileMap);
    this.camera.update(this.player, delta);

    if (this.input.consumeAction('dodge') && this.player.dodge(this.input)) {
      this.effects.push({ type: 'dodge', x: this.player.x, y: this.player.y, life: 0.2, maxLife: 0.2 });
      this.particles.burst(this.player.x + this.player.width / 2, this.player.y + this.player.height, { count: 6, speed: 30, life: 0.22, gravity: 90, spread: Math.PI * 0.8, angle: Math.PI / 2 });
      this.camera.shake(1.2, 0.12);
    }

    ['skill1', 'skill2', 'skill3', 'skill4'].forEach((skill, index) => {
      if (this.input.consumeAction(skill)) this.useSkill(index + 1);
    });

    if (this.input.isActionDown('fire') && this.weapon.canFire()) {
      const projectile = this.weapon.fire(this.player, this.input, Projectile);
      if (projectile) {
        this.bullets.push(projectile);
        const aim = this.input.getAim();
        this.effects.push({ type: 'muzzle', x: projectile.x, y: projectile.y, dx: aim.x, dy: aim.y, life: 0.07, maxLife: 0.07 });
        this.particles.burst(projectile.x, projectile.y, { count: 3, speed: 22, life: 0.1, size: 1, spread: 0.7, angle: Math.atan2(-aim.y, -aim.x) });
        this.camera.shake(0.45, 0.06);
      }
    }

    this.enemies.forEach((enemy) => {
      enemy.update(delta, this.player);
      const shot = enemy.attack(this.player);
      if (shot) {
        this.enemyBullets.push(new Projectile(shot));
        this.effects.push({ type: 'enemy-fire', x: shot.x, y: shot.y, life: 0.1, maxLife: 0.1 });
        this.particles.burst(shot.x, shot.y, { count: 3, speed: 18, life: 0.12, spread: 0.9, angle: Math.atan2(shot.directionY, shot.directionX) });
      }
    });

    this.bullets = this.bullets.filter((bullet) => {
      const result = bullet.update(delta, this.level, this.enemies);
      if (result.terrain) {
        this.effects.push({ type: 'impact', x: bullet.x, y: bullet.y, life: 0.08, maxLife: 0.08 });
        this.particles.burst(bullet.x, bullet.y, { count: 4, speed: 28, life: 0.16, spread: Math.PI * 2 });
      }
      if (result.hit) {
        this.effects.push({ type: result.defeated ? 'defeat' : 'hit', x: result.hit.x, y: result.hit.y, life: 0.16, maxLife: 0.16 });
        this.particles.burst(result.hit.x + result.hit.width / 2, result.hit.y + result.hit.height / 2, { count: result.defeated ? 12 : 5, speed: result.defeated ? 55 : 32, life: result.defeated ? 0.38 : 0.2, gravity: 70, spread: Math.PI * 2 });
        this.camera.shake(result.defeated ? 2 : 0.9, result.defeated ? 0.16 : 0.08);
        if (result.defeated) this.score += 100;
      }
      return bullet.alive;
    });

    this.enemyBullets = this.enemyBullets.filter((bullet) => {
      const result = bullet.update(delta, this.level, [], this.player);
      if (result.terrain) {
        this.effects.push({ type: 'impact', x: bullet.x, y: bullet.y, life: 0.08, maxLife: 0.08 });
        this.particles.burst(bullet.x, bullet.y, { count: 4, speed: 25, life: 0.15, spread: Math.PI * 2 });
      }
      if (result.playerHit && this.player.damage(result.damage)) {
        this.effects.push({ type: 'player-hit', x: this.player.x, y: this.player.y, life: 0.18, maxLife: 0.18 });
        this.particles.burst(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, { count: 9, speed: 42, life: 0.28, gravity: 90, spread: Math.PI * 2 });
        this.camera.shake(2.5, 0.2);
        if (!this.player.alive) {
          this.gameOver = true;
          this.effects.push({ type: 'player-death', x: this.player.x, y: this.player.y, life: 0.7, maxLife: 0.7 });
          this.particles.burst(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, { count: 18, speed: 65, life: 0.55, gravity: 120, spread: Math.PI * 2 });
          this.camera.shake(4, 0.35);
        }
      }
      return bullet.alive;
    });

    this.particles.update(delta);
    this.effects = this.effects.filter((effect) => {
      effect.life -= delta;
      return effect.life > 0;
    });
  }

  useSkill(number) {
    if (!this.player.alive) return;
    const aim = this.input.getAim();
    const baseX = this.player.x + this.player.width / 2;
    const baseY = this.player.y + this.player.height / 2;
    this.effects.push({ type: 'skill', number, x: baseX + aim.x * 18, y: baseY + aim.y * 18, radius: 14 + number * 3, life: 0.35, maxLife: 0.35 });
    this.particles.burst(baseX + aim.x * 18, baseY + aim.y * 18, { count: 10 + number * 2, speed: 35 + number * 6, life: 0.3, spread: Math.PI * 2 });
    this.camera.shake(0.8 + number * 0.25, 0.1);
  }

  render() {
    this.renderer.render(this.player, this.bullets, this.enemies, this.effects, this.score, this.camera, this.level, this.enemyBullets, this.gameOver, this.particles.particles);
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
  }
}
