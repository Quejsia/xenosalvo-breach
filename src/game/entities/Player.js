import { isGrounded, moveAndCollide } from '../Collision.js';

const SPEED = 90;
const GRAVITY = 620;
const JUMP_SPEED = 220;
const DODGE_SPEED = 190;
const DODGE_TIME = 0.18;

export class Player {
  constructor(x, y, worldWidth = 960) {
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 12;
    this.worldWidth = worldWidth;
    this.aimX = 1;
    this.aimY = 0;
    this.dodgeTimer = 0;
    this.dodgeX = 1;
    this.fireCooldown = 0;
    this.velocityY = 0;
    this.grounded = false;
  }

  update(delta, input, tileMap) {
    const move = input.getMove();
    let moveX = move.x;

    if (Math.abs(moveX) < 0.05) {
      moveX = 0;
      if (input.isDown('a', 'arrowleft')) moveX -= 1;
      if (input.isDown('d', 'arrowright')) moveX += 1;
    }

    const aim = input.getAim();
    this.aimX = aim.x;
    this.aimY = aim.y;
    this.fireCooldown = Math.max(0, this.fireCooldown - delta);

    const wasGrounded = isGrounded(this, tileMap);
    const jumpPressed = input.consumeAction('jump');

    if (wasGrounded && jumpPressed) {
      this.velocityY = -JUMP_SPEED;
      this.grounded = false;
    } else if (this.grounded && !wasGrounded) {
      this.grounded = false;
    }

    // Gravity is always applied while airborne. A falling player stops exactly
    // on the first solid tile below them instead of sinking into the floor.
    if (!wasGrounded || this.velocityY < 0) {
      this.velocityY += GRAVITY * delta;
    } else {
      this.velocityY = 0;
    }

    const horizontalSpeed = this.dodgeTimer > 0 ? this.dodgeX * DODGE_SPEED : moveX * SPEED;
    const result = moveAndCollide(
      this,
      horizontalSpeed * delta,
      this.velocityY * delta,
      tileMap,
    );

    if (result.hitY) this.velocityY = 0;
    this.grounded = result.grounded || isGrounded(this, tileMap);

    if (this.grounded && this.velocityY > 0) this.velocityY = 0;
    if (this.dodgeTimer > 0) this.dodgeTimer = Math.max(0, this.dodgeTimer - delta);
  }

  dodge(input) {
    if (this.dodgeTimer > 0) return false;
    const moveX = input.getMove().x;
    this.dodgeX = Math.abs(moveX) >= 0.2 ? Math.sign(moveX) : Math.sign(this.aimX) || 1;
    this.dodgeTimer = DODGE_TIME;
    return true;
  }

  canFire() {
    return this.fireCooldown <= 0;
  }

  fired(cooldown = 0.12) {
    this.fireCooldown = cooldown;
  }
}
