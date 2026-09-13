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

export function moveAndCollide(body, dx, dy, tileMap) {
  let grounded = false;
  let hitX = false;
  let hitY = false;

  if (dx !== 0) {
    body.x += dx;
    if (intersectsSolid(body, tileMap)) {
      const step = Math.sign(dx);
      while (intersectsSolid(body, tileMap)) body.x -= step;
      hitX = true;
    }
  }

  if (dy !== 0) {
    body.y += dy;
    if (intersectsSolid(body, tileMap)) {
      const step = Math.sign(dy);
      while (intersectsSolid(body, tileMap)) body.y -= step;
      hitY = true;
      grounded = dy > 0;
    }
  }

  return { grounded, hitX, hitY };
}

export function isGrounded(body, tileMap) {
  const probe = { x: body.x, y: body.y + 1, width: body.width, height: body.height };
  return intersectsSolid(probe, tileMap);
}

export function moveHorizontal(entity, dx, worldWidth) {
  entity.x += dx;
  entity.x = Math.max(0, Math.min(worldWidth - entity.width, entity.x));
}
