import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';

import { SpaceEnvironment } from './SpaceEnvironment';
import { CinematicExplosion } from './CinematicExplosion';
import { RealisticSun } from './RealisticSun';
import { ProjectPlanet } from './ProjectPlanet';
import { OrbitalRing } from './OrbitalRing';
import { MeteorSwarm } from './MeteorSwarm';
import { AsteroidBelt } from './AsteroidBelt';
import { CosmicDust } from './CosmicDust';
import { SolarShockwave } from './SolarShockwave';
import { BlackHole } from './BlackHole';
import { audioManager } from '../utils/AudioManager';
import { projectsData } from '../utils/projectsData';

/* ════════════════════════════════════════════════════════
   25-SECOND CINEMATIC INTRO — ALL 7 PHASES
   ════════════════════════════════════════════════════════ */

// Use full projectsData so HUD panel has tech/stats/links
const PLANETS = projectsData;

// Pre-compute orbit data for each planet (Engineered Geometric Design)
const ORBITS = PLANETS.map((_, i) => {
  // 1. Spacing: Starts at 220 (safely outside sun's 135 radius glow) and adds 55 per orbit
  const radius = 220 + i * 55;

  // 2. Inclination: Harmonious geometric wave instead of pure random chaos
  const inclX = Math.sin(i * Math.PI / 4) * 0.06;
  const inclZ = Math.cos(i * Math.PI / 4) * 0.04;

  // 3. Speed: Slower for outer planets (Realistic physics / Kepler's laws)
  const speed = 0.4 / Math.sqrt(radius / 100);

  // 4. Starting Position: Golden Angle (137.5 degrees) for perfect aesthetic distribution
  const startAngle = i * 2.39996;

  return { radius, inclX, inclZ, speed, startAngle };
});

// Planets spawn in deep space for a hyper-speed cinematic entry
const CHAOS_POS = PLANETS.map(() => {
  const dir = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  ).normalize();
  return dir.multiplyScalar(5000 + Math.random() * 3000);
});

function getOrbitPos(orb, angle) {
  const v = new THREE.Vector3(Math.cos(angle) * orb.radius, 0, Math.sin(angle) * orb.radius);
  v.applyEuler(new THREE.Euler(orb.inclX, 0, orb.inclZ, 'XYZ'));
  return v;
}

export function GalaxyScene({ onProjectSelect, selectedProject, onSkipReady, onPhaseChange, selectedIdx, setSelectedIdx }) {
  const { camera } = useThree();
  const ctrlRef = useRef();
  const tlRef = useRef(null);

  const shakeRef = useRef(0);

  const [phase, setPhaseLocal] = useState('void');
  const [showExplosion, setExplosion] = useState(false);
  const [showSun, setShowSun] = useState(false);
  const [sunProgress, setSunProgress] = useState(0);
  const [showPlanets, setShowPlanets] = useState(false);
  const [planetAlpha, setPlanetAlpha] = useState(0);
  const orbitProgress = useRef(0); // 0=chaos, 1=in orbit
  const orbitTime = useRef(0); // Accumulated time for time-lapse effect
  const animStates = useRef({
    sunProgress: 0, planetAlpha: 0, orbitProgress: 0, timeScale: 1,
    binaryDistance: 400, binarySpeed: 1, binaryGlow: 0.1
  });

  const binaryRef1 = useRef(), binaryRef2 = useRef();
  const binaryLightRef1 = useRef(), binaryLightRef2 = useRef();
  const binaryAngle = useRef(0);
  const [showOrbits, setShowOrbits] = useState(false);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  // For cinematic 360° orbit sweep during planet formation
  const cameraOrbit = useRef({ angle: -0.4, radius: 900, height: 300 });

  const [hoveredPlanet, setHovered] = useState(null);

  const planetRefs = useRef([]);
  // Planet positions (animated between chaos and orbit)
  const planetPositions = useRef(CHAOS_POS.map(p => p.clone()));

  // Flash overlay
  const flashRef = useRef({ color: '#ffffff', opacity: 0 });
  const [, forceFlash] = useState(0);
  const flash = (c, o) => { flashRef.current = { color: c, opacity: o }; forceFlash(v => v + 1); };

  const setPhase = (p) => { setPhaseLocal(p); onPhaseChange?.(p); };

  /* ═══════ SKIP INTRO (goes to title screen, music keeps playing) ═══════ */
  useEffect(() => {
    const skipHandler = () => {
      if (tlRef.current) tlRef.current.seek(30);
      // Force end-states
      orbitProgress.current = 1;
      setPlanetAlpha(1);
      setSunProgress(1);
      animStates.current.planetAlpha = 1;
      animStates.current.orbitProgress = 1;
      animStates.current.sunProgress = 1;
      flashRef.current.opacity = 0;
      forceFlash(v => v + 1);
      setShowPlanets(true);
      setShowOrbits(true);
      setShowSun(true);
      setExplosion(false);
      setShowTitle(true);
      // Stop all intro noise (pulsars, risers) and jump straight to epic title music
      audioManager.stopAll();
      audioManager.playSound('symphonic-war', { volume: 0.8, loop: true });
    };

    // User clicks "Enter Portfolio" → transition to interactive + stop epic music
    const enterHandler = () => {
      setPhase('interactive');
      setSequenceDone(true);
    };

    window.addEventListener('skipIntro', skipHandler);
    window.addEventListener('enterPortfolio', enterHandler);
    return () => {
      window.removeEventListener('skipIntro', skipHandler);
      window.removeEventListener('enterPortfolio', enterHandler);
    };
  }, []);

  /* ═══════ ZOOM TO PLANET ═══════ */
  
  // Easter Egg Refs
  const sunGroupRef = useRef();
  const supernovaOffset = useRef({ push: 0, scale: 1 });
  const [isSupernova, setIsSupernova] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      const proj = e.detail;
      const idx = PLANETS.findIndex(p => p.id === proj.id);
      if (idx >= 0) {
        // Just set the index. useFrame will handle the smooth lerp and lock!
        // This prevents GSAP and useFrame from fighting each other.
        setSelectedIdx(idx);
      }
    };
    const resetHandler = () => {
      setSelectedIdx(null);
      gsap.to(camera.position, { x: 0, y: 350, z: 900, duration: 1.5, ease: 'power2.inOut' });
      if (ctrlRef.current) {
        gsap.to(ctrlRef.current.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power2.inOut' });
      }
    };
    window.addEventListener('zoomToPlanet', handler);
    window.addEventListener('resetCamera', resetHandler);
    return () => { window.removeEventListener('zoomToPlanet', handler); window.removeEventListener('resetCamera', resetHandler); };
  }, [camera]);

  /* ═══════════════ MAIN GSAP TIMELINE ═══════════════ */
  useEffect(() => {
    camera.position.set(0, 0, 500);
    camera.fov = 50;
    camera.updateProjectionMatrix();

    audioManager.init();

    const tl = gsap.timeline();
    tlRef.current = tl;

    // ── PHASE 1 (0-10s): BINARY STARS INSPIRAL (NEUTRON STAR MERGER) ──
    tl.call(() => { 
      setPhase('void');
      onSkipReady?.(true); 
      audioManager.playEnergyRiser(10); // Starts right when scene loads
      audioManager.playBinaryPulsar(10); // Deep pulsating frequency for the merging stars
    }, [], 0);

    // Camera slowly pushes in during the long dance
    tl.to(camera.position, { z: 700, duration: 10, ease: 'power1.inOut' }, 0);

    // Stars get closer until collision at Distance = 0 (over 10 seconds)
    tl.to(animStates.current, { binaryDistance: 0, duration: 10, ease: 'power2.in' }, 0);
    tl.to(animStates.current, { binarySpeed: 80, duration: 10, ease: 'expo.in' }, 0);
    tl.to(animStates.current, { binaryGlow: 50, duration: 10, ease: 'expo.in' }, 0);

    // Trigger boom exactly with the visual flash/impact
    tl.call(() => {
      audioManager.playHeavyExplosion();
    }, [], 9.9);

    // ── PHASE 2 (10-13s): EXPLOSION & SHOCKWAVE ──
    tl.call(() => {
      setPhase('big_bang');
      setExplosion(true);
      shakeRef.current = 150;
      audioManager.playWhoosh(2); // Fast whoosh as camera flies back
      window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'WARNING: Massive Energy Spike Detected!', type: 'warn' } }));
    }, [], 10);
    tl.to(camera.position, { z: 4000, y: 150, x: 200, duration: 3.5, ease: 'expo.out' }, 10);
    tl.to(shakeRef, { current: 5, duration: 3.5, ease: 'power2.out' }, 10);

    // Start epic music right after the visual explosion
    tl.call(() => {
      audioManager.playSound('symphonic-war', { volume: 0.8, loop: true });
    }, [], 10.5);

    // ── PHASE 3 (13-19s): SUN FORMS — Camera arcs close to the newborn star ──
    tl.call(() => {
      setPhase('sun_forming');
      setShowSun(true);
      setExplosion(false);
      shakeRef.current = 0.5;
      audioManager.playDeepRumble(5); // Sun formation rumble
      audioManager.playWhoosh(0.5); // Slow whoosh for camera arc
      window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'Core Stabilized. Central Star forming...', type: 'sys' } }));
    }, [], 13);
    tl.to(animStates.current, { sunProgress: 1, duration: 5.5, ease: 'power2.inOut', onUpdate: () => setSunProgress(animStates.current.sunProgress) }, 13);
    tl.to(shakeRef, { current: 0, duration: 2 }, 13);

    cameraOrbit.current = { angle: -0.4, radius: 900, height: 300 };
    tl.to(camera.position, { 
      x: 400, y: 80, z: 600, 
      duration: 2.5, ease: 'power3.out',
      onUpdate: () => { if(ctrlRef.current) ctrlRef.current.target.set(0,0,0); }
    }, 13);
    tl.to(camera.position, { 
      x: 150, y: 280, z: 800, 
      duration: 4, ease: 'power2.inOut',
      onUpdate: () => { if(ctrlRef.current) ctrlRef.current.target.set(0,0,0); }
    }, 15.5);
    tl.to(camera, { fov: 70, duration: 6, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() }, 13);

    // ── PHASE 4 (19-25s): PLANETS APPEAR — 360° Cinematic Orbit Sweep ──
    tl.call(() => {
      setPhase('orbit_form');
      setShowPlanets(true);
      audioManager.playWhoosh(1.5); // Camera sweep whoosh
      window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'Time-Lapse engaged. Generating 14 planetary nodes.', type: 'sys' } }));
      cameraOrbit.current = { angle: Math.PI * 0.1, radius: 750, height: 200 };
    }, [], 19);

    // Time-lapse effect
    tl.to(animStates.current, { timeScale: 300, duration: 1.5, ease: 'power2.in' }, 19);
    tl.to(animStates.current, { timeScale: 1, duration: 2.5, ease: 'power3.out' }, 20.5);
    tl.to(animStates.current, { planetAlpha: 1, duration: 0.8, ease: 'power2.out', onUpdate: () => setPlanetAlpha(animStates.current.planetAlpha) }, 19);
    tl.to(animStates.current, { orbitProgress: 2.0, duration: 6, ease: 'linear', onUpdate: () => { orbitProgress.current = animStates.current.orbitProgress; } }, 19.0);
    tl.to(animStates.current, { sunProgress: 1.15, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1, onUpdate: () => setSunProgress(animStates.current.sunProgress) }, 19.3);
    tl.call(() => { setShowOrbits(true); }, [], 20.5);

    // 360° sweep: animate cameraOrbit.angle from start → start+2π (full circle)
    // Camera x = cos(angle)*radius, z = sin(angle)*radius
    tl.to(cameraOrbit.current, {
      angle: Math.PI * 0.1 + Math.PI * 2.0, // Full 360° sweep
      radius: 700,
      height: 180,
      duration: 6,
      ease: 'power1.inOut',
      onUpdate: () => {
        const { angle, radius, height } = cameraOrbit.current;
        camera.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        if (ctrlRef.current) {
          ctrlRef.current.target.set(0, 0, 0);
          ctrlRef.current.update();
        }
      }
    }, 19);
    tl.to(camera, { fov: 50, duration: 4, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() }, 20);

    // ── PHASE 5 (25-28s): MAJESTIC PULL-BACK REVEAL ──
    tl.call(() => { setPhase('camera_orbit'); audioManager.playWhoosh(0.7); }, [], 25);
    tl.to(cameraOrbit.current, {
      radius: 1100,
      height: 500,
      duration: 3,
      ease: 'power3.inOut',
      onUpdate: () => {
        const { angle, radius, height } = cameraOrbit.current;
        camera.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        if (ctrlRef.current) {
          ctrlRef.current.target.set(0, 0, 0);
          ctrlRef.current.update();
        }
      }
    }, 25);
    tl.to(camera, { fov: 60, duration: 3, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() }, 25);

    // ── PHASE 6 (28-31s): FINAL REVEAL SHOT — settle into standard position ──
    tl.call(() => {
      setPhase('reveal');
      window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'System Equilibrium reached. Ready for interaction.', type: 'success' } }));
    }, [], 28);
    tl.to(camera.position, { x: 0, y: 350, z: 900, duration: 2.5, ease: 'power2.inOut' }, 28);
    tl.to(camera, { fov: 60, duration: 2.5, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() }, 28);

    // ── PHASE 7 (30s+): TITLE + WAIT FOR USER ──
    tl.call(() => {
      setPhase('title');
      setShowTitle(true);
      audioManager.playTitleReveal(); // Epic chord for title
      orbitProgress.current = 1;
      setPlanetAlpha(1);
      setSunProgress(1);
      animStates.current.planetAlpha = 1;
      animStates.current.orbitProgress = 1;
      animStates.current.sunProgress = 1;
      flashRef.current.opacity = 0;
      forceFlash(v => v + 1);
      setShowPlanets(true);
      setShowOrbits(true);
      setShowSun(true);
      // Music keeps playing! User must click to enter.
      onSkipReady?.(false);
    }, [], 30);
    // NO auto-transition to 'interactive'! User clicks "Enter Portfolio" to proceed.

    return () => { tl.kill(); audioManager.stopAll(); };
  }, []); // eslint-disable-line

  // ── SUPERNOVA EASTER EGG (Triggered on Sun Double Click) ──
  const triggerSupernova = (e) => {
    e.stopPropagation();
    if (isSupernova) return;
    
    setIsSupernova(true);
    window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'CRITICAL ERROR: SUPERNOVA EVENT DETECTED!', type: 'warn' } }));
    audioManager.playHeavyExplosion(); // Reuse heavy impact
    window.dispatchEvent(new CustomEvent('trigger_glitch', { detail: { duration: 3000 } }));

    // Visual Explosion & Flash
    setExplosion(true);
    flash('#ffffff', 1);

    const stl = gsap.timeline();
    shakeRef.current = 400; // Even more violent shake

    // Expand sun and push planets
    stl.to(supernovaOffset.current, {
      push: 6000, // Push further
      scale: 0.0,  // Hide planets completely
      duration: 3,
      ease: 'expo.in'
    }, 0);
    
    // Fade out the flash
    stl.to(flashRef.current, { opacity: 0, duration: 2, onUpdate: () => forceFlash(v => v + 1) }, 0.5);

    // Stop shaking
    stl.to(shakeRef, { current: 5, duration: 1 }, 3);
    
    // Hide explosion particles after some time
    stl.call(() => setExplosion(false), [], 3.5);

    // Time Reverse
    stl.call(() => {
      window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'INITIATING TEMPORAL REVERSAL...', type: 'sys' } }));
      window.dispatchEvent(new CustomEvent('trigger_glitch', { detail: { duration: 1500 } }));
      audioManager.playSound('tech-beep'); 
    }, [], 6.5);

    stl.to(supernovaOffset.current, {
      push: 0,
      scale: 1,
      duration: 4,
      ease: 'elastic.out(1, 0.4)'
    }, 7);

    stl.call(() => {
      setIsSupernova(false);
      shakeRef.current = 0;
      window.dispatchEvent(new CustomEvent('ai_log', { detail: { text: 'SYSTEM RESTORED FROM TEMPORAL BACKUP.', type: 'success' } }));
    }, [], 11);
  };

  /* ═══════════════ FRAME LOOP ═══════════════ */
  const prevEasedProg = useRef(new Array(PLANETS.length).fill(0));

  useFrame((state, delta) => {
    // Camera shake
    if (shakeRef.current > 0.05) {
      camera.position.x += (Math.random() - 0.5) * shakeRef.current * 0.5;
      camera.position.y += (Math.random() - 0.5) * shakeRef.current * 0.3;
    }

    // During cinematic: force camera to always look at sun (0,0,0)
    const isCinematic = phase !== 'interactive';
    if (isCinematic && selectedIdx === null) {
      camera.lookAt(0, 0, 0);
    }

    // Binary Stars Inspiral Logic
    if (phase === 'void' && binaryRef1.current && binaryRef2.current) {
      const dist = animStates.current.binaryDistance;
      binaryAngle.current += animStates.current.binarySpeed * 0.02;
      const angle = binaryAngle.current;

      binaryRef1.current.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      binaryRef2.current.position.set(Math.cos(angle + Math.PI) * dist, 0, Math.sin(angle + Math.PI) * dist);

      const glow = animStates.current.binaryGlow;
      const scale = 5 + glow * 1.5;
      binaryRef1.current.scale.setScalar(scale);
      binaryRef2.current.scale.setScalar(scale);

      if (binaryLightRef1.current && binaryLightRef2.current) {
        // Massive light intensity (Physics-based)
        binaryLightRef1.current.intensity = glow * 1000000;
        binaryLightRef2.current.intensity = glow * 1000000;
      }
    }

    // Update planet positions (Harmonic Staggered Arrival)
    const globalProg = orbitProgress.current;
    
    // Custom time accumulation for Time-Lapse effect
    // Pause the orbiting if a planet is selected to allow for a cinematic camera lock
    orbitTime.current += delta * (selectedIdx !== null ? 0.0 : animStates.current.timeScale);

    for (let i = 0; i < PLANETS.length; i++) {
      // Each planet has a delayed progress based on its index
      // inner planets lock first, outer planets later
      const delay = i * 0.05;
      const localProg = Math.min(1, Math.max(0, (globalProg - delay) * 1.5));

      // Use elastic easing for the local progress to give that "snap"
      const easedProg = localProg === 1 ? 1 : 1 - Math.pow(2, -10 * localProg) * Math.sin((localProg * 10 - 0.75) * ((2 * Math.PI) / 3));

      const orb = ORBITS[i];
      const angle = orb.startAngle + orbitTime.current * orb.speed;
      const orbPos = getOrbitPos(orb, angle);
      const pos = planetPositions.current[i];

      pos.lerpVectors(CHAOS_POS[i], orbPos, easedProg);

      if (planetRefs.current[i]) {
        // Apply Supernova push effect
        const sn = supernovaOffset.current;
        if (sn.push > 0) {
           const dir = pos.clone().normalize();
           pos.addScaledVector(dir, sn.push * (1 + i * 0.1)); // push outer planets even further
        }

        planetRefs.current[i].position.copy(pos);
        const baseSize = (PLANETS[i].size || 1);
        
        // Dramatic impact bounce when planet snaps into orbit (easedProg reaches 1)
        const prev = prevEasedProg.current[i];
        let displayScale = baseSize * (0.5 + easedProg * 0.5) * sn.scale;
        if (easedProg > 0.97 && prev < 0.97) {
          // Snap moment — brief scale pop
          displayScale *= 1.6;
          audioManager.playUI('scan');
        } else if (easedProg > 0.97) {
          displayScale = baseSize * sn.scale; // stable
        }
        prevEasedProg.current[i] = easedProg;
        planetRefs.current[i].scale.setScalar(displayScale);
      }
    }

    // Scale sun up immensely during supernova
    if (sunGroupRef.current) {
      const snScale = 1 + (supernovaOffset.current.push / 300);
      sunGroupRef.current.scale.setScalar(snScale);
    }

    // Camera Lock on Selected Planet (safe distance, never inside)
    if (selectedIdx !== null && ctrlRef.current) {
      const p = PLANETS[selectedIdx];
      const targetPos = planetPositions.current[selectedIdx];
      if (targetPos) {
        // Actual visual radius = size * size * 8
        const visualRadius = (p.size || 1) * (p.size || 1) * 8;
        const dist = visualRadius * 3.0; // Slightly closer

        // Dynamic cinematic offset
        const offset = new THREE.Vector3(dist * 1.2, dist * 0.4, dist * 0.8);
        const desiredPos = targetPos.clone().add(offset);

        // Smoothly and aggressively follow the planet
        camera.position.lerp(desiredPos, 0.08);
        ctrlRef.current.target.lerp(targetPos, 0.08);
        ctrlRef.current.update();
      }
    }
  });

  const fl = flashRef.current;

  return (
    <>
      <color attach="background" args={['#000008']} />

      <ambientLight intensity={0.05} />

      {/* SPACE ENVIRONMENT (Hidden during binary inspiral — pure darkness) */}
      {phase !== 'void' && <SpaceEnvironment />}

      {/* BINARY STARS INSPIRAL (Phase 1) — ULTRA REALISTIC */}
      {phase === 'void' && (
        <group>
          {/* ═══ STAR 1 (Blue Neutron Star) ═══ */}
          <mesh ref={binaryRef1}>
            {/* Inner Core — white hot */}
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial color="#ffffff" />

            {/* Inner Corona — cyan plasma */}
            <mesh scale={[2.5, 2.5, 2.5]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="#44ccff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* Outer Corona — diffuse blue */}
            <mesh scale={[5, 5, 5]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="#0066ff" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* Volumetric Halo — very large faint glow */}
            <mesh scale={[12, 12, 12]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#0044aa" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
            </mesh>

            {/* Accretion Disk — tilted ring of plasma */}
            <mesh rotation={[Math.PI / 2.5, 0, 0]}>
              <torusGeometry args={[6, 1.5, 16, 100]} />
              <meshBasicMaterial color="#00bbff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* Inner Accretion Ring */}
            <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
              <torusGeometry args={[3, 0.3, 16, 100]} />
              <meshBasicMaterial color="#88ddff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>

            {/* Gravitational Lensing Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[8, 9, 64]} />
              <meshBasicMaterial color="#0088ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>

            <pointLight ref={binaryLightRef1} color="#00aaff" distance={10000} decay={1.5} />
          </mesh>

          {/* ═══ STAR 2 (Orange/Yellow Star) ═══ */}
          <mesh ref={binaryRef2}>
            {/* Inner Core */}
            <sphereGeometry args={[1.1, 64, 64]} />
            <meshBasicMaterial color="#ffffff" />
            
            {/* Inner Corona */}
            <mesh scale={[2.4, 2.4, 2.4]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* Outer Corona */}
            <mesh scale={[4.8, 4.8, 4.8]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="#ff5500" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* Volumetric Halo */}
            <mesh scale={[11, 11, 11]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#aa2200" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
            </mesh>

            {/* Accretion Disk — tilted ring of plasma */}
            <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
              <torusGeometry args={[5.5, 1.2, 16, 100]} />
              <meshBasicMaterial color="#ff8800" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>

            <pointLight ref={binaryLightRef2} color="#ffaa00" distance={10000} decay={1.5} />
          </mesh>
          {/* ═══ GRAVITATIONAL WAVE RIPPLES ═══ */}
          {[1, 2, 3].map(r => (
            <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[200 * r, 200 * r + 5, 128]} />
              <meshBasicMaterial color="#4422ff" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {showExplosion && <CinematicExplosion />}

      {/* SOLAR SHOCKWAVE & DEBRIS FLYTHROUGH */}
      {(phase === 'big_bang' || phase === 'sun_forming') && <SolarShockwave />}

      <group ref={sunGroupRef} onDoubleClick={triggerSupernova}>
        {showSun && <RealisticSun formationPhase={sunProgress} scale={30} />}
        {/* Invisible Hitbox for reliable double clicks */}
        <mesh>
          <sphereGeometry args={[50, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* METEOR SWARM — visible during binary inspiral for atmosphere */}
      {phase === 'void' && <MeteorSwarm />}

      {/* COSMIC DUST — orbiting sun particles */}
      {showSun && <CosmicDust count={3000} />}

      {/* 14 PLANETS */}
      {PLANETS.map((p, i) => {
        const pos = planetPositions.current[i];
        return (
          <group ref={el => planetRefs.current[i] = el} key={p.id} position={[pos.x, pos.y, pos.z]}>
            <ProjectPlanet
              project={p}
              position={[0, 0, 0]}
              index={i}
              isHovered={hoveredPlanet === p.id}
              isSelected={selectedProject?.id === p.id}
              onClick={() => onProjectSelect?.(p)}
              onHover={(h) => setHovered(h ? p.id : null)}
              scale={8}
              alpha={planetAlpha}
            />
          </group>
        );
      })}

      {/* ASTEROID BELT — between inner and outer planets */}
      {showPlanets && <AsteroidBelt innerRadius={470} outerRadius={530} count={800} />}

      {/* ORBIT RINGS */}
      {ORBITS.map((orb, i) => (
        <group key={i} rotation={[orb.inclX, 0, orb.inclZ]}>
          <OrbitalRing radius={orb.radius} color={PLANETS[i].color} opacity={0.1 * planetAlpha} />
        </group>
      ))}



      <OrbitControls
        ref={ctrlRef}
        enabled={phase === 'interactive'}
        enablePan enableZoom enableRotate
        autoRotate={phase === 'interactive' && selectedIdx === null}
        autoRotateSpeed={0.15}
        minDistance={10}
        maxDistance={5000}
        enableDamping
        dampingFactor={0.06}
      />

      <ambientLight intensity={0.03} />

      {/* EPIC BACKGROUND SET PIECE: 3D INTERSTELLAR BLACK HOLE */}
      {phase !== 'void' && (
        <BlackHole position={[0, 3000, -50000]} scale={1400} visible={true} />
      )}

      {/* Cinematic Post-Processing */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.85}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.7} />
        <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0005)} />
      </EffectComposer>
    </>
  );
}