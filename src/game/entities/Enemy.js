const SPEED = 24;
const WORLD_WIDTH = 960;
const GROUND_Y = 128;
const ATTACK_RANGE = 210;
const ATTACK_COOLDOWN = 1.35;

export class Enemy {
  constructor(x, y, id = 0) {
    this.x = x;
    this.y = GROUND_Y - 12;
    this.id = id;
    this.width = 10;
    this.height = 12;
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.hitTimer = 0;
    this.attackTimer = 0.4 + (id % 3) * 0.25;
  }

  update(delta, player) {
    this.hitTimer = Math.max(0, this.hitTimer - delta);
    this.attackTimer = Math.max(0, this.attackTimer - delta);
    const targetX = player.x + player.width / 2;
    const centerX = this.x + this.width / 2;
    const distance = targetX - centerX;

    if (Math.abs(distance) > 44) this.x += Math.sign(distance) * SPEED * delta;
    this.x = Math.max(10, Math.min(WORLD_WIDTH - this.width - 10, this.x));
    this.y = GROUND_Y - this.height;
  }

  canAttack(player) {
    if (!this.alive || !player.alive || this.attackTimer > 0) return false;
    const distance = Math.abs((player.x + player.width / 2) - (this.x + this.width / 2));
    return distance <= ATTACK_RANGE;
  }

  attack(player) {
    if (!this.canAttack(player)) return null;
    this.attackTimer = ATTACK_COOLDOWN + (this.id % 2) * 0.2;
    const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
    const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
    const length = Math.hypot(dx, dy) || 1;
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      directionX: dx / length,
      directionY: dy / length,
      speed: 130,
      damage: 1,
      life: 2,
      enemyShot: true,
    };
  }

  hit(damage = 1) {
    this.health -= damage;
    this.hitTimer = 0.08;
    return this.health <= 0;
  }

  get alive() { return this.health > 0; }
}
