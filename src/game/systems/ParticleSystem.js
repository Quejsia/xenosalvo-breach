export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  burst(x, y, options = {}) {
    const count = options.count ?? 8;
    const speed = options.speed ?? 55;
    const life = options.life ?? 0.28;
    const size = options.size ?? 1;
    const gravity = options.gravity ?? 0;
    const spread = options.spread ?? Math.PI * 2;
    const angle = options.angle ?? 0;

    for (let i = 0; i < count; i += 1) {
      const direction = angle + (Math.random() - 0.5) * spread;
      const velocity = speed * (0.55 + Math.random() * 0.65);
      this.particles.push({
        x, y,
        vx: Math.cos(direction) * velocity,
        vy: Math.sin(direction) * velocity,
        life: life * (0.7 + Math.random() * 0.5),
        maxLife: life,
        size: Math.max(1, size + Math.floor(Math.random() * 2)),
        gravity,
      });
    }
  }

  update(delta) {
    this.particles = this.particles.filter((particle) => {
      particle.life -= delta;
      if (particle.life <= 0) return false;
      particle.vy += particle.gravity * delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      return true;
    });
  }

  clear() {
    this.particles.length = 0;
  }
}
