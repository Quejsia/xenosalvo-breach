const PLAYER_TEST_ATLAS_URL = 'https://res.cloudinary.com/dlran88nf/image/upload/v1789473556/xenosalvo-breach/test-player/player-test-atlas-final-v2.png';

let atlasPromise = null;

export function loadPlayerTestAtlas() {
  if (atlasPromise) return atlasPromise;

  atlasPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load player test atlas'));
    image.src = PLAYER_TEST_ATLAS_URL;
  });

  return atlasPromise;
}
