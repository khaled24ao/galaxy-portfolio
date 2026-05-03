import React, { useState, useEffect, useRef } from 'react';

const PHASE_TEXT = {
  void:         { line1: '★ GENESIS PROTOCOL ★',   line2: 'Two stars collide...',         line3: 'to create something impossible.' },
  big_bang:     { line1: '◈ CATACLYSM ◈',          line2: 'The universe shatters',        line3: 'and is reborn.' },
  sun_forming:  { line1: '☀ IGNITION',              line2: 'From absolute chaos,',         line3: 'a sun awakens.' },
  orbit_form:   { line1: '🪐 ORBITAL SYMPHONY',     line2: 'Worlds emerge,',               line3: 'each one a story.' },
  camera_orbit: { line1: '',                        line2: 'Every project,',               line3: 'a planet in my universe.' },
  reveal:       { line1: '',                        line2: 'Welcome to the cosmos',        line3: 'of Khalid Mohamed — AI Architect.' },
  title:        { line1: '',                        line2: '',                             line3: '' },
  interactive:  { line1: '',                        line2: '',                             line3: '' },
};

export function CinematicText({ phase }) {
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [text, setText] = useState({ line1:'', line2:'', line3:'' });
  const timerRef = useRef(null);
  const prevPhase = useRef(null);

  useEffect(() => {
    if (phase === prevPhase.current) return;
    prevPhase.current = phase;

    const t = PHASE_TEXT[phase];
    if (!t || (!t.line1 && !t.line2 && !t.line3)) {
      setOpacity(0);
      setTimeout(() => setVisible(false), 600);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setText(t);
    setVisible(true);
    requestAnimationFrame(() => setOpacity(1));

    timerRef.current = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => setVisible(false), 700);
    }, 2800);
  }, [phase]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
      zIndex: 8500, textAlign: 'center', pointerEvents: 'none',
      transition: 'opacity 0.7s ease', opacity,
    }}>
      {text.line1 && (
        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: 11, letterSpacing: 6,
          color: '#00d4ff', textTransform: 'uppercase', marginBottom: 8, opacity: 0.8,
        }}>{text.line1}</div>
      )}
      {text.line2 && (
        <div style={{
          fontFamily: "'Georgia', serif", fontSize: 28, fontStyle: 'italic',
          color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(0,100,255,0.3)',
          marginBottom: 6, letterSpacing: 2,
        }}>{text.line2}</div>
      )}
      {text.line3 && (
        <div style={{
          fontFamily: "'Georgia', serif", fontSize: 28, fontStyle: 'italic',
          color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(0,100,255,0.3)',
          letterSpacing: 2,
        }}>{text.line3}</div>
      )}
      <div style={{
        width: 60, height: 1,
        background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
        margin: '12px auto 0', opacity: 0.6,
      }} />
    </div>
  );
}
