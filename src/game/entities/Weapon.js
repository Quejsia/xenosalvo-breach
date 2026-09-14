const FIRE_INTERVAL = 0.12;
const PROJECTILE_SPEED = 280;
const MUZZLE_OFFSET = 7;

export class Weapon {
  constructor() {
    this.cooldown = 0;
    this.shotCount = 0;
  }

  update(delta) {
    this.cooldown = Math.max(0, this.cooldown - delta);
  }

  canFire() {
    return this.cooldown <= 0;
  }

  fire(player, input, ProjectileClass) {
    if (!this.canFire()) return null;

    const aim = input.getAim();
    const length = Math.hypot(aim.x, aim.y) || 1;
    const dx = aim.x / length;
    const dy = aim.y / length;
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    this.cooldown = FIRE_INTERVAL;
    this.shotCount += 1;
    player.fired(FIRE_INTERVAL);

    return new ProjectileClass({
      x: centerX + dx * MUZZLE_OFFSET,
      y: centerY + dy * MUZZLE_OFFSET,
      directionX: dx,
      directionY: dy,
      speed: PROJECTILE_SPEED,
      damage: 1,
      life: 1.2,
    });
  }
}
