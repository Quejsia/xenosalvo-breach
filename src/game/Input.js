const ACTION_KEYS = {
  fire: [' ', 'enter'],
  dodge: ['shift'],
  jump: ['w', 'arrowup'],
  restart: ['r'],
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
    this.firePointerIds = new Set();

    this.onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      this.keys.add(key);
      Object.entries(ACTION_KEYS).forEach(([action, keys]) => {
        if (!keys.includes(key)) return;
        if (action === 'fire') this.setActionDown('fire', true);
        else this.pressAction(action);
      });
      if (ACTION_KEYS.fire.includes(key) || ACTION_KEYS.jump.includes(key)) event.preventDefault();
    };

    this.onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      this.keys.delete(key);
      if (ACTION_KEYS.fire.includes(key)) this.setActionDown('fire', false);
    };

    this.onWindowPointerUp = (event) => this.endFire(event.pointerId);
    this.onWindowPointerCancel = (event) => this.endFire(event.pointerId);
    this.onWindowBlur = () => this.releaseAllInputs();
    this.onVisibilityChange = () => { if (document.hidden) this.releaseAllInputs(); };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('pointerup', this.onWindowPointerUp);
    window.addEventListener('pointercancel', this.onWindowPointerCancel);
    window.addEventListener('blur', this.onWindowBlur);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  isDown(...keys) { return keys.some((key) => this.keys.has(key.toLowerCase())); }
  setMove(x, y) { this.moveX = x; this.moveY = y; }
  getMove() { return { x: this.moveX, y: this.moveY }; }

  setAim(x, y) {
    const length = Math.hypot(x, y);
    if (length > 0.05) { this.aimX = x / length; this.aimY = y / length; }
  }

  getAim() { return { x: this.aimX, y: this.aimY }; }

  beginFire(pointerId) {
    this.firePointerIds.add(pointerId);
    this.setActionDown('fire', true);
  }

  endFire(pointerId = null) {
    if (pointerId !== null) this.firePointerIds.delete(pointerId);
    else this.firePointerIds.clear();
    if (this.firePointerIds.size === 0) this.setActionDown('fire', false);
  }

  setActionDown(action, down) {
    if (down) this.actions.add(action);
    else this.actions.delete(action);
  }

  pressAction(action) {
    this.pressedActions.add(action);
    if (action !== 'fire') this.actions.add(action);
  }

  isActionDown(action) { return this.actions.has(action); }

  consumeAction(action) {
    if (!this.pressedActions.has(action)) return false;
    this.pressedActions.delete(action);
    this.actions.delete(action);
    return true;
  }

  releaseAllInputs() {
    this.firePointerIds.clear();
    this.setActionDown('fire', false);
    this.setMove(0, 0);
    this.pressedActions.clear();
    ['dodge', 'jump', 'restart', 'skill1', 'skill2', 'skill3', 'skill4'].forEach((action) => this.actions.delete(action));
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('pointerup', this.onWindowPointerUp);
    window.removeEventListener('pointercancel', this.onWindowPointerCancel);
    window.removeEventListener('blur', this.onWindowBlur);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.keys.clear(); this.actions.clear(); this.pressedActions.clear(); this.firePointerIds.clear();
  }
}
