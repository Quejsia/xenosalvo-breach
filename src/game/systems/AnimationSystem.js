export class AnimationSystem {
  constructor() {
    this.time = 0;
  }

  update(delta) {
    this.time += delta;
  }

  getFrame(entity, fps = 10, frameCount = 2) {
    const safeCount = Math.max(1, frameCount);
    return Math.floor(this.time * fps) % safeCount;
  }

  getPlayerState(player) {
    if (!player.alive) return 'dead';
    if (player.dodgeTimer > 0) return 'dodge';
    if (!player.grounded) return player.velocityY < 0 ? 'jump' : 'fall';
    if (Math.abs(player.moveX ?? 0) > 0.05) return 'run';
    return 'idle';
  }

  getPlayerFrame(player) {
    const state = this.getPlayerState(player);
    const settings = {
      idle: { fps: 4, frames: 2 },
      run: { fps: 12, frames: 4 },
      jump: { fps: 5, frames: 2 },
      fall: { fps: 5, frames: 2 },
      dodge: { fps: 16, frames: 3 },
      dead: { fps: 5, frames: 2 },
    }[state];
    return { state, frame: this.getFrame(player, settings.fps, settings.frames) };
  }
}
