export class Input {
  constructor() {
    this.keys = new Set();
    this.onKeyDown = (event) => {
      this.keys.add(event.key.toLowerCase());
    };
    this.onKeyUp = (event) => {
      this.keys.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  isDown(...keys) {
    return keys.some((key) => this.keys.has(key.toLowerCase()));
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
