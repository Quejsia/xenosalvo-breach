const CHUNK_URLS = [
  '/assets/sprites/player-test/01.txt',
  '/assets/sprites/player-test/02.txt',
  '/assets/sprites/player-test/03.txt',
  '/assets/sprites/player-test/04.txt',
  '/assets/sprites/player-test/05.txt',
  '/assets/sprites/player-test/06.txt',
];

let atlasPromise = null;

export function loadPlayerTestAtlas() {
  if (atlasPromise) return atlasPromise;

  atlasPromise = Promise.all(CHUNK_URLS.map(async (url) => {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Failed to load sprite chunk: ${url}`);
    return response.text();
  })).then((chunks) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = `data:image/png;base64,${chunks.join('')}`;
    return new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to decode player test atlas'));
    });
  });

  return atlasPromise;
}
