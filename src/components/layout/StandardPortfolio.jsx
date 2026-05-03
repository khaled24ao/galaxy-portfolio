import React, { useEffect, useMemo, useRef, useState } from 'react';
import { audioManager } from '../utils/AudioManager';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

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

/* ═══════════════════════════════════════════════════════
   3D NEURAL NETWORK BACKGROUND
   ═══════════════════════════════════════════════════════ */
function NeuralNetwork() {
  const pointsRef = useRef();
  const linesRef = useRef();

  const particleCount = 120;
  const maxDistance = 3.8;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      vel.push(new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02));
    }
    return { positions: pos, velocities: vel };
  }, [particleCount]);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;

      if (Math.abs(positions[i * 3]) > 10) velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 10) velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2] + 5) > 5) velocities[i].z *= -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    const linePositions = [];
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistance * maxDistance) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }
    linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#00ffff" size={0.1} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#ff00ff" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PORTFOLIO COMPONENT
   ═══════════════════════════════════════════════════════ */
export function StandardPortfolio({ onBack }) {
  useEffect(() => {
    audioManager.playSound('glitch-trans');
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.05, y: -40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100vw', height: '100vh', 
        background: 'radial-gradient(circle at center, rgba(2, 6, 23, 0.9) 0%, rgba(0, 0, 0, 1) 100%)',
        color: '#e2e8f0',
        fontFamily: "'Courier New', monospace",
        overflowY: 'auto', overflowX: 'hidden',
        position: 'fixed', top: 0, left: 0,
        zIndex: 20000,
        scrollbarWidth: 'none'
      }}
    >
      <style>{`
        ::-webkit-scrollbar { display: none; }
        .cyber-card {
          background: rgba(10, 15, 30, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 255, 255, 0.15);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.05);
          transition: all 0.3s ease;
          position: relative;
          clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
        }
        .cyber-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 40px; background: #00ffff; box-shadow: 0 0 10px #00ffff;
        }
        .cyber-card:hover {
          border-color: rgba(255, 0, 255, 0.5);
          box-shadow: 0 15px 50px rgba(255, 0, 255, 0.15), inset 0 0 30px rgba(255, 0, 255, 0.1);
          transform: translateY(-5px);
        }
        .cyber-card:hover::before {
          background: #ff00ff; box-shadow: 0 0 10px #ff00ff;
        }
        .cyber-gradient {
          background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        }
        .grid-bg {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-image: linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none; z-index: -1;
        }
      `}</style>

      {/* 3D BACKGROUND */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2, opacity: 0.8 }}>
        <Canvas camera={{ position: [0, 0, 15] }}>
          <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
          <NeuralNetwork />
        </Canvas>
      </div>
      <div className="grid-bg" />

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '24px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%)',
        backdropFilter: 'blur(5px)',
        borderBottom: '1px solid rgba(0, 255, 255, 0.1)'
      }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 4, display: 'flex', alignItems: 'center', gap: 15 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} style={{ width: 16, height: 16, border: '2px dashed #00ffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, background: '#ff00ff', borderRadius: '50%', boxShadow: '0 0 10px #ff00ff' }} />
          </motion.div>
          <DecryptText text="KHALED MOHAMED" delay={200} />
        </div>
        <button 
          onClick={() => {
            audioManager.playSound('tech-beep');
            onBack();
          }}
          style={{
            background: 'rgba(255, 0, 85, 0.1)', border: '1px solid rgba(255, 0, 85, 0.4)',
            color: '#ff0055', padding: '12px 30px',
            cursor: 'pointer', fontWeight: 800, letterSpacing: 3, fontSize: 12, textTransform: 'uppercase',
            transition: 'all 0.3s',
            boxShadow: '0 0 20px rgba(255, 0, 85, 0.2)',
            clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 0, 85, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 85, 0.6)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 85, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          [ TERMINATE_LINK ]
        </button>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 40px 120px' }}>
        
        {/* HERO SECTION */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 120, position: 'relative' }}>
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <div style={{ color: '#00ffff', letterSpacing: 5, fontSize: 14, textTransform: 'uppercase', marginBottom: 20, fontWeight: 700 }}>
              <DecryptText text="/// ROOT_ACCESS: GRANTED | ROLE: AI_ENGINEER" delay={500} />
            </div>
            <h1 style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1.1, margin: 0, fontFamily: "'Inter', sans-serif", letterSpacing: -2 }}>
              DEPLOYING <span className="cyber-gradient">INTELLIGENCE</span> <br/>
              AT SCALE.
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: 800, lineHeight: 1.8, marginTop: 20, fontFamily: "'Inter', sans-serif" }}
          >
            I specialize in orchestrating highly complex <strong style={{ color: '#fff' }}>MLOps pipelines</strong>, architecting autonomous <strong style={{ color: '#fff' }}>AI agents</strong>, and engineering full-stack ecosystems. 
            Currently managing <strong style={{ color: '#ff00ff' }}>14 production-grade AI nodes</strong> spanning from advanced RAG systems to predictive neural networks.
          </motion.p>
        </section>

        {/* METRICS DASHBOARD */}
        <section style={{ marginBottom: 120 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 25 }}>
            <MetricCard value="14" label="PRODUCTION NODES" delay={0.3} />
            <MetricCard value="99.9%" label="SYSTEM UPTIME" delay={0.4} />
            <MetricCard value="<50ms" label="INFERENCE LATENCY" delay={0.5} />
            <MetricCard value="4.2B" label="PARAMS HANDLED" delay={0.6} />
          </div>
        </section>

        {/* AI SPECIALIZATIONS GRID */}
        <section style={{ marginBottom: 120 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 50 }}>
            <div style={{ width: 50, height: 2, background: '#00ffff', boxShadow: '0 0 10px #00ffff' }} />
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
              <span className="cyber-gradient">CORE</span> PROTOCOLS
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 30 }}>
            {[
              { icon: '🧠', title: 'DEEP_LEARNING', desc: 'Designing and training custom neural networks using PyTorch and TensorFlow for specialized enterprise tasks.' },
              { icon: '💬', title: 'LLM_INTEGRATION', desc: 'Fine-tuning LLaMA 3, Mistral, and GPT models. Advanced Prompt Engineering and building multi-agent systems.' },
              { icon: '🔍', title: 'RAG_ARCHITECTURES', desc: 'Building Retrieval-Augmented Generation systems using Vector Databases (ChromaDB, FAISS) for context-aware AI.' },
              { icon: '🤖', title: 'AUTONOMOUS_AGENTS', desc: 'Developing self-reasoning AI agents using LangChain and LlamaIndex to automate complex business workflows.' },
              { icon: '⚙️', title: 'MLOPS_PIPELINES', desc: 'End-to-end model lifecycle management. Dockerizing ML models, CI/CD, and deploying on AWS/GCP via FastAPI.' },
              { icon: '📊', title: 'DATA_ENGINEERING', desc: 'Building massive data pipelines, preprocessing datasets for ML training, and optimizing real-time inference latency.' }
            ].map((spec, i) => (
              <motion.div 
                key={spec.title}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                className="cyber-card" style={{ padding: '40px' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 20, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}>{spec.icon}</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 15, letterSpacing: 1 }}>{spec.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>{spec.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* WORKFLOW / TECH STACK */}
        <section className="cyber-card" style={{ padding: '60px 50px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,0,255,0.2) 0%, transparent 70%)', filter: 'blur(50px)', borderRadius: '50%' }} />
          
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 40, position: 'relative', zIndex: 2, color: '#fff', letterSpacing: 2 }}>
            <DecryptText text="> TECHNOLOGY_STACK" delay={800} />
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, position: 'relative', zIndex: 2 }}>
            {['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'Node.js', 'React.js', 'Three.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'GitHub Actions', 'AWS', 'GCP', 'LlamaIndex', 'LangChain'].map((tech, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
                key={tech} 
                style={{
                  padding: '12px 24px', background: 'rgba(0, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  fontSize: '1.1rem', color: '#00ffff', letterSpacing: 1, fontWeight: 700,
                  boxShadow: '0 0 15px rgba(0,255,255,0.1)',
                  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                }}
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </motion.div>
  );
}

function MetricCard({ value, label, delay }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay }}
      className="cyber-card" style={{ padding: '35px 20px', textAlign: 'center' }}
    >
      <div className="cyber-gradient" style={{ fontSize: '3.8rem', fontWeight: 900, marginBottom: 15 }}>{value}</div>
      <div style={{ color: '#94a3b8', fontSize: '1rem', letterSpacing: 3, fontWeight: 700 }}>{label}</div>
    </motion.div>
  );
}
