import { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game.js';
import MobileControls from './ui/MobileControls.jsx';

export default function App() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const game = new Game(canvasRef.current);
    gameRef.current = game;
    game.render();
    return () => { game.destroy(); gameRef.current = null; };
  }, []);

  useEffect(() => { gameRef.current?.setPaused(paused); }, [paused]);

  useEffect(() => {
    if (!started) return undefined;
    const timer = window.setInterval(() => {
      setGameOver(Boolean(gameRef.current?.isGameOver()));
    }, 80);
    return () => window.clearInterval(timer);
  }, [started]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === 'r' && gameOver) retryGame();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameOver]);

  const startGame = () => {
    setStarted(true);
    setPaused(false);
    setGameOver(false);
    gameRef.current?.start();
  };

  const retryGame = () => {
    gameRef.current?.restart();
    setGameOver(false);
    setPaused(false);
  };

  const input = gameRef.current?.getInput();

  return (
    <main className="app-shell">
      <section className="game-frame" aria-label="XenoSalvo: Breach game">
        <header className="game-header"><div><p className="eyebrow">PROJECT 001</p><h1>XenoSalvo: Breach</h1></div><div className="status-light" aria-label="Engine online" /></header>
        <div className="canvas-wrap">
          <canvas ref={canvasRef} width={320} height={180} />
          {started && input && <MobileControls input={input} />}
          {!started && <div className="start-screen"><p className="start-kicker">SYSTEM INITIALIZED</p><h2>XENOSALVO</h2><p>Breach the unknown.</p><button type="button" onClick={startGame}>Start Prototype</button><p className="mobile-hint">Rotate your phone to landscape for the best experience.</p></div>}
          {started && paused && !gameOver && <div className="pause-screen"><h2>PAUSED</h2><button type="button" onClick={() => setPaused(false)}>Resume</button></div>}
          {started && gameOver && (
            <div className="game-over-screen">
              <p className="game-over-kicker">XENOSALVO // FIELD TEST</p>
              <h2>MISSION FAILED</h2>
              <p>Score: {gameRef.current?.score ?? 0}</p>
              <button className="retry-button" type="button" onClick={retryGame}>RETRY</button>
              <small className="retry-key-hint">Press R on PC</small>
            </div>
          )}
        </div>
        <footer className="game-footer"><span>320×180 • MOBILE</span><span>WASD / Touch</span>{started && !gameOver && <button className="pause-button" type="button" onClick={() => setPaused((value) => !value)}>{paused ? 'Resume' : 'Pause'}</button>}</footer>
      </section>
    </main>
  );
}
