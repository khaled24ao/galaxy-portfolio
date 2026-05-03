import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';

const bootSequence = [
  "ORBITAL COMMAND LINK ESTABLISHED",
  "SYNCHRONIZING CORE SYSTEMS...",
  "CALIBRATING GRAVITATIONAL LENSING...",
  "LOADING NEURAL DATA NODES...",
  "SYSTEM ALIGNMENT AT 100%"
];

// Decrypt text effect for high-end sci-fi look
const DecryptText = ({ text }) => {
  const [display, setDisplay] = useState(text.replace(/./g, '█'));
  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(text.split('').map((char, index) => {
        if(index < iterations) return char;
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)];
      }).join(''));
      if(iterations >= text.length) clearInterval(interval);
      iterations += 1/3;
    }, 20);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{display}</span>;
};

export function AILoadingScreen({ onReady }) {
  const { progress, total, active } = useProgress();
  const [logs, setLogs] = useState([]);
  const [bootPhase, setBootPhase] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (bootPhase < bootSequence.length) {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, bootSequence[bootPhase]]);
        setBootPhase(b => b + 1);
      }, Math.random() * 400 + 200);
      return () => clearTimeout(timeout);
    } else {
      if (progress === 100 || (total > 0 && !active)) {
        setIsReady(true);
      }
      const failSafe = setTimeout(() => { setIsReady(true); }, 2500);
      return () => clearTimeout(failSafe);
    }
  }, [bootPhase, progress, total, active]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at center, #050a14 0%, #000000 100%)',
      zIndex: 9999, color: '#00ffff', 
      fontFamily: "'Inter', sans-serif", padding: '40px',
      overflow: 'hidden'
    }}>
      {/* Background Cyber-Grid */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: -1
      }} />

      {/* Epic Title */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ textAlign: 'center', marginBottom: 60 }}>
        <h1 style={{ 
          fontSize: '6rem', fontWeight: 900, margin: 0, letterSpacing: 20, 
          background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 30px rgba(255, 0, 255, 0.4))'
        }}>
          GALAXY_OS
        </h1>
        <div style={{ color: '#00ffff', fontSize: 14, letterSpacing: 10, marginTop: -10, fontWeight: 700 }}>
          <DecryptText text="ORBITAL PORTFOLIO NETWORK" />
        </div>
      </motion.div>

      {/* Cinematic Loading Bar */}
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ 
          width: '100%', height: 4, background: 'rgba(0, 255, 255, 0.1)', 
          position: 'relative', marginBottom: 20,
          boxShadow: '0 0 20px rgba(0,255,255,0.1)'
        }}>
          <div style={{ 
            position: 'absolute', top: 0, left: 0, height: '100%', 
            background: '#00ffff', width: `${progress}%`,
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 15px #00ffff'
          }} />
        </div>
        
        {/* Status Text replacing the massive terminal logs */}
        <div style={{ 
          fontSize: 11, letterSpacing: 5, color: '#00ffff', fontWeight: 600,
          textTransform: 'uppercase', height: 20, textAlign: 'center'
        }}>
          {logs.length > 0 ? logs[logs.length - 1] : "INITIALIZING..."} {Math.round(progress)}%
        </div>

        {/* Start Button */}
        <div style={{ marginTop: 60, height: 60 }}>
          {isReady && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05, background: 'rgba(0, 255, 255, 0.25)', boxShadow: '0 0 50px rgba(0, 255, 255, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onReady}
              style={{
                padding: '18px 60px', background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid #00ffff', color: '#00ffff', cursor: 'pointer',
                letterSpacing: 8, textTransform: 'uppercase', fontSize: 15, fontWeight: 900,
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 15px rgba(0, 255, 255, 0.2)',
                clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
              }}
            >
              [ INITIATE SEQUENCE ]
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
