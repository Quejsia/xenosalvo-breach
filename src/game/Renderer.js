import { TILE_SIZE } from './world/TileMap.js';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  render(player, bullets = [], enemies = [], effects = [], score = 0, camera, level) {
    const { ctx } = this;
    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    // Sky / background.
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    // Distant grid gives the scrolling world a sense of movement without assets.
    ctx.strokeStyle = '#111925';
    ctx.lineWidth = 1;
    const offset = Math.floor((camera.x * 0.25) % 32);
    for (let x = -32 + offset; x < VIEW_WIDTH + 32; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 28);
      ctx.lineTo(x, 128);
      ctx.stroke();
    }

    // Tilemap ground and platforms.
    for (let ty = 0; ty < level.tileMap.height; ty += 1) {
      for (let tx = 0; tx < level.tileMap.width; tx += 1) {
        const tile = level.tileMap.getTile(tx, ty);
        if (!tile) continue;
        const x = tx * TILE_SIZE - camera.x;
        const y = ty * TILE_SIZE - camera.y;
        if (x + TILE_SIZE < 0 || x > VIEW_WIDTH || y + TILE_SIZE < 0 || y > VIEW_HEIGHT) continue;

        ctx.fillStyle = tile === 1 ? '#273241' : tile === 2 ? '#18212d' : '#101722';
        ctx.fillRect(Math.round(x), Math.round(y), TILE_SIZE, TILE_SIZE);
        if (tile === 1) {
          ctx.fillStyle = '#3a4758';
          ctx.fillRect(Math.round(x), Math.round(y), TILE_SIZE, 2);
        }
      }
    }

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

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
      ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y - 4), enemy.width * (enemy.health / enemy.maxHealth), 2);
    });

    ctx.fillStyle = '#f8fafc';
    bullets.forEach((bullet) => {
      ctx.fillRect(Math.round(bullet.x), Math.round(bullet.y), bullet.width, bullet.height);
    });

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

    // HUD is camera-independent.
    ctx.fillStyle = '#e6edf3';
    ctx.font = '6px monospace';
    ctx.fillText('XENOSALVO // BREACH ROUTE 01', 8, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillText(`X:${Math.round(player.x)}  SCORE:${score}`, 8, 20);
    ctx.fillText(`CAM:${Math.round(camera.x)}/${level.width - VIEW_WIDTH}`, 8, 28);
  }
}
