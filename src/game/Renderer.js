const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  render(player, bullets = [], enemies = [], effects = [], score = 0, camera = null, level = null, enemyBullets = [], gameOver = false, particles = [], animations = null) {
    const { ctx } = this;
    const cameraX = camera?.x ?? 0;
    const offsetX = camera?.offsetX ?? 0;
    const offsetY = camera?.offsetY ?? 0;

    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.save();
    ctx.translate(-Math.round(cameraX) + Math.round(offsetX), Math.round(offsetY));
    ctx.fillStyle = '#0e141d';
    ctx.fillRect(cameraX, 24, VIEW_WIDTH, 104);

    if (level?.tileMap) {
      level.tileMap.forEachVisibleTile(cameraX, (tile, x, y) => {
        ctx.fillStyle = tile === 1 ? '#273241' : tile === 2 ? '#151c27' : '#0f141d';
        ctx.fillRect(x * 16, y * 16, 16, 16);
        if (tile === 1) {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x * 16, y * 16, 16, 2);
        }
      });
    }

    enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const bob = Math.sin((animations?.time ?? 0) * 5 + enemy.id) > 0 ? 0 : 1;
      ctx.fillStyle = enemy.hitTimer > 0 ? '#f8fafc' : '#d45b68';
      ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y - bob), enemy.width, enemy.height);
      ctx.fillStyle = '#24151a';
      ctx.fillRect(Math.round(enemy.x + 2), Math.round(enemy.y + 4 - bob), 2, 2);
      ctx.fillRect(Math.round(enemy.x + 6), Math.round(enemy.y + 4 - bob), 2, 2);
      ctx.fillStyle = '#05070a';
      ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y - 4 - bob), enemy.width, 2);
      ctx.fillStyle = '#e6edf3';
      ctx.fillRect(Math.round(enemy.x), Math.round(enemy.y - 4 - bob), enemy.width * Math.max(0, enemy.health / enemy.maxHealth), 2);
    });

    bullets.forEach((bullet) => {
      const direction = Math.atan2(bullet.vy, bullet.vx);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.round(bullet.x), Math.round(bullet.y));
      ctx.lineTo(Math.round(bullet.x - Math.cos(direction) * 3), Math.round(bullet.y - Math.sin(direction) * 3));
      ctx.stroke();
    });

    ctx.fillStyle = '#d45b68';
    enemyBullets.forEach((bullet) => {
      const direction = Math.atan2(bullet.vy, bullet.vx);
      ctx.strokeStyle = '#d45b68';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.round(bullet.x), Math.round(bullet.y));
      ctx.lineTo(Math.round(bullet.x - Math.cos(direction) * 3), Math.round(bullet.y - Math.sin(direction) * 3));
      ctx.stroke();
    });

    if (player.alive && player.grounded) {
      ctx.fillStyle = '#05070a';
      ctx.fillRect(Math.round(player.x - 1), Math.round(player.y + player.height), player.width + 2, 2);
    }

    if (player.alive) {
      const blinking = player.invincibilityTimer > 0 && Math.floor(player.invincibilityTimer * 18) % 2 === 0;
      if (!blinking) this.drawPlayer(ctx, player, animations);
    }

    effects.forEach((effect) => {
      const progress = effect.life / effect.maxLife;
      if (effect.type === 'muzzle' || effect.type === 'enemy-fire') {
        const directionX = effect.dx ?? 0;
        const directionY = effect.dy ?? 0;
        ctx.fillStyle = effect.type === 'enemy-fire' ? '#d45b68' : '#f8fafc';
        ctx.fillRect(Math.round(effect.x + directionX * 2), Math.round(effect.y + directionY * 2), 4, 3);
      } else if (effect.type === 'hit' || effect.type === 'defeat') {
        ctx.fillStyle = '#e6edf3';
        const size = effect.type === 'defeat' ? 5 + Math.round((1 - progress) * 7) : 3;
        ctx.fillRect(Math.round(effect.x - size / 2), Math.round(effect.y - size / 2), size, size);
      } else if (effect.type === 'impact') {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(Math.round(effect.x - 2), Math.round(effect.y - 2), 4, 4);
      } else if (effect.type === 'player-hit') {
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(effect.x - 3), Math.round(effect.y - 4), 14, 14);
      } else if (effect.type === 'player-death') {
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(effect.x - 6, effect.y - 6); ctx.lineTo(effect.x + 6, effect.y + 6);
        ctx.moveTo(effect.x + 6, effect.y - 6); ctx.lineTo(effect.x - 6, effect.y + 6);
        ctx.stroke();
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

    particles.forEach((particle) => {
      ctx.fillStyle = '#cbd5e1';
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      ctx.globalAlpha = alpha;
      ctx.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
    });
    ctx.globalAlpha = 1;
    ctx.restore();

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

  drawPlayer(ctx, player, animations) {
    const { state, frame } = animations?.getPlayerFrame(player) ?? { state: 'idle', frame: 0 };
    const x = Math.round(player.x);
    const y = Math.round(player.y);
    const bob = state === 'idle' ? (frame === 1 ? -1 : 0) : 0;

    ctx.fillStyle = '#e6edf3';
    if (state === 'dodge') {
      ctx.fillRect(x - 3, y + 2, 13, 8);
      ctx.fillStyle = '#8b98a8';
      ctx.fillRect(x + 2, y + 5, 3, 3);
    } else {
      ctx.fillRect(x, y + bob, player.width, player.height);
      ctx.fillStyle = '#8b98a8';
      ctx.fillRect(x + 3, y + 4 + bob, 2, 5);
      if (state === 'run' && frame % 2 === 1) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x - 1, y + 10, 3, 2);
        ctx.fillRect(x + 6, y + 9, 3, 2);
      }
    }

    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const recoil = player.fireFlashTimer > 0 ? -2 : 0;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + player.aimX * (9 + recoil), centerY + player.aimY * (9 + recoil));
    ctx.stroke();
  }
}
