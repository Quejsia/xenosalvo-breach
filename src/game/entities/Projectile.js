import { overlaps } from '../Collision.js';

export class Projectile {
  constructor({ x, y, directionX, directionY, speed = 240, damage = 1, life = 1.2, enemyShot = false }) {
    this.x = x;
    this.y = y;
    this.width = 4;
    this.height = 3;
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

    // Use a swept movement in small steps so fast bullets cannot visually or
    // physically skip through thin targets/terrain between frames.
    const distance = this.speed * delta;
    const steps = Math.max(1, Math.ceil(distance / 4));
    const stepX = this.directionX * (distance / steps);
    const stepY = this.directionY * (distance / steps);

    for (let step = 0; step < steps; step += 1) {
      this.x += stepX;
      this.y += stepY;

      if (level?.tileMap?.isSolidWorld(this.x, this.y, this.width, this.height)) {
        this.alive = false;
        return { hit: null, terrain: true };
      }

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
    }

    this.life -= delta;
    if (this.life <= 0) this.alive = false;
    return { hit: null };
  }
}
