import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   WARP TUNNEL — Inside the Black Hole
   - 2000 speed lines rushing at camera
   - 800 debris particles
   - Screen-edge chromatic blur rings
   - Red glow portal at end
   ═══════════════════════════════════════════════ */

export function WarpTunnel({ active = false, showRedEnd = false }) {
  const linesRef  = useRef();
  const debrisRef = useRef();
  const ringRef   = useRef();

  const LINE_COUNT    = 2000;
  const DEBRIS_COUNT  = 800;

  const lineData = useMemo(() => {
    const pos    = new Float32Array(LINE_COUNT * 6);
    const colors = new Float32Array(LINE_COUNT * 6);
    for (let i = 0; i < LINE_COUNT; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 120;
      const z      = Math.random() * 600 - 300;
      const len    = 30 + Math.random() * 80;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x; pos[i * 6 + 4] = y; pos[i * 6 + 5] = z - len;
      // Quantum Neon Cyberpunk Colors
      const randColor = Math.random();
      if (randColor < 0.33) {
         // Neon Cyan
         colors[i * 6] = 0.0; colors[i * 6 + 1] = 0.8; colors[i * 6 + 2] = 1.0;
      } else if (randColor < 0.66) {
         // Neon Pink
         colors[i * 6] = 1.0; colors[i * 6 + 1] = 0.0; colors[i * 6 + 2] = 0.8;
      } else {
         // Deep Purple
         colors[i * 6] = 0.6; colors[i * 6 + 1] = 0.0; colors[i * 6 + 2] = 1.0;
      }
      colors[i * 6 + 3] = colors[i * 6];
      colors[i * 6 + 4] = colors[i * 6 + 1];
      colors[i * 6 + 5] = colors[i * 6 + 2];
    }
    return { pos, colors };
  }, []);

  const debrisData = useMemo(() => {
    const pos = new Float32Array(DEBRIS_COUNT * 3);
    for (let i = 0; i < DEBRIS_COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 50;
      pos[i * 3]     = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = Math.random() * 400 - 200;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!active) return;
    const speed = 35; // INSANE QUANTUM SPEED

    // Speed lines rush toward camera
    if (linesRef.current) {
      const arr = linesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < LINE_COUNT; i++) {
        arr[i * 6 + 2] -= speed;
        arr[i * 6 + 5] -= speed;
        if (arr[i * 6 + 2] < -350) {
          arr[i * 6 + 2] += 700;
          arr[i * 6 + 5] += 700;
        }
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Debris hits camera
    if (debrisRef.current) {
      const arr = debrisRef.current.geometry.attributes.position.array;
      for (let i = 0; i < DEBRIS_COUNT; i++) {
        arr[i * 3 + 2] -= speed * 0.6;
        if (arr[i * 3 + 2] < -200) arr[i * 3 + 2] = 200;
      }
      debrisRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Pulse the tunnel rings faster
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.06;
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Speed lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={LINE_COUNT * 2} array={lineData.pos}    itemSize={3} />
          <bufferAttribute attach="attributes-color"    count={LINE_COUNT * 2} array={lineData.colors} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Debris particles */}
      <points ref={debrisRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={DEBRIS_COUNT} array={debrisData} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={2} color="#aaddff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      {/* Tunnel wall */}
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[130, 130, 700, 32, 1, true]} />
        <meshBasicMaterial color="#050010" transparent opacity={0.4} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Rotating rings on walls */}
      <group ref={ringRef}>
        {[50, 120, 200, 300].map((z, i) => (
          <mesh key={i} position={[0, 0, z]} rotation-x={Math.PI / 2}>
            <ringGeometry args={[125, 132, 64]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#ff00ff" : "#00ffff"} transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* Ambient blue light */}
      <pointLight color="#2244ff" intensity={800} distance={400} decay={2} />

      {/* Red portal at end */}
      {showRedEnd && (
        <group position={[0, 0, 280]}>
          <mesh>
            <sphereGeometry args={[60, 32, 32]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh scale={[1.5, 1.5, 1.5]}>
            <sphereGeometry args={[60, 32, 32]} />
            <meshBasicMaterial color="#ff3300" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <pointLight color="#ff2200" intensity={5000} distance={600} decay={2} />
        </group>
      )}
    </group>
  );
}
