const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  render(player, bullets = [], enemies = [], effects = [], score = 0, camera = null, level = null, enemyBullets = [], gameOver = false) {
    const { ctx } = this;
    const cameraX = camera?.x ?? 0;
    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.save();
    ctx.translate(-Math.round(cameraX), 0);
    ctx.fillStyle = '#0e141d';
    ctx.fillRect(cameraX, 24, VIEW_WIDTH, 104);

    if (level?.tileMap) {
      level.tileMap.forEachVisibleTile(cameraX, (tile, x, y) => {
        ctx.fillStyle = tile === 1 ? '#273241' : tile === 2 ? '#151c27' : '#0f141d';
        ctx.fillRect(x * 16, y * 16, 16, 16);
        if (tile === 1) { ctx.fillStyle = '#64748b'; ctx.fillRect(x * 16, y * 16, 16, 2); }
      });
    }

    enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      ctx.fillStyle = enemy.hitTimer > 0 ? '#f8fafc' : '#d45b68';
      ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y), enemy.width, enemy.height);
      ctx.fillStyle = '#24151a';
      ctx.fillRect(Math.round(enemy.x + 2), Math.round(enemy.y + 4), 2, 2);
      ctx.fillRect(Math.round(enemy.x + 6), Math.round(enemy.y + 4), 2, 2);
      ctx.fillStyle = '#05070a'; ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y - 4), enemy.width, 2);
      ctx.fillStyle = '#e6edf3'; ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y - 4), enemy.width * Math.max(0, enemy.health / enemy.maxHealth), 2);
    });

    ctx.fillStyle = '#f8fafc';
    bullets.forEach((bullet) => ctx.fillRect(Math.round(bullet.x), Math.round(bullet.y), bullet.width, bullet.height));
    ctx.fillStyle = '#d45b68';
    enemyBullets.forEach((bullet) => ctx.fillRect(Math.round(bullet.x), Math.round(bullet.y), bullet.width, bullet.height));

    if (player.alive && player.grounded) {
      ctx.fillStyle = '#05070a';
      ctx.fillRect(Math.round(player.x - 1), Math.round(player.y + player.height), player.width + 2, 2);
    }

    if (player.alive) {
      const blinking = player.invincibilityTimer > 0 && Math.floor(player.invincibilityTimer * 18) % 2 === 0;
      if (!blinking) {
        ctx.fillStyle = '#e6edf3';
        ctx.fillRect(Math.round(player.x), Math.round(player.y), player.width, player.height);
        ctx.fillStyle = '#8b98a8';
        ctx.fillRect(Math.round(player.x + 3), Math.round(player.y + 4), 2, 5);
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + player.aimX * 9, centerY + player.aimY * 9); ctx.stroke();
      }
    }

    effects.forEach((effect) => {
      const progress = effect.life / effect.maxLife;
      if (effect.type === 'muzzle' || effect.type === 'enemy-fire') {
        ctx.fillStyle = effect.type === 'enemy-fire' ? '#d45b68' : '#f8fafc';
        ctx.fillRect(Math.round(effect.x), Math.round(effect.y), 4, 3);
      } else if (effect.type === 'hit' || effect.type === 'defeat') {
        ctx.fillStyle = '#e6edf3';
        const size = effect.type === 'defeat' ? 5 + Math.round((1 - progress) * 7) : 3;
        ctx.fillRect(Math.round(effect.x - size / 2), Math.round(effect.y - size / 2), size, size);
      } else if (effect.type === 'impact') {
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(Math.round(effect.x - 2), Math.round(effect.y - 2), 4, 4);
      } else if (effect.type === 'player-hit') {
        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1; ctx.strokeRect(Math.round(effect.x - 3), Math.round(effect.y - 4), 14, 14);
      } else if (effect.type === 'player-death') {
        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(effect.x - 6, effect.y - 6); ctx.lineTo(effect.x + 6, effect.y + 6); ctx.moveTo(effect.x + 6, effect.y - 6); ctx.lineTo(effect.x - 6, effect.y + 6); ctx.stroke();
      } else if (effect.type === 'dodge') {
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.strokeRect(Math.round(effect.x - 4), Math.round(effect.y - 5), 16, 12);
      } else if (effect.type === 'skill') {
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius * (1 - progress * 0.35), 0, Math.PI * 2); ctx.stroke();
      }
    });
    ctx.restore();

    // HUD stays screen-space, independent of the camera.
    ctx.fillStyle = '#e6edf3'; ctx.font = '6px monospace';
    ctx.fillText('XENOSALVO // FIELD TEST', 8, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillText(`HP ${player.health}/${player.maxHealth}  SCORE ${score}  CAM:${Math.round(cameraX)}`, 8, 20);
    ctx.fillStyle = '#111827'; ctx.fillRect(8, 24, 60, 4);
    ctx.fillStyle = '#e6edf3'; ctx.fillRect(8, 24, 60 * Math.max(0, player.health / player.maxHealth), 4);

    if (gameOver) {
      ctx.fillStyle = 'rgba(5, 7, 10, 0.78)'; ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
      ctx.fillStyle = '#f8fafc'; ctx.font = '12px monospace'; ctx.fillText('MISSION FAILED', 103, 72);
      ctx.fillStyle = '#94a3b8'; ctx.font = '6px monospace'; ctx.fillText(`SCORE ${score}`, 135, 86);
      ctx.fillStyle = '#cbd5e1'; ctx.fillText('PRESS R TO RETRY', 124, 100);
    }
  }
}
