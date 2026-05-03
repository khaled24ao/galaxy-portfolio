import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   GRAVITY FIELD — Visible force shield
   Surrounding the special last planet, pushes
   meteors away with a visible energy bubble.
   ═══════════════════════════════════════════════ */

export function GravityField({ position = [0, 0, 0], radius = 15, visible = true }) {
  const shieldRef = useRef();
  const pulseRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (shieldRef.current) {
      // Rotating shield
      shieldRef.current.rotation.y += 0.005;
      shieldRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      
      // Breathing opacity
      const breath = 0.08 + Math.sin(time * 2) * 0.03;
      shieldRef.current.material.opacity = breath;
    }
    
    if (pulseRef.current) {
      // Expanding pulse wave
      const cycle = (time * 0.5) % 1;
      const pulseScale = 1 + cycle * 0.5;
      pulseRef.current.scale.setScalar(pulseScale);
      pulseRef.current.material.opacity = 0.15 * (1 - cycle);
    }
  });

  if (!visible) return null;

  return (
    <group position={position}>
      {/* 1. Main Energy Shield */}
      <mesh ref={shieldRef}>
        <icosahedronGeometry args={[radius, 2]} />
        <meshBasicMaterial
          color="#00aaff"
          transparent
          opacity={0.08}
          wireframe
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* 2. Expanding Pulse Wave */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#0088ff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* 3. Inner glow */}
      <mesh>
        <sphereGeometry args={[radius * 0.95, 32, 32]} />
        <meshBasicMaterial
          color="#001144"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
