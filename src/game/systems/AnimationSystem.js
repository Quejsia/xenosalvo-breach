const PLAYER_STATES = Object.freeze({
  IDLE: 'idle',
  RUN: 'run',
  JUMP: 'jump',
  FALL: 'fall',
  DODGE: 'dodge',
  FIRE: 'fire',
  HURT: 'hurt',
  DEAD: 'dead',
});

const ENEMY_STATES = Object.freeze({
  IDLE: 'idle',
  RUN: 'run',
  ATTACK: 'attack',
  HURT: 'hurt',
  STUNNED: 'stunned',
  DEAD: 'dead',
});

const PLAYER_ANIMATIONS = Object.freeze({
  idle: { fps: 4, frames: 2, loop: true },
  run: { fps: 12, frames: 4, loop: true },
  jump: { fps: 5, frames: 2, loop: false },
  fall: { fps: 5, frames: 2, loop: false },
  dodge: { fps: 16, frames: 3, loop: false },
  fire: { fps: 18, frames: 2, loop: false },
  hurt: { fps: 10, frames: 2, loop: false },
  dead: { fps: 5, frames: 2, loop: false },
});

const ENEMY_ANIMATIONS = Object.freeze({
  idle: { fps: 4, frames: 2, loop: true },
  run: { fps: 10, frames: 4, loop: true },
  attack: { fps: 8, frames: 2, loop: false },
  hurt: { fps: 10, frames: 2, loop: false },
  stunned: { fps: 6, frames: 2, loop: true },
  dead: { fps: 5, frames: 2, loop: false },
});

export class AnimationSystem {
  constructor() {
    this.time = 0;
    this.states = new WeakMap();
  }

  update(delta) {
    this.time += delta;
  }

  getFrame(entity, fps = 10, frameCount = 2, loop = true) {
    const safeCount = Math.max(1, frameCount);
    if (!loop) return Math.min(safeCount - 1, Math.floor(this.time * fps));
    return Math.floor(this.time * fps) % safeCount;
  }

  setState(entity, state) {
    const previous = this.states.get(entity);
    if (previous?.state === state) return previous;
    const next = { state, startedAt: this.time };
    this.states.set(entity, next);
    return next;
  }

  getPlayerState(player) {
    if (!player.alive) return PLAYER_STATES.DEAD;
    if (player.invincibilityTimer > 0) return PLAYER_STATES.HURT;
    if (player.dodgeTimer > 0) return PLAYER_STATES.DODGE;
    if (player.fireFlashTimer > 0) return PLAYER_STATES.FIRE;
    if (!player.grounded) return player.velocityY < 0 ? PLAYER_STATES.JUMP : PLAYER_STATES.FALL;
    if (Math.abs(player.moveX ?? 0) > 0.05) return PLAYER_STATES.RUN;
    return PLAYER_STATES.IDLE;
  }

  getEnemyState(enemy) {
    if (!enemy.alive) return ENEMY_STATES.DEAD;
    if (enemy.stunTimer > 0 || enemy.state === 'stunned') return ENEMY_STATES.STUNNED;
    if (enemy.hitTimer > 0 || enemy.state === 'hurt') return ENEMY_STATES.HURT;
    if (enemy.state === 'attack') return ENEMY_STATES.ATTACK;
    if (enemy.state === 'chase' || enemy.state === 'retreat' || enemy.state === 'patrol') {
      return ENEMY_STATES.RUN;
    }
    return ENEMY_STATES.IDLE;
  }

  getAnimation(entity, state, definitions) {
    const settings = definitions[state] ?? definitions.idle;
    this.setState(entity, state);
    return {
      state,
      frame: this.getFrame(entity, settings.fps, settings.frames, settings.loop),
      fps: settings.fps,
      frames: settings.frames,
      loop: settings.loop,
      elapsed: this.time - (this.states.get(entity)?.startedAt ?? this.time),
    };
  }

  getPlayerFrame(player) {
    const state = this.getPlayerState(player);
    return this.getAnimation(player, state, PLAYER_ANIMATIONS);
  }

  getEnemyFrame(enemy) {
    const state = this.getEnemyState(enemy);
    return this.getAnimation(enemy, state, ENEMY_ANIMATIONS);
  }
}

export { PLAYER_STATES, ENEMY_STATES };
