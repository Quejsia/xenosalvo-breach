# XenoSalvo: Breach

An original 2D action game built from scratch for the web.

## Stack

- Vite 8
- React 19 + JSX
- JavaScript
- HTML5 Canvas 2D
- CSS

## Architecture

React owns presentation UI such as menus, HUD, pause screens, and settings. The Canvas game runs independently through a `requestAnimationFrame` loop with dedicated input, rendering, and entity modules.

```text
src/
├── game/
│   ├── entities/
│   │   └── Player.js
│   ├── Game.js
│   ├── GameLoop.js
│   ├── Input.js
│   └── Renderer.js
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

## Development

```bash
npm install
npm run dev
```

The project currently contains the first playable engine prototype: a 320×180 Canvas, game loop, keyboard input, renderer, and controllable prototype player.

## Direction

Classic 2D arcade engineering principles, modern browser technology, and completely original game content.
