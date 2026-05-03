import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   SUN FORMATION — Builds piece by piece
   
   progress: 0 → 1
   
   0.0 - 0.3:  Scattered particles converge toward center
   0.3 - 0.6:  Particles compress into sphere shape
   0.6 - 0.8:  Surface ignites (shader activates)
   0.8 - 1.0:  Corona rays extend, full sun achieved
   ═══════════════════════════════════════════════════════ */

const SUN_VERT = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SUN_FRAG = `
  uniform float uTime;
  uniform float uIntensity; // 0→1 as sun ignites

  varying vec3 vNormal;
  varying vec3 vPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
          mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
          mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 p = vPosition * 2.0 + vec3(uTime * 0.08, uTime * 0.05, uTime * 0.03);
    float n1 = fbm(p);
    float n2 = fbm(p * 1.5 + vec3(3.1, 1.7, 2.3) + uTime * 0.04);

    float t = n1 * 0.6 + n2 * 0.4;
    vec3 col;
    if      (t > 0.65) col = mix(vec3(1.0, 0.95, 0.6), vec3(1.0), (t - 0.65) / 0.35);
    else if (t > 0.35) col = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.95, 0.6), (t - 0.35) / 0.3);
    else               col = mix(vec3(0.8, 0.2, 0.0), vec3(1.0, 0.5, 0.0), t / 0.35);

    // Granulation
    col += noise(vPosition * 15.0 + uTime * 0.2) * 0.12;

    // Limb darkening
    float rim = dot(vNormal, vec3(0.0, 0.0, 1.0));
    col *= pow(max(rim, 0.0), 0.4) * 0.5 + 0.5;

    col *= uIntensity * 2.0;
    gl_FragColor = vec4(col, uIntensity);
  }
`;

export function SunFormation({ progress = 0 }) {
  const groupRef   = useRef();
  const particlesRef = useRef();
  const coreRef    = useRef();
  const coronaRef  = useRef();
  const glow1Ref   = useRef();
  const glow2Ref   = useRef();
  const lightRef   = useRef();

  const sunRadius = 30;

  // Sun shader uniforms
  const sunUniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uIntensity: { value: 0 },
  }), []);

  // ── Formation Particles ──
  // 15k particles that start scattered and converge into a sphere
  const PARTICLE_COUNT = 15000;
  const { startPositions, targetPositions, pColors } = useMemo(() => {
    const startPositions  = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pColors         = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start: scattered in a large sphere (explosion remnants)
      const theta1 = Math.random() * Math.PI * 2;
      const phi1   = Math.acos(2 * Math.random() - 1);
      const r1     = 200 + Math.random() * 800;

      startPositions[i * 3]     = Math.sin(phi1) * Math.cos(theta1) * r1;
      startPositions[i * 3 + 1] = Math.sin(phi1) * Math.sin(theta1) * r1;
      startPositions[i * 3 + 2] = Math.cos(phi1) * r1;

      // Target: on the sun's surface
      const theta2 = Math.random() * Math.PI * 2;
      const phi2   = Math.acos(2 * Math.random() - 1);
      const r2     = sunRadius * (0.8 + Math.random() * 0.4);

      targetPositions[i * 3]     = Math.sin(phi2) * Math.cos(theta2) * r2;
      targetPositions[i * 3 + 1] = Math.sin(phi2) * Math.sin(theta2) * r2;
      targetPositions[i * 3 + 2] = Math.cos(phi2) * r2;

      // Colors: hot particles (white, yellow, orange)
      const ct = Math.random();
      if (ct < 0.3)      { pColors[i*3]=1;   pColors[i*3+1]=1;    pColors[i*3+2]=0.8; }
      else if (ct < 0.6) { pColors[i*3]=1;   pColors[i*3+1]=0.8;  pColors[i*3+2]=0.3; }
      else               { pColors[i*3]=1;   pColors[i*3+1]=0.5;  pColors[i*3+2]=0.1; }
    }

    return { startPositions, targetPositions, pColors };
  }, [sunRadius]);

  // Current animated positions — INIT WITH START POSITIONS
  const currentPositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    arr.set(startPositions);
    return arr;
  }, [startPositions]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    sunUniforms.uTime.value = t;

    // ── Particle convergence (progress 0→0.7) ──
    const convergence = Math.min(progress / 0.7, 1);
    if (particlesRef.current && convergence < 1) {
      const arr = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        // Lerp from start to target with slight spiral
        const idx = Math.floor(i / 3);
        const spiralOffset = Math.sin(t * 2 + idx * 0.01) * (1 - convergence) * 20;
        arr[i] = startPositions[i] * (1 - convergence) + targetPositions[i] * convergence
               + (i % 3 === 0 ? spiralOffset : i % 3 === 1 ? -spiralOffset * 0.5 : 0);
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;

      // Particle size shrinks as they converge
      particlesRef.current.material.size = 4 * (1 - convergence * 0.6);
      particlesRef.current.material.opacity = Math.max(0, 1 - (progress - 0.5) * 3);
    }

    // ── Sun core ignition (progress 0.3→0.8) ──
    const ignition = Math.max(0, Math.min((progress - 0.3) / 0.5, 1));
    sunUniforms.uIntensity.value = ignition;

    if (coreRef.current) {
      const sc = ignition * sunRadius;
      coreRef.current.scale.setScalar(Math.max(0.01, sc));
      // Pulsing
      if (ignition > 0.5) {
        const pulse = 1 + Math.sin(t * 3) * 0.02 * ignition;
        coreRef.current.scale.multiplyScalar(pulse);
      }
    }

    // ── Corona (progress 0.6→1.0) ──
    const coronaProgress = Math.max(0, Math.min((progress - 0.6) / 0.4, 1));
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(sunRadius * 1.4 * coronaProgress);
      coronaRef.current.material.opacity = coronaProgress * 0.2;
      coronaRef.current.rotation.z -= 0.001;
    }

    // ── Outer glows ──
    if (glow1Ref.current) {
      glow1Ref.current.scale.setScalar(sunRadius * 2 * coronaProgress);
      glow1Ref.current.material.opacity = coronaProgress * 0.12;
    }
    if (glow2Ref.current) {
      glow2Ref.current.scale.setScalar(sunRadius * 5 * coronaProgress);
      glow2Ref.current.material.opacity = coronaProgress * 0.04;
    }

    // ── Light intensity ──
    if (lightRef.current) {
      lightRef.current.intensity = ignition * 800 * sunRadius;
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── Converging Particles ── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={currentPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={PARTICLE_COUNT}
            array={pColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={4}
          vertexColors
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* ── Sun Core (Procedural Plasma Shader) ── */}
      <mesh ref={coreRef} scale={[0.01, 0.01, 0.01]}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          uniforms={sunUniforms}
          vertexShader={SUN_VERT}
          fragmentShader={SUN_FRAG}
          transparent
        />
      </mesh>

      {/* ── Corona ── */}
      <mesh ref={coronaRef} scale={[0.01, 0.01, 0.01]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Inner Glow ── */}
      <mesh ref={glow1Ref} scale={[0.01, 0.01, 0.01]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Outer Glow ── */}
      <mesh ref={glow2Ref} scale={[0.01, 0.01, 0.01]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ff3300"
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Light source ── */}
      <pointLight ref={lightRef} color="#ffccaa" intensity={0} distance={8000} decay={2} />
    </group>
  );
}
