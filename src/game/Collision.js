export function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function moveHorizontal(entity, dx, worldWidth) {
  entity.x += dx;
  entity.x = Math.max(0, Math.min(worldWidth - entity.width, entity.x));
}
