import { TILE_SIZE } from './world/TileMap.js';

export function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function intersectsSolid(body, tileMap) {
  const left = Math.floor(body.x / TILE_SIZE);
  const right = Math.floor((body.x + body.width - 0.001) / TILE_SIZE);
  const top = Math.floor(body.y / TILE_SIZE);
  const bottom = Math.floor((body.y + body.height - 0.001) / TILE_SIZE);

  for (let ty = top; ty <= bottom; ty += 1) {
    for (let tx = left; tx <= right; tx += 1) {
      if (tileMap.isSolid(tx, ty)) return true;
    }
  }
  return false;
}

function resolveAxis(body, amount, tileMap, axis) {
  if (amount === 0) return false;

  const step = Math.sign(amount);
  body[axis] += amount;

  if (!intersectsSolid(body, tileMap)) return false;

  // Resolve one pixel at a time so the player cannot tunnel through a wall,
  // platform edge, or the ground even when frame time briefly spikes.
  let safety = 0;
  while (intersectsSolid(body, tileMap) && safety < TILE_SIZE * 2) {
    body[axis] -= step;
    safety += 1;
  }

  return true;
}

export function moveAndCollide(body, dx, dy, tileMap) {
  const hitX = resolveAxis(body, dx, tileMap, 'x');
  const hitY = resolveAxis(body, dy, tileMap, 'y');
  const grounded = hitY && dy > 0;
  return { grounded, hitX, hitY };
}

export function isGrounded(body, tileMap) {
  const probe = {
    x: body.x + 0.5,
    y: body.y + 1,
    width: Math.max(1, body.width - 1),
    height: body.height,
  };
  return intersectsSolid(probe, tileMap);
}

export function moveHorizontal(entity, dx, worldWidth) {
  entity.x += dx;
  entity.x = Math.max(0, Math.min(worldWidth - entity.width, entity.x));
}
