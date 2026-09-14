import { overlapsEntityHurtbox } from '../combat/Hitbox.js';

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
    this.hitApplied = false;
  }

  update(delta, level) {
    if (!this.alive) return { hit: null };

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
    }

    this.life -= delta;
    if (this.life <= 0) this.alive = false;
    return { hit: null };
  }

  canHit(target) {
    return this.alive && !this.hitApplied && target?.alive && overlapsEntityHurtbox(this, target);
  }
}
