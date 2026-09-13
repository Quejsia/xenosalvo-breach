import { useEffect, useRef, useState } from 'react';

const clampVector = (x, y, max = 1) => {
  const length = Math.hypot(x, y);
  if (!length || length <= max) return { x, y };
  return { x: x / length, y: y / length };
};

function Stick({ className, label, onChange, onEnd }) {
  const ref = useRef(null);
  const pointerId = useRef(null);
  const [vector, setVector] = useState({ x: 0, y: 0 });

  const update = (clientX, clientY) => {
    const rect = ref.current.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) * 0.36;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const next = clampVector(dx / radius, dy / radius);
    setVector(next);
    onChange(next);
  };

  const end = () => {
    pointerId.current = null;
    setVector({ x: 0, y: 0 });
    onEnd();
  };

  useEffect(() => () => onEnd(), [onEnd]);

  return (
    <div
      ref={ref}
      className={`touch-stick ${className}`}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        pointerId.current = event.pointerId;
        ref.current.setPointerCapture(event.pointerId);
        update(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (pointerId.current === event.pointerId) {
          event.preventDefault();
          update(event.clientX, event.clientY);
        }
      }}
      onPointerUp={(event) => {
        if (pointerId.current === event.pointerId) end();
      }}
      onPointerCancel={(event) => {
        if (pointerId.current === event.pointerId) end();
      }}
      onLostPointerCapture={(event) => {
        if (pointerId.current === event.pointerId) end();
      }}
    >
      <span className="stick-ring" />
      <span
        className="stick-knob"
        style={{ transform: `translate(${vector.x * 34}px, ${vector.y * 34}px)` }}
      />
      <strong>{className.includes('aim-stick') ? 'AIM' : 'MOVE'}</strong>
    </div>
  );
}

function ActionButton({ className, label, symbol, onDown, onUp }) {
  const activePointer = useRef(null);

  return (
    <button
      type="button"
      className={`touch-action ${className}`}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        activePointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        onDown(event.pointerId);
      }}
      onPointerUp={(event) => {
        event.preventDefault();
        if (activePointer.current === event.pointerId) {
          activePointer.current = null;
          onUp(event.pointerId);
        }
      }}
      onPointerCancel={(event) => {
        if (activePointer.current === event.pointerId) {
          activePointer.current = null;
          onUp(event.pointerId);
        }
      }}
      onLostPointerCapture={(event) => {
        if (activePointer.current === event.pointerId) {
          activePointer.current = null;
          onUp(event.pointerId);
        }
      }}
    >
      <span>{symbol}</span>
      <small>{label}</small>
    </button>
  );
}

export default function TouchControls({ input }) {
  return (
    <div className="touch-controls" aria-label="Mobile controls">
      <Stick
        className="move-stick"
        label="Move joystick"
        onChange={(value) => input.setMove(value.x, value.y)}
        onEnd={() => input.setMove(0, 0)}
      />

      <Stick
        className="aim-stick"
        label="Aim joystick"
        onChange={(value) => input.setAim(value.x, value.y)}
        onEnd={() => input.setAim(1, 0)}
      />

      <div className="action-cluster">
        <ActionButton
          className="fire-button"
          label="FIRE"
          symbol="●"
          onDown={(pointerId) => input.beginFire(pointerId)}
          onUp={(pointerId) => input.endFire(pointerId)}
        />
        <ActionButton
          className="dodge-button"
          label="ROLL"
          symbol="↯"
          onDown={() => input.pressAction('dodge')}
          onUp={() => {}}
        />
        <div className="skill-row">
          <ActionButton className="skill-button" label="S1" symbol="1" onDown={() => input.pressAction('skill1')} onUp={() => {}} />
          <ActionButton className="skill-button" label="S2" symbol="2" onDown={() => input.pressAction('skill2')} onUp={() => {}} />
          <ActionButton className="skill-button" label="S3" symbol="3" onDown={() => input.pressAction('skill3')} onUp={() => {}} />
          <ActionButton className="skill-button" label="S4" symbol="4" onDown={() => input.pressAction('skill4')} onUp={() => {}} />
        </div>
      </div>
    </div>
  );
}
