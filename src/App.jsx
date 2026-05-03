import React, { useState, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, ChromaticAberration } from '@react-three/postprocessing';
import { useTexture } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';
import { GalaxyScene } from './components/scenes/GalaxyScene';
import { WarpTunnel } from './components/scenes/WarpTunnel';
import { HUDInfoPanel } from './components/layout/HUDInfoPanel';
import { SideMenu } from './components/layout/SideMenu';
import { StandardPortfolio } from './components/layout/StandardPortfolio';
import { HologramIntro } from './components/intro/HologramIntro';
import { GlitchOverlay } from './components/system/GlitchOverlay';
import { CinematicText } from './components/ui/CinematicText';
import { AILiveLogs } from './components/ui/AILiveLogs';
import { AILoadingScreen } from './components/layout/AILoadingScreen';
import { projectsData } from './components/utils/projectsData';
import { audioManager } from './components/utils/AudioManager';
import './styles/globals.css';
import './styles/animations.css';

/* ── Asset Preloader ── */
function TexturePreloader() {
  // Only preload textures that actually exist in the public folder
  const paths = [
    '/textures/sun_surface.jpg',
    '/textures/space_panorama.jpg',
    '/textures/earth_albedo.jpg'
  ];
  
  // Note: we don't use useTexture here because if one fails, it crashes the app.
  // We use a manual loader to be safe.
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    paths.forEach(p => loader.load(p, undefined, undefined, () => console.warn("Failed to load texture:", p)));
  }, []);

  return null;
}

/* ═══════════════════════════════════════════════
   ROOT APP
   ═══════════════════════════════════════════════ */

export default function App() {
  const [scene, setScene] = useState('loading');
  const [selectedProj, setSelected] = useState(null);
  const [showGlitch, setGlitch] = useState(false);
  const [showSkip, setSkip] = useState(false);
  const [currentPhase, setPhase] = useState('void');
  const [menuOpen, setMenu] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showHint, setHint] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  
  // Warp jump state
  const [warpUrl, setWarpUrl] = useState(null);

  // Global event listener for camera reset and warp jumps
  useEffect(() => {
    const handleWarp = (e) => {
      const { url } = e.detail;
      setWarpUrl(url);
      window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'INITIATING WARP JUMP TO EXTERNAL NODE...', type: 'warn' } }));
      audioManager.playSound('nuclear-boom', { volume: 0.8 });
      
      setTimeout(() => {
        window.open(url, '_blank');
        setTimeout(() => setWarpUrl(null), 500); // give time to transition back
      }, 1500); // 1.5s warp duration
    };

    const handleGlitch = (e) => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), e.detail?.duration || 1000);
    };

    window.addEventListener('warpJump', handleWarp);
    window.addEventListener('trigger_glitch', handleGlitch);
    const b = e => e.preventDefault();
    document.addEventListener('contextmenu', b);
    return () => {
      window.removeEventListener('warpJump', handleWarp);
      window.removeEventListener('trigger_glitch', handleGlitch);
      document.removeEventListener('contextmenu', b);
    };
  }, []);

  // Show "click planets" hint 2s after going interactive
  useEffect(() => {
    if (currentPhase === 'interactive') {
      const t = setTimeout(() => { setHint(true); }, 2000);
      const h = setTimeout(() => { setHint(false); }, 8000); // auto-hide after 6s
      return () => { clearTimeout(t); clearTimeout(h); };
    }
  }, [currentPhase]);

  /* ── transitions ── */
  const toHologram = () => {
    audioManager.playUI('click');
    setScene('hologram');
  }
  const toGalaxy = () => {
    audioManager.playUI('success');
    setGlitch(true);
    setTimeout(() => { setScene('galaxy'); setGlitch(false); }, 500);
  };
  const toPortfolio = () => {
    window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'Retrieving Biometric Profile...', type: 'sys' } }));
    audioManager.playPanelOpen();
    audioManager.playWhoosh(1);
    setMenu(false);
    setGlitch(true);
    setTimeout(() => { setShowPortfolio(true); setGlitch(false); }, 500);
  };
  const closePortfolio = () => {
    window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'Returning to Universal View...', type: 'info' } }));
    audioManager.playPanelClose();
    setShowPortfolio(false);
  };

  /* ── planet interactions ── */
  const handlePlanetSelect = (project) => {
    window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: `Targeting Node: ${project.name}`, type: 'success' } }));
    audioManager.playPlanetLock(); // Zoom-in sound
    setSelected(project);
    const idx = projectsData.findIndex(p => p.id === project.id);
    setSelectedIdx(idx);
    setHint(false);
  };
  const handleCloseHUD = () => {
    window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'Target deselected. Free navigation.', type: 'info' } }));
    audioManager.playPlanetRelease(); // Zoom-out sound
    setSelected(null);
    setSelectedIdx(null);
    setMenu(false);
    window.dispatchEvent(new CustomEvent('resetCamera'));
  };
  const handleMenuPlanet = (project) => {
    window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: `Navigating to ${project.name} cluster...`, type: 'success' } }));
    audioManager.playPlanetLock(); // Lock-on sound
    audioManager.playWhoosh(1); // Camera movement whoosh
    window.dispatchEvent(new CustomEvent('zoomToPlanet', { detail: project }));
    setSelected(project);
    const idx = projectsData.findIndex(p => p.id === project.id);
    setSelectedIdx(idx);
    setMenu(false);
    setHint(false);
  };
  const toggleMenu = () => {
    window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: menuOpen ? 'Closing Neural Directory.' : 'Accessing Neural Directory...', type: 'sys' } }));
    if (menuOpen) {
      audioManager.playPanelClose();
      setMenu(false);
      window.dispatchEvent(new CustomEvent('resetCamera'));
    } else {
      audioManager.playPanelOpen();
      setSelected(null);
      setSelectedIdx(null);
      setMenu(true);
    }
  };

  const isInteractive = currentPhase === 'interactive' && scene === 'galaxy';

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>

      {/* ── LOADING / ENTRY ── */}
      {scene === 'loading' && (
        <AILoadingScreen onReady={toHologram} />
      )}

      {/* ── HOLOGRAM INTRO ── */}
      {scene === 'hologram' && <HologramIntro onComplete={toGalaxy} />}

      {/* ── 3D CANVAS (Preloads during Loading) ── */}
      {(scene === 'loading' || scene === 'galaxy') && (
        <Canvas
          camera={{ position: [0, 0, 600], fov: 50, far: 200000, near: 0.1 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: 3, toneMappingExposure: 1.0 }}
          dpr={[1, 1.5]}
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1,
            opacity: scene === 'galaxy' ? 1 : 0, 
            pointerEvents: scene === 'galaxy' ? 'auto' : 'none',
            transition: 'opacity 1s ease-in-out'
          }}
        >
          <Suspense fallback={null}>
            <TexturePreloader />
            {scene === 'galaxy' && (
              <GalaxyScene
                onProjectSelect={handlePlanetSelect}
                selectedProject={selectedProj}
                selectedIdx={selectedIdx}
                setSelectedIdx={setSelectedIdx}
                onSkipReady={setSkip}
                onPhaseChange={setPhase}
              />
            )}
          </Suspense>
        </Canvas>
      )}

      {/* ── SKIP INTRO ── */}
      {showSkip && scene === 'galaxy' && (
        <button
          onClick={() => { window.dispatchEvent(new CustomEvent('skipIntro')); setSkip(false); }}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
            background: 'rgba(0, 212, 255, 0.1)', border: '1px solid #00d4ff',
            color: '#00d4ff', padding: '12px 30px',
            fontFamily: "'Courier New',monospace", fontSize: 13, fontWeight: 'bold',
            cursor: 'pointer', backdropFilter: 'blur(10px)',
            textTransform: 'uppercase', letterSpacing: 4,
            boxShadow: '0 0 15px rgba(0,212,255,0.2)',
            clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(0,212,255,0.3)'; e.target.style.boxShadow = '0 0 30px rgba(0,212,255,0.6)'; e.target.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.target.style.background = 'rgba(0,212,255,0.1)'; e.target.style.boxShadow = '0 0 15px rgba(0,212,255,0.2)'; e.target.style.transform = 'scale(1)'; }}
        >
          Skip Intro ▶▶
        </button>
      )}

      {/* ── TITLE SCREEN (Phase 7) ── */}
      {(currentPhase === 'title' || currentPhase === 'reveal') && scene === 'galaxy' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 8800, pointerEvents: 'none',
          animation: 'fadeInUp 1.5s ease both',
        }}>
          <div style={{
            fontFamily: "'Courier New',monospace", fontSize: 11,
            letterSpacing: 8, color: '#00d4ff88', textTransform: 'uppercase', marginBottom: 12,
          }}>Portfolio</div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 65, fontWeight: 900,
            background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: 6, filter: 'drop-shadow(0 0 20px rgba(255,0,255,0.6))',
            margin: '10px 0'
          }}>KHALED MOHAMED</div>
          <div style={{
            fontFamily: "'Courier New',monospace", fontSize: 16,
            letterSpacing: 8, color: '#00d4ff', marginTop: 10,
            textShadow: '0 0 30px rgba(0,212,255,0.5)',
          }}>AI DEVELOPER</div>
          {currentPhase === 'title' && (
            <button
              onClick={() => {
                audioManager.playSound('tech-beep');
                audioManager.stopSound('symphonic-war', 2000); // fade out war song over 2s
                audioManager.playSound('space-ambient', { volume: 0.3, loop: true }); // no fade bug
                window.dispatchEvent(new CustomEvent('enterPortfolio'));
              }}
              style={{
                marginTop: 40, padding: '16px 50px', pointerEvents: 'auto',
                background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff',
                color: '#00ffff', fontFamily: "'Courier New',monospace",
                fontSize: 14, fontWeight: 800, letterSpacing: 5, textTransform: 'uppercase',
                cursor: 'pointer', backdropFilter: 'blur(10px)',
                boxShadow: '0 0 30px rgba(0,255,255,0.3), inset 0 0 10px rgba(0,255,255,0.2)',
                transition: 'all 0.3s', animation: 'fadeInUp 1s ease 0.5s both',
                clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(0,255,255,0.25)'; e.target.style.boxShadow = '0 0 50px rgba(0,255,255,0.6)'; e.target.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(0,255,255,0.1)'; e.target.style.boxShadow = '0 0 30px rgba(0,255,255,0.3)'; e.target.style.transform = 'scale(1)'; }}
            >
              ▶ Enter Portfolio
            </button>
          )}
        </div>
      )}

      {/* ── "CLICK PLANETS" HINT ── */}
      {showHint && isInteractive && !selectedProj && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9000, pointerEvents: 'none',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: 30, padding: '10px 24px',
          fontFamily: "'Courier New',monospace", fontSize: 12,
          color: '#00d4ff', letterSpacing: 2,
          animation: 'fadeInUp 0.5s ease, fadeOut 0.5s ease 5s both',
        }}>
          🪐 Click any planet to explore the project
        </div>
      )}

      {/* ── PROFESSIONAL SIDE MENU ── */}
      {isInteractive && (
        <>
          {/* Hamburger Icon (Projects) */}
          <div
            onClick={toggleMenu}
            title="Projects Navigator"
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 10001,
              cursor: 'pointer', padding: '12px',
              background: menuOpen ? 'transparent' : 'rgba(0,212,255,0.15)',
              borderRadius: 8, border: '1px solid #00d4ff',
              backdropFilter: 'blur(12px)', boxShadow: '0 0 20px rgba(0,212,255,0.3)',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {[0, 1, 2].map(n => (
              <div key={n} style={{
                width: 24, height: 2, background: '#00d4ff', borderRadius: 2,
                boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: menuOpen
                  ? (n === 0 ? 'rotate(45deg) translateY(11.5px)' : n === 2 ? 'rotate(-45deg) translateY(-11.5px)' : 'scaleX(0)')
                  : 'none',
                opacity: menuOpen && n === 1 ? 0 : 1,
              }} />
            ))}
          </div>

          <div
            onClick={toPortfolio}
            title="Biometric Profile"
            style={{
              position: 'fixed', top: 84, right: 24, zIndex: 10001,
              cursor: 'pointer', padding: '0',
              background: 'rgba(255, 85, 0, 0.15)',
              borderRadius: '50%', border: '2px solid #ff5500',
              boxShadow: '0 0 20px rgba(255, 85, 0, 0.5), inset 0 0 15px rgba(255, 85, 0, 0.4)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 50, height: 50,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: '#ff5500', fontSize: 24,
              animation: 'firePulse 2s infinite alternate'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 85, 0, 0.3)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 85, 0, 0.8), inset 0 0 20px rgba(255, 85, 0, 0.6)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 85, 0, 0.15)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 85, 0, 0.5), inset 0 0 15px rgba(255, 85, 0, 0.4)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            👤
          </div>

          {/* GitHub Icon */}
          <a
            href="https://github.com/khaled24ao"
            target="_blank" rel="noopener noreferrer"
            title="GitHub Uplink"
            style={{
              position: 'fixed', top: 144, right: 24, zIndex: 10001,
              cursor: 'pointer', padding: '0',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 50, height: 50,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: '#fff', fontSize: 24, textDecoration: 'none'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.6)'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>

          {/* LinkedIn Icon */}
          <a
            href="https://www.linkedin.com/in/khaled-mohamed-7a0242317"
            target="_blank" rel="noopener noreferrer"
            title="LinkedIn Network"
            style={{
              position: 'fixed', top: 204, right: 24, zIndex: 10001,
              cursor: 'pointer', padding: '0',
              background: 'rgba(0, 119, 181, 0.15)',
              borderRadius: '50%', border: '2px solid rgba(0, 119, 181, 0.6)',
              boxShadow: '0 0 15px rgba(0, 119, 181, 0.3)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 50, height: 50,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: '#0077b5', fontSize: 24, textDecoration: 'none'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 119, 181, 0.4)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 119, 181, 0.8)'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#0077b5'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 119, 181, 0.15)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 119, 181, 0.3)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.6)'; e.currentTarget.style.color = '#0077b5'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>

          <SideMenu
            projects={projectsData}
            selectedProj={selectedProj}
            onPlanetSelect={handleMenuPlanet}
            open={menuOpen}
            onClose={() => setMenu(false)}
          />
        </>
      )}

      {/* ── STANDARD PORTFOLIO ── */}
      <AnimatePresence>
        {showPortfolio && (
          <StandardPortfolio key="portfolio" onBack={closePortfolio} />
        )}
      </AnimatePresence>

      {/* ── Cinematic Text Overlay ── */}
      {scene === 'galaxy' && <CinematicText phase={currentPhase} />}

      {/* ── AI Live Logs ── */}
      {scene === 'galaxy' && !selectedProj && <AILiveLogs />}

      {/* ── HUD Info Panel ── */}
      <HUDInfoPanel project={selectedProj} onClose={handleCloseHUD} />

      {/* ── Glitch overlay ── */}
      <GlitchOverlay visible={showGlitch} />

      {/* ── WARP JUMP OVERLAY ── */}
      {warpUrl && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 10000, pointerEvents: 'none', background: '#000'
        }}>
          <Canvas camera={{ position: [0, 0, 0], fov: 110 }}>
            <WarpTunnel active={true} showRedEnd={true} />
            <EffectComposer>
               <ChromaticAberration offset={[0.015, 0.015]} />
            </EffectComposer>
          </Canvas>
        </div>
      )}

      {/* ── GSAP / CSS animations ── */}
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; text-shadow: 0 0 40px #00d4ff; }
          50%      { opacity:0.7; text-shadow: 0 0 80px #00d4ff, 0 0 120px #00d4ff44; }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity:1; } to { opacity:0; }
        }
        @keyframes firePulse {
          0% { box-shadow: 0 0 20px rgba(255, 85, 0, 0.5), inset 0 0 15px rgba(255, 85, 0, 0.4); border-color: #ff5500; }
          100% { box-shadow: 0 0 40px rgba(255, 50, 0, 0.8), inset 0 0 25px rgba(255, 50, 0, 0.6); border-color: #ffaa00; }
        }
      `}</style>
      
      {/* ── GLOBAL AAA OVERLAYS ── */}
      <div className="global-vignette" />
      <div className="global-scanlines" />
    </div>
  );
}