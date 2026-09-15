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

// Test atlas layout: 18 sequential 32x32 frames, extracted from the user's
// supplied Player archive. Keep this mapping separate so the final art pack
// can replace the test atlas without changing gameplay state names.
const PLAYER_ANIMATIONS = Object.freeze({
  idle: { fps: 4, frames: 2, loop: true, start: 0 },
  run: { fps: 10, frames: 4, loop: true, start: 2 },
  jump: { fps: 6, frames: 2, loop: false, start: 6 },
  fall: { fps: 6, frames: 2, loop: false, start: 8 },
  fire: { fps: 14, frames: 2, loop: false, start: 10 },
  dodge: { fps: 12, frames: 3, loop: false, start: 12 },
  hurt: { fps: 10, frames: 2, loop: false, start: 15 },
  dead: { fps: 8, frames: 3, loop: false, start: 17 },
});

const ENEMY_ANIMATIONS = Object.freeze({
  idle: { fps: 4, frames: 4, loop: true, row: 0 },
  run: { fps: 10, frames: 4, loop: true, row: 1 },
  attack: { fps: 8, frames: 4, loop: false, row: 2 },
  hurt: { fps: 10, frames: 4, loop: false, row: 3 },
  stunned: { fps: 6, frames: 4, loop: true, row: 4 },
  dead: { fps: 5, frames: 4, loop: false, row: 5 },
});

export class AnimationSystem {
  constructor() {
    this.time = 0;
    this.states = new WeakMap();
  }

  update(delta) { this.time += delta; }

  setState(entity, state) {
    const previous = this.states.get(entity);
    if (previous?.state === state) return previous;
    const next = { state, startedAt: this.time };
    this.states.set(entity, next);
    return next;
  }

  getFrame(entity, fps = 10, frameCount = 2, loop = true) {
    const safeCount = Math.max(1, frameCount);
    const state = this.states.get(entity);
    const elapsed = Math.max(0, this.time - (state?.startedAt ?? this.time));
    if (!loop) return Math.min(safeCount - 1, Math.floor(elapsed * fps));
    return Math.floor(elapsed * fps) % safeCount;
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
    if (enemy.state === 'chase' || enemy.state === 'retreat' || enemy.state === 'patrol') return ENEMY_STATES.RUN;
    return ENEMY_STATES.IDLE;
  }

  getAnimation(entity, state, definitions) {
    const settings = definitions[state] ?? definitions.idle;
    const transition = this.setState(entity, state);
    const frame = this.getFrame(entity, settings.fps, settings.frames, settings.loop);
    return {
      state,
      frame,
      sheetFrame: settings.start != null ? settings.start + frame : frame,
      row: settings.row ?? 0,
      fps: settings.fps,
      frames: settings.frames,
      loop: settings.loop,
      elapsed: this.time - transition.startedAt,
    };
  }

  getPlayerFrame(player) {
    return this.getAnimation(player, this.getPlayerState(player), PLAYER_ANIMATIONS);
  }

  getEnemyFrame(enemy) {
    return this.getAnimation(enemy, this.getEnemyState(enemy), ENEMY_ANIMATIONS);
  }
}

export { PLAYER_STATES, ENEMY_STATES };
