import { overlaps } from '../Collision.js';

export class Projectile {
  constructor({ x, y, directionX, directionY, speed = 280, damage = 1, life = 1.2 }) {
    this.x = x;
    this.y = y;
    this.width = 3;
    this.height = 2;
    this.directionX = directionX;
    this.directionY = directionY;
    this.speed = speed;
    this.damage = damage;
    this.life = life;
    this.alive = true;
  }

  update(delta, level, enemies) {
    if (!this.alive) return { hit: null };

    const nextX = this.x + this.directionX * this.speed * delta;
    const nextY = this.y + this.directionY * this.speed * delta;

    // Keep projectiles out of solid terrain instead of letting them tunnel through it.
    if (level?.tileMap?.isSolidWorld(nextX, nextY, this.width, this.height)) {
      this.alive = false;
      return { hit: null, terrain: true };
    }

    this.x = nextX;
    this.y = nextY;
    this.life -= delta;

    for (const enemy of enemies) {
      if (enemy.alive && overlaps(this, enemy)) {
        this.alive = false;
        const defeated = enemy.hit(this.damage);
        return { hit: enemy, defeated };
      }
    }

    if (this.life <= 0) this.alive = false;
    return { hit: null };
  }
}
