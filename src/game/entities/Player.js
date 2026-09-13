const SPEED = 90;
const GROUND_Y = 136;
const DODGE_SPEED = 190;
const DODGE_TIME = 0.18;

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 12;
    this.aimX = 1;
    this.aimY = 0;
    this.dodgeTimer = 0;
    this.dodgeX = 1;
    this.dodgeY = 0;
    this.fireCooldown = 0;
  }

  update(delta, input) {
    const touchMove = input.getMove();
    let moveX = touchMove.x;

    // XenoSalvo is a grounded side-scrolling shooter.
    // The left stick's vertical axis must never move the player into the air.
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
      this.x += this.dodgeX * DODGE_SPEED * delta;
    } else {
      this.x += moveX * SPEED * delta;
    }

    this.x = Math.max(8, Math.min(312 - this.width, this.x));

    // Keep the player firmly grounded. Aim direction is independent from movement.
    this.y = GROUND_Y - this.height;
    this.dodgeY = 0;
  }

  dodge(input) {
    if (this.dodgeTimer > 0) return false;

    // Dodge follows horizontal movement only; aiming upward/downward must not make
    // a grounded character fly or float.
    const moveX = input.getMove().x;
    this.dodgeX = Math.abs(moveX) >= 0.2 ? Math.sign(moveX) : Math.sign(this.aimX) || 1;
    this.dodgeY = 0;
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
