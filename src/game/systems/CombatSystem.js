import { overlapsEntityHurtbox } from '../combat/Hitbox.js';

export class CombatSystem {
  constructor({ player, enemies, camera, effects, particles, onScore }) {
    this.player = player;
    this.enemies = enemies;
    this.camera = camera;
    this.effects = effects;
    this.particles = particles;
    this.onScore = onScore;
  }

  applyPlayerProjectile(projectile, enemies) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (!overlapsEntityHurtbox(projectile, enemy)) continue;

      const defeated = enemy.hit(projectile.damage, projectile.directionX * 34, projectile.directionY * 16);
      if (projectile.hitApplied) return null;
      projectile.hitApplied = true;
      projectile.alive = false;
      this.onEnemyHit(enemy, defeated);
      return enemy;
    }
    return null;
  }

  applyEnemyProjectile(projectile) {
    if (!this.player.alive || !overlapsEntityHurtbox(projectile, this.player)) return false;
    projectile.hitApplied = true;
    projectile.alive = false;
    const accepted = this.player.damage(
      projectile.damage,
      projectile.directionX * 42,
      projectile.directionY * 20,
    );
    if (!accepted) return false;

    this.onPlayerHit();
    return true;
  }

  onEnemyHit(enemy, defeated) {
    this.effects.push({
      type: defeated ? 'defeat' : 'hit',
      x: enemy.x,
      y: enemy.y,
      life: 0.16,
      maxLife: 0.16,
    });
    this.particles.burst(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      {
        count: defeated ? 12 : 6,
        speed: defeated ? 55 : 34,
        life: defeated ? 0.38 : 0.22,
        gravity: 70,
        spread: Math.PI * 2,
      },
    );
    this.camera.shake(defeated ? 2 : 1.1, defeated ? 0.16 : 0.09);
    if (defeated) this.onScore(100);
  }

  onPlayerHit() {
    this.effects.push({
      type: 'player-hit',
      x: this.player.x,
      y: this.player.y,
      life: 0.18,
      maxLife: 0.18,
    });
    this.particles.burst(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      { count: 9, speed: 42, life: 0.28, gravity: 90, spread: Math.PI * 2 },
    );
    this.camera.shake(this.player.alive ? 2.5 : 4, this.player.alive ? 0.2 : 0.35);

    if (!this.player.alive) {
      this.effects.push({
        type: 'player-death',
        x: this.player.x,
        y: this.player.y,
        life: 0.7,
        maxLife: 0.7,
      });
      this.particles.burst(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        { count: 18, speed: 65, life: 0.55, gravity: 120, spread: Math.PI * 2 },
      );
    }
  }
}
