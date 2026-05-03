import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/AudioManager';

export function SideMenu({ projects, selectedProj, onPlanetSelect, open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)', backdropFilter: 'blur(3px)' }}
          />

          <motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: '2%', right: '1%', width: 380, height: '96vh', zIndex: 10000,
              display: 'flex', flexDirection: 'column', background: 'rgba(5, 8, 18, 0.85)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 212, 255, 0.2)',
              boxShadow: '-10px 0 50px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,212,255,0.1)',
              fontFamily: "'Courier New', monospace",
              clipPath: 'polygon(30px 0, 100% 0, 100% 100%, 0 100%, 0 30px)' // Cyberpunk corner
            }}
          >
            {/* Header */}
            <div style={{ padding: '30px 25px 20px', borderBottom: '1px solid rgba(0,212,255,0.15)', background: 'linear-gradient(90deg, rgba(0,212,255,0.1) 0%, transparent 100%)' }}>
              <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 4, opacity: 0.8, marginBottom: 5 }}>// ORBITAL DIRECTORY</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 24, color: '#fff', fontWeight: 900, letterSpacing: 2, textShadow: '0 0 10px #00d4ff' }}>SYSTEM NODES</div>
                <div style={{ fontSize: 12, color: '#00d4ff', fontWeight: 'bold' }}>{projects.length} ACTIVE</div>
              </div>
            </div>

            {/* Project List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px 0', scrollbarWidth: 'none' }}>
              {projects.map((project, idx) => {
                const isSel = selectedProj?.id === project.id;
                return (
                  <motion.div key={project.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * idx }}
                    onClick={() => { audioManager.playUI('click'); onPlanetSelect(project); }}
                    onMouseEnter={() => audioManager.playUI('hover')}
                    style={{
                      padding: '18px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 15,
                      background: isSel ? 'linear-gradient(90deg, rgba(0, 212, 255, 0.15) 0%, transparent 100%)' : 'transparent',
                      borderLeft: isSel ? '4px solid #00d4ff' : '4px solid transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'all 0.2s ease', position: 'relative'
                    }}
                    whileHover={{ backgroundColor: 'rgba(0, 212, 255, 0.08)', paddingLeft: '30px' }}
                  >
                    {isSel && (
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: '#fff', boxShadow: '0 0 15px #fff' }}
                      />
                    )}
                    
                    {/* Reticle */}
                    <div style={{ width: 14, height: 14, border: `1px solid ${isSel ? '#fff' : project.color}`, borderRadius: isSel ? '0%' : '50%', background: isSel ? project.color : 'transparent', boxShadow: isSel ? `0 0 15px ${project.color}` : 'none', transition: 'all 0.3s', transform: isSel ? 'rotate(45deg)' : 'none', flexShrink: 0 }} />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: isSel ? '#fff' : '#94a3b8', fontSize: 14, fontWeight: isSel ? 800 : 500, letterSpacing: 1, textTransform: 'uppercase', textShadow: isSel ? `0 0 10px ${project.color}` : 'none' }}>
                        {project.name}
                      </div>
                      {project.tech && (
                        <div style={{ color: isSel ? '#00d4ff' : '#475569', fontSize: 10, marginTop: 4, letterSpacing: 1 }}>
                          {project.tech.slice(0, 3).join(' /> ')}
                        </div>
                      )}
                    </div>
                    <span style={{ color: isSel ? '#00d4ff' : '#334155', fontSize: 12, fontWeight: 800, opacity: isSel ? 1 : 0.5 }}>
                      [{String(idx + 1).padStart(2, '0')}]
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 25px', borderTop: '1px solid rgba(0,212,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#00d4ff', fontSize: 10, letterSpacing: 2, background: 'rgba(0,212,255,0.03)' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }} style={{ width: 4, background: '#00d4ff', boxShadow: '0 0 5px #00d4ff' }} />
                ))}
              </div>
              <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_STATUS: SYNCED</motion.span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
