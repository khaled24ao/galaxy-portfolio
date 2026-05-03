import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   ULTRA-REALISTIC DEEP SPACE
   
   1. Twinkling Round Stars (Custom Shader with discard)
   2. Volumetric Nebulae (Round soft particles)
   3. Distant Spiral Galaxies
   4. Bright Individual Stars
   ═══════════════════════════════════════════════════════ */

// ── Round star texture (generated once) ──
function createRoundTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.15, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.4, 'rgba(200,220,255,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createNebulaTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.03)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const starTex = createRoundTexture();
const nebulaTex = createNebulaTexture();

// ── Twinkling Star Field ──
function TwinklingStarField({ count = 80000, radius = 48000 }) {
  const geom = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    const phases    = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi   = Math.acos(2 * v - 1);
      const r     = radius * (0.8 + Math.random() * 0.2);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Kelvin Temperature realistic colors
      const t = Math.random();
      if (t < 0.55) { // Blue/White
        colors[i * 3] = 0.6 + Math.random() * 0.4;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1.0;
      } else if (t < 0.8) { // Sun-like Yellow/White
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      } else { // Orange/Red
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.2;
      }

      sizes[i] = Math.random() < 0.98 ? 1.0 + Math.random() * 2.5 : 4.0 + Math.random() * 5.0;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    g.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('phase',    new THREE.BufferAttribute(phases, 1));
    return g;
  }, [count, radius]);

  const matRef = useRef();

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.material.uniforms.time.value = clock.elapsedTime;
    }
  });

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { 
      opacity: { value: 1.0 },
      time: { value: 0 },
      pointTexture: { value: starTex }
    },
    vertexShader: `
      attribute float size;
      attribute float phase;
      varying vec3 vColor;
      varying float vPhase;
      void main() {
        vColor = color;
        vPhase = phase;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * 1.5;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vPhase;
      uniform float opacity;
      uniform float time;
      uniform sampler2D pointTexture;
      void main() {
        // Use round texture
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        if (texColor.a < 0.05) discard;
        
        // Twinkle effect (Scintillation)
        float twinkle = 0.7 + 0.3 * sin(time * 2.0 + vPhase * 10.0);
        
        float alpha = texColor.a * twinkle * opacity;
        gl_FragColor = vec4(vColor * (1.0 + texColor.a * 0.5), alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  }), []);

  return <points geometry={geom} material={mat} ref={matRef} />;
}

// ── Volumetric Nebula Patch (ROUND soft particles) ──
function NebulaPatch({ position, color1, color2, radius = 1500, count = 20000, opacity = 0.45 }) {
  const geom = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.4) * radius;

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
      positions[i * 3 + 2] = r * Math.cos(phi);

      const mix = Math.random();
      colors[i * 3]     = c1.r * mix + c2.r * (1 - mix);
      colors[i * 3 + 1] = c1.g * mix + c2.g * (1 - mix);
      colors[i * 3 + 2] = c1.b * mix + c2.b * (1 - mix);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    return g;
  }, [color1, color2, radius, count]);

  return (
    <points position={position} geometry={geom}>
      <pointsMaterial
        size={80}
        map={nebulaTex}
        vertexColors
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
        alphaTest={0.01}
      />
    </points>
  );
}

// ── Bright individual stars ──
function BrightStars() {
  const geom = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi   = Math.acos(2 * v - 1);
      const r     = 40000 + Math.random() * 5000;

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const type = Math.floor(Math.random() * 4);
      if (type === 0) { colors[i*3]=0.6; colors[i*3+1]=0.7; colors[i*3+2]=1.0; }
      else if (type === 1) { colors[i*3]=1.0; colors[i*3+1]=1.0; colors[i*3+2]=0.9; }
      else if (type === 2) { colors[i*3]=1.0; colors[i*3+1]=0.85; colors[i*3+2]=0.5; }
      else { colors[i*3]=1.0; colors[i*3+1]=0.6; colors[i*3+2]=0.4; }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  return (
    <points geometry={geom}>
      <pointsMaterial
        size={20}
        map={starTex}
        vertexColors
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={false}
        alphaTest={0.01}
      />
    </points>
  );
}

// ── Distant Spiral Galaxy ──
function DistantGalaxy({ position, rotation = [0, 0, 0], color1 = '#8888ff', color2 = '#ffaadd', count = 8000, radius = 2500 }) {
  const geom = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    const arms = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const arm = i % arms;
      const armAngle = (arm / arms) * Math.PI * 2;
      const t = Math.pow(Math.random(), 0.5);
      const r = t * radius;
      const spiralAngle = armAngle + t * Math.PI * 3;
      const scatter = (1 - t * 0.5) * radius * 0.15;

      positions[i * 3]     = Math.cos(spiralAngle) * r + (Math.random() - 0.5) * scatter;
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius * 0.03;
      positions[i * 3 + 2] = Math.sin(spiralAngle) * r + (Math.random() - 0.5) * scatter;

      const mix = Math.pow(t, 0.5);
      colors[i * 3]     = c1.r * (1 - mix) + c2.r * mix + (1 - t) * 0.3;
      colors[i * 3 + 1] = c1.g * (1 - mix) + c2.g * mix + (1 - t) * 0.3;
      colors[i * 3 + 2] = c1.b * (1 - mix) + c2.b * mix + (1 - t) * 0.2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count, radius, color1, color2]);

  return (
    <group position={position} rotation={rotation}>
      <points geometry={geom}>
        <pointsMaterial
          size={20}
          map={nebulaTex}
          vertexColors
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={false}
          alphaTest={0.01}
        />
      </points>
      {/* Bright core */}
      {/* Bright core */}
      <mesh>
        <sphereGeometry args={[radius * 0.08, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff" transparent opacity={0.5}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── Constellations (Connected Stars) ──
function Constellations({ count = 250, radius = 35000, connections = 2 }) {
  const { lineGeom, pointGeom } = useMemo(() => {
    const pts = [];
    const ptPositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi   = Math.acos(2 * v - 1);
      // Push constellations very far away so they look like a distant background
      const r     = radius * (0.85 + Math.random() * 0.15);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pts.push(new THREE.Vector3(x, y, z));
      ptPositions[i*3] = x; ptPositions[i*3+1] = y; ptPositions[i*3+2] = z;
    }
    
    const linePositions = [];
    const lineColors = [];
    const color = new THREE.Color('#ffffff'); // Glowing white lines
    
    for (let i = 0; i < count; i++) {
      const p1 = pts[i];
      const neighbors = pts
        .map((p2, idx) => ({ p2, dist: p1.distanceToSquared(p2), idx }))
        .filter(n => n.idx !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, connections);
        
      for (const n of neighbors) {
        // Drastically reduce max distance to create small, realistic clusters
        if (i < n.idx && n.dist < radius * radius * 0.015) { 
           linePositions.push(p1.x, p1.y, p1.z, n.p2.x, n.p2.y, n.p2.z);
           lineColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }
      }
    }
    
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    lg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lineColors), 3));
    
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(ptPositions, 3));
    return { lineGeom: lg, pointGeom: pg };
  }, [count, radius, connections]);

  const lineMatRef = useRef();
  
  useFrame(({ clock }) => {
    if (lineMatRef.current) {
      // Create a shimmering/glowing effect
      lineMatRef.current.opacity = 0.4 + Math.sin(clock.elapsedTime * 2.0) * 0.25;
    }
  });

  return (
    <group>
      <points geometry={pointGeom}>
        <pointsMaterial size={80} color="#ffffff" map={starTex} transparent opacity={1.0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial ref={lineMatRef} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════
export function SpaceEnvironment() {
  const nebulaRef = useRef();

  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.00005;
    }
  });

  return (
    <group>
      {/* ── Twinkling Star Field ── */}
      <TwinklingStarField count={50000} radius={45000} />

      {/* ── Bright Stars ── */}
      <BrightStars />

      {/* ── Constellations ── */}
      <Constellations count={300} radius={40000} connections={2} />

      {/* ── Distant Galaxies (Left Prominent, Right Distant) ── */}
      <DistantGalaxy
        position={[-18000, 2000, -15000]} // Prominent on the left
        rotation={[-0.3, 0.4, 0.2]}
        color1="#ffffff" color2="#88ccff"
        count={15000} radius={4500}
      />
      <DistantGalaxy
        position={[28000, -8000, -30000]} // Distant right
        rotation={[0.2, -0.6, 0.5]}
        color1="#ffaa66" color2="#ff4422"
        count={5000} radius={2500}
      />

      {/* ── Volumetric Nebulae (Dense Core Matching Image) ── */}
      <group ref={nebulaRef}>
        {/* Deep Space Purple/Blue Core */}
        <NebulaPatch position={[2000, 0, -22000]} color1="#110055" color2="#0044ff" radius={14000} count={35000} opacity={0.65} />
        {/* Lower Left Pink/Magenta Aura */}
        <NebulaPatch position={[-10000, -6000, -20000]} color1="#ff0088" color2="#aa00ff" radius={8000} count={20000} opacity={0.55} />
        {/* Right Side Orange/Red Flame */}
        <NebulaPatch position={[12000, -2000, -20000]} color1="#ff4400" color2="#ffaa00" radius={9000} count={22000} opacity={0.5} />
        {/* Top Center Cyan Bright Patch */}
        <NebulaPatch position={[-2000, 8000, -18000]} color1="#00ffff" color2="#0088ff" radius={7000} count={18000} opacity={0.45} />
      </group>
    </group>
  );
}
