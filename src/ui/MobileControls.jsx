import { useRef, useState } from 'react';

function Button({ className, label, symbol, onDown }) {
  const end = () => {};
  return <button type="button" className={`touch-action ${className}`} aria-label={label} onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); onDown(); }} onPointerUp={(e) => { e.preventDefault(); end(); }} onPointerCancel={end}><span>{symbol}</span><small>{label}</small></button>;
}

function Stick({ className, label, onChange, onEnd }) {
  const ref = useRef(null);
  const pointer = useRef(null);
  const [v, setV] = useState({ x: 0, y: 0 });
  const update = (x, y) => {
    const r = ref.current.getBoundingClientRect();
    const radius = Math.min(r.width, r.height) * 0.36;
    const dx = x - (r.left + r.width / 2);
    const dy = y - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    const scale = len > radius ? radius / len : 1;
    const next = { x: (dx * scale) / radius, y: (dy * scale) / radius };
    setV(next); onChange(next);
  };
  const end = () => { pointer.current = null; setV({ x: 0, y: 0 }); onEnd(); };
  return <div ref={ref} className={`touch-stick ${className}`} aria-label={label}
    onPointerDown={(e) => { e.preventDefault(); pointer.current = e.pointerId; ref.current.setPointerCapture(e.pointerId); update(e.clientX, e.clientY); }}
    onPointerMove={(e) => { if (pointer.current === e.pointerId) update(e.clientX, e.clientY); }}
    onPointerUp={(e) => { if (pointer.current === e.pointerId) end(); }} onPointerCancel={(e) => { if (pointer.current === e.pointerId) end(); }}>
    <span className="stick-ring" /><span className="stick-knob" style={{ transform: `translate(${v.x * 34}px, ${v.y * 34}px)` }} /><strong>{className.includes('aim-stick') ? 'AIM' : 'MOVE'}</strong>
  </div>;
}

export default function MobileControls({ input }) {
  return <div className="touch-controls" aria-label="Mobile controls">
    <Stick className="move-stick" label="Move joystick" onChange={(v) => input.setMove(v.x, v.y)} onEnd={() => input.setMove(0, 0)} />
    <Stick className="aim-stick" label="Aim joystick" onChange={(v) => input.setAim(v.x, v.y)} onEnd={() => {}} />
    <div className="action-cluster">
      <Button className="fire-button" label="FIRE" symbol="●" onDown={() => input.setActionDown('fire', true)} />
      <Button className="jump-button" label="JUMP" symbol="↑" onDown={() => input.pressAction('jump')} />
      <Button className="dodge-button" label="ROLL" symbol="↯" onDown={() => input.pressAction('dodge')} />
      <div className="skill-row">
        {[1,2,3,4].map((n) => <Button key={n} className="skill-button" label={`S${n}`} symbol={String(n)} onDown={() => input.pressAction(`skill${n}`)} />)}
      </div>
    </div>
  </div>;
}
