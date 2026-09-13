import { moveHorizontal } from '../Collision.js';

const SPEED = 90;
const GROUND_Y = 128;
const DODGE_SPEED = 190;
const DODGE_TIME = 0.18;

export class Player {
  constructor(x, y, worldWidth = 960) {
    this.x = x;
    this.y = GROUND_Y - 12;
    this.width = 8;
    this.height = 12;
    this.worldWidth = worldWidth;
    this.aimX = 1;
    this.aimY = 0;
    this.dodgeTimer = 0;
    this.dodgeX = 1;
    this.fireCooldown = 0;
  }

  update(delta, input) {
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

    if (this.dodgeTimer > 0) {
      this.dodgeTimer = Math.max(0, this.dodgeTimer - delta);
      moveHorizontal(this, this.dodgeX * DODGE_SPEED * delta, this.worldWidth);
    } else {
      moveHorizontal(this, moveX * SPEED * delta, this.worldWidth);
    }

    this.y = GROUND_Y - this.height;
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
