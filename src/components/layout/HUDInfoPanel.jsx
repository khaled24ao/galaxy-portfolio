import React, { useEffect, useState } from 'react';
import { audioManager } from '../utils/AudioManager';
import { motion, AnimatePresence } from 'framer-motion';

// Cyberpunk Text Decrypter Effect
const DecryptText = ({ text, delay = 0 }) => {
  const [display, setDisplay] = useState(text.replace(/./g, '█'));
  useEffect(() => {
    let iterations = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplay(text.split('').map((char, index) => {
          if (index < iterations) return char;
          return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"[Math.floor(Math.random() * 46)];
        }).join(''));
        if (iterations >= text.length) clearInterval(interval);
        iterations += 1/3;
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);
  return <span>{display}</span>;
};

export function HUDInfoPanel({ project, onClose }) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            pointerEvents: 'auto',
            background: 'radial-gradient(circle at left, rgba(0, 212, 255, 0.05) 0%, transparent 50%)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              audioManager.playPanelClose();
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ x: -500, opacity: 0, skewX: -10 }}
            animate={{ x: 0, opacity: 1, skewX: 0 }}
            exit={{ x: -500, opacity: 0, skewX: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="hud-panel"
            style={{
              background: 'linear-gradient(135deg, rgba(5, 10, 20, 0.95) 0%, rgba(2, 4, 10, 0.98) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              borderLeft: `5px solid ${project.color}`,
              // AAA Cyberpunk Clip Path
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)',
              padding: '50px 40px',
              overflowY: 'auto',
              fontFamily: "'Courier New', monospace",
              boxShadow: `30px 0 60px rgba(0,0,0,0.8), inset 0 0 50px ${project.color}22`,
              display: 'flex',
              flexDirection: 'column',
              scrollbarWidth: 'none',
              zIndex: 10002,
              position: 'fixed',
              top: 0, left: 0, height: '100vh', width: 480,
            }}
          >
            <style>{`
              ::-webkit-scrollbar { display: none; }
              @media (max-width: 768px) {
                .hud-panel {
                  width: 100vw !important;
                  clip-path: none !important;
                }
              }
              .hud-grid-bg {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background-image: 
                  linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px);
                background-size: 20px 20px;
                pointer-events: none; z-index: -1;
              }
              .hud-scan-line {
                position: absolute; top: 0; left: 0; width: 100%; height: 3px;
                background: ${project.color}; box-shadow: 0 0 20px 5px ${project.color};
                opacity: 0.6; animation: scan 3s ease-in-out infinite alternate; pointer-events: none;
              }
              @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
              .cyber-button:hover {
                background: ${project.color}33 !important;
                box-shadow: 0 0 30px ${project.color}44 !important;
                transform: scale(1.02);
              }
            `}</style>
            
            <div className="hud-grid-bg" />
            <div className="hud-scan-line" />
            
            {/* System Info Markers */}
            <div style={{ position: 'absolute', top: 20, left: 20, fontSize: 10, color: project.color, opacity: 0.8, letterSpacing: 2 }}>
              <DecryptText text={`UPLINK // NODE_${project.id.toString().padStart(4, '0')}`} />
            </div>
            <div style={{ position: 'absolute', bottom: 20, right: 20, fontSize: 10, color: project.color, opacity: 0.8, letterSpacing: 2 }}>
              STATUS: [ ONLINE ]
            </div>
            
            {/* Close button */}
            <button
              onClick={() => { audioManager.playUI('click'); onClose(); }}
              style={{
                position: 'absolute', top: 20, right: 20,
                background: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)', color: '#ff0055',
                width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', zIndex: 8001, clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)'
              }}
              onMouseEnter={e => { audioManager.playUI('hover'); e.currentTarget.style.background = 'rgba(255,0,85,0.3)'; e.currentTarget.style.boxShadow = '0 0 15px #ff0055'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,0,85,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >✕</button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 30, marginTop: 20 }}>
              <motion.div 
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                style={{ width: 40, height: 40, border: `2px dashed ${project.color}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 20px ${project.color}` }}
              >
                <div style={{ width: 20, height: 20, background: project.color, borderRadius: '50%' }} />
              </motion.div>
              <div>
                <span style={{ color: project.color, fontSize: 12, fontWeight: 700, letterSpacing: 3 }}>
                  <DecryptText text={`DATASET / PROJECT ${String(project.id).padStart(2, '0')}`} />
                </span>
                <h2 style={{ color: '#fff', margin: '8px 0 0 0', fontSize: 32, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', textShadow: `0 0 15px ${project.color}88` }}>
                  {project.name}
                </h2>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: 30, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              {project.description}
            </p>

            {/* Tech Stack */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ color: '#00d4ff', fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 15 }}>{`> MODULES LOADED`}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(project.tech || []).map((t, i) => (
                  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }} key={i} style={{
                    background: `rgba(0,212,255,0.05)`, border: `1px solid rgba(0,212,255,0.2)`,
                    color: '#e2e8f0', fontSize: 12, fontWeight: 600, padding: '8px 16px',
                    clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                  }}>
                    {t}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            {project.stats && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ color: '#00d4ff', fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 15 }}>{`> SYSTEM METRICS`}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  {Object.entries(project.stats).map(([k, v], i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} key={k} style={{ 
                      background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${project.color}`,
                      padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 5
                    }}>
                      <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{k}</div>
                      <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, textShadow: `0 0 10px ${project.color}` }}>{v}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 15, marginTop: 'auto', paddingBottom: 20 }}>
              {project.github && (
                <a href={project.github} onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('warpJump', { detail: { url: project.github } })); }}
                  className="cyber-button"
                  style={{
                    flex: 1, textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, letterSpacing: 1, transition: 'all 0.3s',
                    clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
                  }}
                >[ SOURCE_CODE ]</a>
              )}
              {project.demo && (
                <a href={project.demo} onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('warpJump', { detail: { url: project.demo } })); }}
                  className="cyber-button"
                  style={{
                    flex: 1, textAlign: 'center', padding: '16px', background: `${project.color}22`, border: `1px solid ${project.color}`,
                    color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, letterSpacing: 1, transition: 'all 0.3s', textShadow: '0 0 5px #fff',
                    clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
                  }}
                >[ LIVE_DEMO ]</a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}