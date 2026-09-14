export function getHurtbox(entity) {
  const insetX = Math.max(0, entity.width * 0.12);
  const insetY = Math.max(0, entity.height * 0.08);
  return {
    x: entity.x + insetX,
    y: entity.y + insetY,
    width: Math.max(1, entity.width - insetX * 2),
    height: Math.max(1, entity.height - insetY * 2),
  };
}

export function getHitbox(entity) {
  return {
    x: entity.x,
    y: entity.y,
    width: entity.width,
    height: entity.height,
  };
}

export function overlapsHitbox(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function overlapsEntityHurtbox(attacker, target) {
  return overlapsHitbox(getHitbox(attacker), getHurtbox(target));
}
