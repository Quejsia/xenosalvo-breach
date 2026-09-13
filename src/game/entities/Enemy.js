const SPEED = 24;

export class Enemy {
  constructor(x, y, id = 0) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.width = 10;
    this.height = 12;
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.hitTimer = 0;
    this.attackTimer = 0;
  }

  update(delta, player) {
    this.hitTimer = Math.max(0, this.hitTimer - delta);
    this.attackTimer = Math.max(0, this.attackTimer - delta);

    const targetX = player.x + player.width / 2;
    const centerX = this.x + this.width / 2;
    const distance = targetX - centerX;

    if (Math.abs(distance) > 28) {
      this.x += Math.sign(distance) * SPEED * delta;
    }

    this.x = Math.max(10, Math.min(310 - this.width, this.x));
  }

  hit(damage = 1) {
    this.health -= damage;
    this.hitTimer = 0.08;
    return this.health <= 0;
  }

  get alive() {
    return this.health > 0;
  }
}
