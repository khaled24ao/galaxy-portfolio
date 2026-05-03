import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   COSMIC DUST — Glowing particles orbiting the sun
   Creates the feeling of a living, breathing solar system
   ═══════════════════════════════════════════════════════ */

export function CosmicDust({ count = 3000 }) {
  const ref = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute in a disk around the sun
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 400;
      const height = (Math.random() - 0.5) * 40;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Golden/orange/white dust
      const t = Math.random();
      if (t < 0.3) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.4;
      } else if (t < 0.6) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.2;
      } else {
        colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.9;
      }

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    return { positions, colors, sizes };
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.0003;
      
      // Subtle twinkling
      const arr = ref.current.geometry.attributes.position.array;
      const t = state.clock.elapsedTime;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += Math.sin(t * 2 + i) * 0.01;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={1.2} 
        vertexColors 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
        sizeAttenuation 
      />
    </points>
  );
}
