const ACTION_KEYS = {
  fire: [' ', 'enter'],
  dodge: ['shift'],
  jump: ['w', 'arrowup'],
  skill1: ['1'],
  skill2: ['2'],
  skill3: ['3'],
  skill4: ['4'],
};

export class Input {
  constructor() {
    this.keys = new Set();
    this.actions = new Set();
    this.pressedActions = new Set();
    this.moveX = 0;
    this.moveY = 0;
    this.aimX = 1;
    this.aimY = 0;

    this.onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      this.keys.add(key);
      Object.entries(ACTION_KEYS).forEach(([action, keys]) => {
        if (keys.includes(key)) this.pressAction(action);
      });
      if (ACTION_KEYS.fire.includes(key) || ACTION_KEYS.jump.includes(key)) event.preventDefault();
    };

    this.onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      this.keys.delete(key);
      if (ACTION_KEYS.fire.includes(key)) this.setActionDown('fire', false);
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  isDown(...keys) {
    return keys.some((key) => this.keys.has(key.toLowerCase()));
  }

  setMove(x, y) {
    this.moveX = x;
    this.moveY = y;
  }

  getMove() {
    return { x: this.moveX, y: this.moveY };
  }

  setAim(x, y) {
    const length = Math.hypot(x, y);
    if (length > 0.05) {
      this.aimX = x / length;
      this.aimY = y / length;
    }
  }

  getAim() {
    return { x: this.aimX, y: this.aimY };
  }

  setActionDown(action, down) {
    if (down) this.actions.add(action);
    else this.actions.delete(action);
  }

  pressAction(action) {
    this.pressedActions.add(action);
    if (action !== 'fire') this.actions.add(action);
  }

  isActionDown(action) {
    return this.actions.has(action);
  }

  consumeAction(action) {
    if (!this.pressedActions.has(action)) return false;
    this.pressedActions.delete(action);
    this.actions.delete(action);
    return true;
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.keys.clear();
    this.actions.clear();
    this.pressedActions.clear();
  }
}
