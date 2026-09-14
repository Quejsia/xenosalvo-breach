import { overlaps } from '../Collision.js';

export class Projectile {
  constructor({ x, y, directionX, directionY, speed = 280, damage = 1, life = 1.2, enemyShot = false }) {
    this.x = x;
    this.y = y;
    this.width = enemyShot ? 3 : 3;
    this.height = 2;
    this.directionX = directionX;
    this.directionY = directionY;
    this.speed = speed;
    this.damage = damage;
    this.life = life;
    this.enemyShot = enemyShot;
    this.alive = true;
  }

  update(delta, level, enemies = [], player = null) {
    if (!this.alive) return { hit: null };
    const nextX = this.x + this.directionX * this.speed * delta;
    const nextY = this.y + this.directionY * this.speed * delta;

    if (level?.tileMap?.isSolidWorld(nextX, nextY, this.width, this.height)) {
      this.alive = false;
      return { hit: null, terrain: true };
    }

    this.x = nextX;
    this.y = nextY;
    this.life -= delta;

    if (this.enemyShot) {
      if (player?.alive && overlaps(this, player)) {
        this.alive = false;
        return { playerHit: player, damage: this.damage };
      }
    } else {
      for (const enemy of enemies) {
        if (enemy.alive && overlaps(this, enemy)) {
          this.alive = false;
          return { hit: enemy, defeated: enemy.hit(this.damage) };
        }
      }
    }

    if (this.life <= 0) this.alive = false;
    return { hit: null };
  }
}
