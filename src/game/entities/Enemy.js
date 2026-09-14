const SPEED = 24;
const DETECT_RANGE = 170;
const ATTACK_RANGE = 180;
const RETREAT_RANGE = 28;
const ATTACK_COOLDOWN = 1.35;
const HURT_TIME = 0.08;
const PATROL_DISTANCE = 52;

export const EnemyState = Object.freeze({
  PATROL: 'patrol',
  DETECT: 'detect',
  CHASE: 'chase',
  ATTACK: 'attack',
  RETREAT: 'retreat',
  HURT: 'hurt',
  STUNNED: 'stunned',
  DEAD: 'dead',
});

export class Enemy {
  constructor(x, y, id = 0, worldWidth = 960) {
    this.x = x;
    this.spawnX = x;
    this.y = y;
    this.id = id;
    this.width = 10;
    this.height = 12;
    this.worldWidth = worldWidth;
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.hitTimer = 0;
    this.stunTimer = 0;
    this.attackTimer = 0.4 + (id % 3) * 0.25;
    this.state = EnemyState.PATROL;
    this.stateTimer = 0;
    this.patrolDirection = id % 2 === 0 ? 1 : -1;
  }

  setState(nextState) {
    if (this.state === nextState) return;
    this.state = nextState;
    this.stateTimer = 0;
  }

  update(delta, player, tileMap = null) {
    this.hitTimer = Math.max(0, this.hitTimer - delta);
    this.stunTimer = Math.max(0, this.stunTimer - delta);
    this.attackTimer = Math.max(0, this.attackTimer - delta);
    this.stateTimer += delta;

    if (!this.alive) {
      this.setState(EnemyState.DEAD);
      return;
    }

    if (this.stunTimer > 0) {
      this.setState(EnemyState.STUNNED);
      return;
    }

    if (this.hitTimer > 0) {
      this.setState(EnemyState.HURT);
      return;
    }

    if (!player?.alive) {
      this.setState(EnemyState.PATROL);
      this.movePatrol(delta, tileMap);
      return;
    }

    const targetX = player.x + player.width / 2;
    const centerX = this.x + this.width / 2;
    const distance = targetX - centerX;
    const absDistance = Math.abs(distance);

    if (absDistance < RETREAT_RANGE) {
      this.setState(EnemyState.RETREAT);
      this.move(delta, -Math.sign(distance || 1), tileMap);
    } else if (absDistance <= ATTACK_RANGE) {
      this.setState(EnemyState.ATTACK);
    } else if (absDistance <= DETECT_RANGE) {
      this.setState(EnemyState.CHASE);
      this.move(delta, Math.sign(distance || 1), tileMap);
    } else {
      this.setState(EnemyState.PATROL);
      this.movePatrol(delta, tileMap);
    }
  }

  movePatrol(delta, tileMap) {
    if (Math.abs(this.x - this.spawnX) >= PATROL_DISTANCE) this.patrolDirection *= -1;
    this.move(delta, this.patrolDirection, tileMap);
  }

  move(delta, direction, tileMap) {
    if (!direction) return;
    const previousX = this.x;
    this.x += direction * SPEED * delta;
    this.x = Math.max(10, Math.min(this.worldWidth - this.width - 10, this.x));

    if (tileMap?.isSolidWorld(this.x, this.y, this.width, this.height)) {
      this.x = previousX;
      this.patrolDirection *= -1;
    }
  }

  canAttack(player) {
    if (!this.alive || !player?.alive || this.state !== EnemyState.ATTACK || this.attackTimer > 0) return false;
    const distance = Math.abs((player.x + player.width / 2) - (this.x + this.width / 2));
    return distance <= ATTACK_RANGE;
  }

  attack(player) {
    if (!this.canAttack(player)) return null;
    this.attackTimer = ATTACK_COOLDOWN + (this.id % 2) * 0.2;
    const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
    const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
    const length = Math.hypot(dx, dy) || 1;
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      directionX: dx / length,
      directionY: dy / length,
      speed: 130,
      damage: 1,
      life: 2,
      enemyShot: true,
    };
  }

  hit(damage = 1) {
    if (!this.alive) return true;
    this.health = Math.max(0, this.health - damage);
    this.hitTimer = HURT_TIME;
    if (this.health <= 0) this.setState(EnemyState.DEAD);
    else this.setState(EnemyState.HURT);
    return this.health <= 0;
  }

  stun(duration = 0.35) {
    if (!this.alive) return false;
    this.stunTimer = Math.max(this.stunTimer, duration);
    this.setState(EnemyState.STUNNED);
    return true;
  }

  get alive() { return this.health > 0; }
}
