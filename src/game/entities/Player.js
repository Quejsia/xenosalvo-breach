import { isGrounded, moveAndCollide } from '../Collision.js';

const SPEED = 90;
const GRAVITY = 620;
const JUMP_SPEED = 220;
const DODGE_SPEED = 190;
const DODGE_TIME = 0.18;
const MAX_HEALTH = 5;
const INVINCIBILITY_TIME = 0.8;
const HURT_TIME = 0.14;
const KNOCKBACK_DECAY = 520;

export class Player {
  constructor(x, y, worldWidth = 960) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 12;
    this.worldWidth = worldWidth;
    this.aimX = 1;
    this.aimY = 0;
    this.moveX = 0;
    this.dodgeTimer = 0;
    this.dodgeX = 1;
    this.fireCooldown = 0;
    this.fireFlashTimer = 0;
    this.velocityY = 0;
    this.knockbackX = 0;
    this.knockbackY = 0;
    this.hurtTimer = 0;
    this.grounded = false;
    this.maxHealth = MAX_HEALTH;
    this.health = MAX_HEALTH;
    this.invincibilityTimer = 0;
    this.alive = true;
  }

  update(delta, input, tileMap) {
    if (!this.alive) return;
    const move = input.getMove();
    let moveX = move.x;
    if (Math.abs(moveX) < 0.05) {
      moveX = 0;
      if (input.isDown('a', 'arrowleft')) moveX -= 1;
      if (input.isDown('d', 'arrowright')) moveX += 1;
    }

    this.moveX = moveX;
    const aim = input.getAim();
    this.aimX = aim.x;
    this.aimY = aim.y;
    this.fireCooldown = Math.max(0, this.fireCooldown - delta);
    this.fireFlashTimer = Math.max(0, this.fireFlashTimer - delta);
    this.invincibilityTimer = Math.max(0, this.invincibilityTimer - delta);
    this.hurtTimer = Math.max(0, this.hurtTimer - delta);

    const wasGrounded = isGrounded(this, tileMap);
    const jumpPressed = input.consumeAction('jump');
    if (wasGrounded && jumpPressed && this.hurtTimer <= 0) {
      this.velocityY = -JUMP_SPEED;
      this.grounded = false;
    }

    if (!wasGrounded || this.velocityY < 0) this.velocityY += GRAVITY * delta;
    else this.velocityY = 0;

    this.knockbackX = approachZero(this.knockbackX, KNOCKBACK_DECAY * delta);
    this.knockbackY = approachZero(this.knockbackY, KNOCKBACK_DECAY * delta);
    if (Math.abs(this.knockbackY) > 0.01) this.velocityY = this.knockbackY;

    const controlLocked = this.hurtTimer > 0;
    const horizontalSpeed = this.dodgeTimer > 0
      ? this.dodgeX * DODGE_SPEED
      : (controlLocked ? 0 : moveX * SPEED) + this.knockbackX;
    const result = moveAndCollide(this, horizontalSpeed * delta, this.velocityY * delta, tileMap);
    if (result.hitX) this.knockbackX = 0;
    if (result.hitY) {
      this.velocityY = 0;
      this.knockbackY = 0;
    }
    this.grounded = result.grounded || isGrounded(this, tileMap);
    if (this.grounded && this.velocityY > 0) this.velocityY = 0;
    if (this.dodgeTimer > 0) this.dodgeTimer = Math.max(0, this.dodgeTimer - delta);
  }

  dodge(input) {
    if (!this.alive || this.dodgeTimer > 0 || this.hurtTimer > 0) return false;
    const moveX = input.getMove().x;
    this.dodgeX = Math.abs(moveX) >= 0.2 ? Math.sign(moveX) : Math.sign(this.aimX) || 1;
    this.dodgeTimer = DODGE_TIME;
    return true;
  }

  damage(amount = 1, knockbackX = 0, knockbackY = 0) {
    if (!this.alive || this.invincibilityTimer > 0 || this.dodgeTimer > 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invincibilityTimer = INVINCIBILITY_TIME;
    this.hurtTimer = HURT_TIME;
    this.knockbackX = knockbackX;
    this.knockbackY = knockbackY;
    this.velocityY = knockbackY;
    if (this.health <= 0) this.alive = false;
    return true;
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.moveX = 0;
    this.velocityY = 0;
    this.knockbackX = 0;
    this.knockbackY = 0;
    this.hurtTimer = 0;
    this.dodgeTimer = 0;
    this.fireFlashTimer = 0;
    this.health = this.maxHealth;
    this.invincibilityTimer = 0;
    this.alive = true;
  }

  canFire() { return this.alive && this.hurtTimer <= 0 && this.fireCooldown <= 0; }

  fired(cooldown = 0.12) {
    this.fireCooldown = cooldown;
    this.fireFlashTimer = 0.07;
  }
}

function approachZero(value, amount) {
  if (value > 0) return Math.max(0, value - amount);
  if (value < 0) return Math.min(0, value + amount);
  return 0;
}
