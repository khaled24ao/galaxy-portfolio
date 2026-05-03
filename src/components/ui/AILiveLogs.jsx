import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cyberpunk Text Decrypter Effect for the header
const DecryptText = ({ text }) => {
  const [display, setDisplay] = useState(text.replace(/./g, '█'));
  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(text.split('').map((char, index) => {
        if (index < iterations) return char;
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"[Math.floor(Math.random() * 46)];
      }).join(''));
      if (iterations >= text.length) clearInterval(interval);
      iterations += 1/3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{display}</span>;
};

export function AILiveLogs() {
  const [logs, setLogs] = useState([
    { id: 'init', text: "GALAXY_OS // CORE INITIALIZED", type: 'sys' }
  ]);
  const logCounter = useRef(0);

  useEffect(() => {
    const handleLog = (e) => {
      const newLog = {
        id: `log_${logCounter.current++}_${Date.now()}`,
        text: e.detail.text,
        type: e.detail.type || 'info' 
      };
      
      setLogs(prev => {
        const next = [...prev, newLog];
        if (next.length > 5) return next.slice(next.length - 5);
        return next;
      });
    };

    window.addEventListener('ai_log', handleLog);
    return () => window.removeEventListener('ai_log', handleLog);
  }, []);

  const getColor = (type) => {
    switch(type) {
      case 'warn': return '#ff0055'; // Neon Pink/Red for warning
      case 'success': return '#00ffaa'; // Neon Green
      case 'sys': return '#00ffff'; // Neon Cyan
      default: return '#a8b2c1';
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 35, left: 35, width: 420,
      zIndex: 9000, pointerEvents: 'none',
      fontFamily: "'Courier New', monospace",
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      {/* Decorative Sci-Fi Header */}
      <div style={{ 
        color: '#00ffff', fontSize: 11, letterSpacing: 3, fontWeight: 900,
        background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.15) 0%, transparent 100%)',
        borderLeft: '4px solid #00ffff', padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)'
      }}>
        <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 8, height: 8, background: '#00ffff', boxShadow: '0 0 10px #00ffff' }} />
        <DecryptText text="GALAXY_OS // ORBITAL_COMMAND" />
      </div>

      {/* Log Container */}
      <div style={{
        background: 'rgba(2, 4, 10, 0.65)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 255, 255, 0.1)',
        borderTop: 'none',
        padding: '15px',
        display: 'flex', flexDirection: 'column', gap: 8,
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',
        position: 'relative'
      }}>
        {/* Subtle grid background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '10px 10px', pointerEvents: 'none', zIndex: -1
        }} />

        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                fontSize: 12, fontWeight: 700,
                color: getColor(log.type),
                display: 'flex', gap: 10, alignItems: 'flex-start',
                opacity: i === logs.length - 1 ? 1 : 0.6,
                textShadow: `0 0 8px ${getColor(log.type)}66`
              }}
            >
              <span style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>[{String(logCounter.current - (logs.length - 1 - i)).padStart(4, '0')}]</span>
              <div style={{ flex: 1, lineHeight: 1.4 }}>
                <TypewriterText text={log.text} color={getColor(log.type)} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-component for typing effect with block cursor
function TypewriterText({ text, color }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDone(false);
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 20); // Cyberpunk fast typing
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span style={{ display: 'inline-block', width: 6, height: 12, background: color, marginLeft: 4, verticalAlign: 'middle', boxShadow: `0 0 8px ${color}` }} />}
    </span>
  );
}
