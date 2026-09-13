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
    let moveY = touchMove.y;

    if (Math.hypot(moveX, moveY) < 0.05) {
      moveX = 0;
      moveY = 0;
      if (input.isDown('a', 'arrowleft')) moveX -= 1;
      if (input.isDown('d', 'arrowright')) moveX += 1;
      if (input.isDown('w', 'arrowup')) moveY -= 1;
      if (input.isDown('s', 'arrowdown')) moveY += 1;
    }

    const moveLength = Math.hypot(moveX, moveY);
    if (moveLength > 1) {
      moveX /= moveLength;
      moveY /= moveLength;
    }

    const aim = input.getAim();
    this.aimX = aim.x;
    this.aimY = aim.y;
    this.fireCooldown = Math.max(0, this.fireCooldown - delta);

    if (this.dodgeTimer > 0) {
      this.dodgeTimer = Math.max(0, this.dodgeTimer - delta);
      this.x += this.dodgeX * DODGE_SPEED * delta;
      this.y += this.dodgeY * DODGE_SPEED * delta;
    } else {
      this.x += moveX * SPEED * delta;
      this.y += moveY * SPEED * delta;
    }

    this.x = Math.max(8, Math.min(312 - this.width, this.x));
    this.y = Math.max(28, Math.min(GROUND_Y - this.height, this.y));

    if (this.dodgeTimer <= 0 && Math.abs(moveY) < 0.1) {
      this.y += (GROUND_Y - this.height - this.y) * Math.min(delta * 12, 1);
    }
  }

  dodge(input) {
    if (this.dodgeTimer > 0) return false;
    const move = input.getMove();
    let dx = move.x;
    let dy = move.y;
    if (Math.hypot(dx, dy) < 0.2) {
      dx = this.aimX;
      dy = this.aimY;
    }
    const length = Math.hypot(dx, dy) || 1;
    this.dodgeX = dx / length;
    this.dodgeY = dy / length;
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
