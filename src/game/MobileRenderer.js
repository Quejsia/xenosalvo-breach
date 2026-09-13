const WORLD_WIDTH = 320;
const WORLD_HEIGHT = 180;

export class MobileRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  render(player, bullets = [], effects = []) {
    const { ctx } = this;
    ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#151c27';
    ctx.fillRect(0, 136, WORLD_WIDTH, 44);
    ctx.fillStyle = '#273241';
    for (let x = 0; x < WORLD_WIDTH; x += 16) ctx.fillRect(x, 136, 12, 2);

    ctx.fillStyle = '#dbeafe';
    bullets.forEach((bullet) => ctx.fillRect(Math.round(bullet.x - 1), Math.round(bullet.y - 1), 3, 2));

    effects.forEach((effect) => {
      const progress = 1 - effect.life / effect.maxLife;
      if (effect.type === 'muzzle') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(Math.round(effect.x), Math.round(effect.y), 4, 2);
      } else if (effect.type === 'dodge') {
        ctx.strokeStyle = '#94a3b8';
        ctx.globalAlpha = 1 - progress;
        ctx.strokeRect(Math.round(effect.x - 5 - progress * 8), Math.round(effect.y - 4), 8, 8);
        ctx.globalAlpha = 1;
      } else if (effect.type === 'skill') {
        ctx.strokeStyle = '#cbd5e1';
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (0.5 + progress), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#e6edf3';
        ctx.font = '5px monospace';
        ctx.fillText(`S${effect.number}`, Math.round(effect.x - 3), Math.round(effect.y + 2));
      }
    });

    ctx.fillStyle = '#e6edf3';
    ctx.fillRect(Math.round(player.x), Math.round(player.y), player.width, player.height);
    ctx.fillStyle = '#8b98a8';
    ctx.fillRect(Math.round(player.x + 3), Math.round(player.y + 4), 2, 5);

    const aimX = player.x + player.width / 2 + player.aimX * 7;
    const aimY = player.y + 5 + player.aimY * 7;
    ctx.strokeStyle = '#e6edf3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y + 5);
    ctx.lineTo(aimX, aimY);
    ctx.stroke();
    ctx.lineWidth = 1;

    ctx.fillStyle = '#e6edf3';
    ctx.font = '6px monospace';
    ctx.fillText('XENOSALVO // TOUCH PROTOTYPE', 8, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillText(`X:${Math.round(player.x)} Y:${Math.round(player.y)}`, 8, 20);
    ctx.fillText('MOVE AIM FIRE ROLL S1-S4', 8, 28);
  }
}
