import { loadPlayerTestAtlas } from './assets/playerTestAtlas.js';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;
const SPRITE_SIZE = 32;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.playerSprite = null;
    loadPlayerTestAtlas().then((image) => { this.playerSprite = image; }).catch(() => {});

    this.enemySprite = new Image();
    this.enemySprite.src = '/assets/sprites/enemy-soldier.svg';
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
      const animation = animations?.getEnemyFrame(enemy) ?? { state: 'idle', frame: 0, row: 0 };
      if (animation.state !== 'dead' && !enemy.alive) return;
      const x = Math.round(enemy.x) - 11;
      const y = Math.round(enemy.y + enemy.height - SPRITE_SIZE);
      const drawn = this.drawSprite(ctx, this.enemySprite, animation.frame, animation.row, x, y);
      if (!drawn) this.drawEnemyFallback(ctx, enemy, animation);

      if (enemy.alive) {
        const barX = Math.round(enemy.x);
        const barY = Math.round(enemy.y - 4);
        ctx.fillStyle = '#05070a';
        ctx.fillRect(barX, barY, enemy.width, 2);
        ctx.fillStyle = '#e6edf3';
        ctx.fillRect(barX, barY, enemy.width * Math.max(0, enemy.health / enemy.maxHealth), 2);
      }
    });

    bullets.forEach((bullet) => this.drawProjectile(ctx, bullet, '#f8fafc'));
    enemyBullets.forEach((bullet) => this.drawProjectile(ctx, bullet, '#d45b68'));

    if (player.alive && player.grounded) {
      ctx.fillStyle = '#05070a';
      ctx.fillRect(Math.round(player.x - 1), Math.round(player.y + player.height), player.width + 2, 2);
    }

    const playerAnimation = animations?.getPlayerFrame(player) ?? { state: player.alive ? 'idle' : 'dead', frame: 0, sheetFrame: 0 };
    const blinking = player.invincibilityTimer > 0 && Math.floor(player.invincibilityTimer * 18) % 2 === 0;
    if (!blinking || !player.alive) this.drawPlayer(ctx, player, playerAnimation);

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
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#cbd5e1';
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

  drawSprite(ctx, image, frame, row, x, y) {
    if (!image?.complete || image.naturalWidth <= 0) return false;
    ctx.drawImage(image, frame * SPRITE_SIZE, row * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, x, y, SPRITE_SIZE, SPRITE_SIZE);
    return true;
  }

  drawPlayer(ctx, player, animation) {
    const x = Math.round(player.x) - 12;
    const y = Math.round(player.y + player.height - SPRITE_SIZE);
    const drawn = this.playerSprite && this.drawSheetFrame(ctx, this.playerSprite, animation.sheetFrame, x, y);
    if (!drawn) this.drawPlayerFallback(ctx, player, animation);

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

  drawSheetFrame(ctx, image, frame, x, y) {
    if (!image?.complete || image.naturalWidth <= 0) return false;
    ctx.drawImage(image, frame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, x, y, SPRITE_SIZE, SPRITE_SIZE);
    return true;
  }

  drawPlayerFallback(ctx, player, animation) {
    const x = Math.round(player.x);
    const y = Math.round(player.y);
    ctx.fillStyle = animation.state === 'hurt' ? '#f8fafc' : '#e6edf3';
    ctx.fillRect(x, y, player.width, player.height);
    if (animation.state === 'dodge') ctx.fillRect(x - 3, y + 2, 13, 8);
  }

  drawEnemyFallback(ctx, enemy, animation) {
    const x = Math.round(enemy.x);
    const y = Math.round(enemy.y);
    ctx.fillStyle = animation.state === 'hurt' ? '#f8fafc' : '#d45b68';
    ctx.fillRect(x, y, enemy.width, enemy.height);
  }

  drawProjectile(ctx, bullet, color) {
    const direction = Math.atan2(bullet.directionY, bullet.directionX);
    const cos = Math.cos(direction);
    const sin = Math.sin(direction);
    const trailLength = 6;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.round(bullet.x), Math.round(bullet.y));
    ctx.lineTo(Math.round(bullet.x - cos * trailLength), Math.round(bullet.y - sin * trailLength));
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(bullet.x - 1), Math.round(bullet.y - 1), 4, 3);
  }
}
