const WORLD_WIDTH = 320;
const WORLD_HEIGHT = 180;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  render(player, bullets = [], enemies = [], effects = [], score = 0, camera = null, level = null) {
    const { ctx } = this;
    const cameraX = camera?.x ?? 0;
    ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ctx.save();
    ctx.translate(-Math.round(cameraX), 0);

    // Simple parallax-free prototype background.
    ctx.fillStyle = '#0e141d';
    ctx.fillRect(cameraX, 24, WORLD_WIDTH, 104);

    // Tilemap world.
    if (level?.tileMap) {
      level.tileMap.forEachVisibleTile(cameraX, (tile, x, y) => {
        ctx.fillStyle = tile === 1 ? '#273241' : tile === 2 ? '#151c27' : '#0f141d';
        ctx.fillRect(x * 16, y * 16, 16, 16);
        if (tile === 1) {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x * 16, y * 16, 16, 2);
        }
      });
    } else {
      ctx.fillStyle = '#151c27';
      ctx.fillRect(cameraX, 128, WORLD_WIDTH, 52);
    }

    enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      ctx.fillStyle = enemy.hitTimer > 0 ? '#f8fafc' : '#d45b68';
      ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y), enemy.width, enemy.height);
      ctx.fillStyle = '#24151a';
      ctx.fillRect(Math.round(enemy.x + 2), Math.round(enemy.y + 4), 2, 2);
      ctx.fillRect(Math.round(enemy.x + 6), Math.round(enemy.y + 4), 2, 2);
      ctx.fillStyle = '#05070a';
      ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y - 4), enemy.width, 2);
      ctx.fillStyle = '#e6edf3';
      ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y - 4), enemy.width * Math.max(0, enemy.health / enemy.maxHealth), 2);
    });

    ctx.fillStyle = '#f8fafc';
    bullets.forEach((bullet) => ctx.fillRect(Math.round(bullet.x), Math.round(bullet.y), bullet.width, bullet.height));

    ctx.fillStyle = '#e6edf3';
    ctx.fillRect(Math.round(player.x), Math.round(player.y), player.width, player.height);
    ctx.fillStyle = '#8b98a8';
    ctx.fillRect(Math.round(player.x + 3), Math.round(player.y + 4), 2, 5);

    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + player.aimX * 9, centerY + player.aimY * 9);
    ctx.stroke();

    effects.forEach((effect) => {
      const progress = effect.life / effect.maxLife;
      if (effect.type === 'muzzle') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(Math.round(effect.x), Math.round(effect.y), 4, 3);
      } else if (effect.type === 'hit' || effect.type === 'defeat') {
        ctx.fillStyle = '#e6edf3';
        const size = effect.type === 'defeat' ? 5 + Math.round((1 - progress) * 7) : 3;
        ctx.fillRect(Math.round(effect.x - size / 2), Math.round(effect.y - size / 2), size, size);
      } else if (effect.type === 'dodge') {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(effect.x - 4), Math.round(effect.y - 5), 16, 12);
      } else if (effect.type === 'skill') {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1 - progress * 0.35), 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.restore();

    // Screen-space HUD.
    ctx.fillStyle = '#e6edf3';
    ctx.font = '6px monospace';
    ctx.fillText('XENOSALVO // FIELD TEST', 8, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillText(`X:${Math.round(player.x)}  CAM:${Math.round(cameraX)}  SCORE:${score}`, 8, 20);
  }
}
