import { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game.js';

export default function App() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const game = new Game(canvasRef.current);
    gameRef.current = game;

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    gameRef.current?.setPaused(paused);
  }, [paused]);

  const startGame = () => {
    setStarted(true);
    setPaused(false);
    gameRef.current?.start();
  };

  return (
    <main className="app-shell">
      <section className="game-frame" aria-label="XenoSalvo: Breach game">
        <header className="game-header">
          <div>
            <p className="eyebrow">PROJECT 001</p>
            <h1>XenoSalvo: Breach</h1>
          </div>
          <div className="status-light" aria-label="Engine online" />
        </header>

        <div className="canvas-wrap">
          <canvas ref={canvasRef} width={320} height={180} />
          {!started && (
            <div className="start-screen">
              <p className="start-kicker">SYSTEM INITIALIZED</p>
              <h2>XENOSALVO</h2>
              <p>Breach the unknown.</p>
              <button type="button" onClick={startGame}>Start Prototype</button>
              <p className="mobile-hint">Rotate your phone to landscape for the best experience.</p>
            </div>
          )}
          {started && paused && (
            <div className="pause-screen">
              <h2>PAUSED</h2>
              <button type="button" onClick={() => setPaused(false)}>Resume</button>
            </div>
          )}
        </div>

        <footer className="game-footer">
          <span>Canvas 320×180</span>
          <span>WASD / Arrow Keys</span>
          {started && (
            <button className="pause-button" type="button" onClick={() => setPaused((value) => !value)}>
              {paused ? 'Resume' : 'Pause'}
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
