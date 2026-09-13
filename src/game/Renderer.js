const WORLD_WIDTH = 320;
const WORLD_HEIGHT = 180;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  render(player) {
    const { ctx } = this;

    ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Temporary world: this will become the tilemap renderer.
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ctx.fillStyle = '#151c27';
    ctx.fillRect(0, 136, WORLD_WIDTH, 44);

    ctx.fillStyle = '#273241';
    for (let x = 0; x < WORLD_WIDTH; x += 16) {
      ctx.fillRect(x, 136, 12, 2);
    }

    // Prototype player sprite.
    ctx.fillStyle = '#e6edf3';
    ctx.fillRect(Math.round(player.x), Math.round(player.y), player.width, player.height);

    ctx.fillStyle = '#8b98a8';
    ctx.fillRect(Math.round(player.x + 3), Math.round(player.y + 4), 2, 5);

    // Prototype HUD.
    ctx.fillStyle = '#e6edf3';
    ctx.font = '6px monospace';
    ctx.fillText('XENOSALVO // PROTOTYPE', 8, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillText(`X:${Math.round(player.x)} Y:${Math.round(player.y)}`, 8, 20);
  }
}
