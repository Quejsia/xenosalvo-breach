const SPEED = 90;
const GROUND_Y = 136;

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 12;
  }

  update(delta, input) {
    let direction = 0;

    if (input.isDown('a', 'arrowleft')) direction -= 1;
    if (input.isDown('d', 'arrowright')) direction += 1;

    this.x += direction * SPEED * delta;
    this.x = Math.max(8, Math.min(312 - this.width, this.x));

    if (input.isDown('w', 'arrowup')) {
      this.y = Math.max(40, this.y - SPEED * delta);
    } else if (input.isDown('s', 'arrowdown')) {
      this.y = Math.min(GROUND_Y - this.height, this.y + SPEED * delta);
    } else {
      this.y += (GROUND_Y - this.height - this.y) * Math.min(delta * 12, 1);
    }
  }
}
