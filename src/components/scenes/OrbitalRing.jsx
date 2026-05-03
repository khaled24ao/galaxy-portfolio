import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   FORMING ORBIT — Animated ring that draws itself
   from 0% to 100%, used during orbit formation phase.
   progress: 0 = nothing, 1 = full circle
   ═══════════════════════════════════════════════ */

export function FormingOrbit({ radius, color = '#4466ff', progress = 0, opacity = 0.6 }) {
  const lineRef = useRef();

  // Build arc geometry based on progress
  const geometry = useMemo(() => {
    const segments = 256;
    const points = [];
    const count = Math.max(2, Math.floor(segments * progress));

    for (let i = 0; i <= count; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius, progress]);

  // Leading particle — bright dot at the tip of the forming line
  const tipPosition = useMemo(() => {
    const angle = progress * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
  }, [radius, progress]);

  return (
    <group>
      {/* The forming arc */}
      <line geometry={geometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {/* Bright tip particle */}
      {progress > 0 && progress < 1 && (
        <mesh position={tipPosition}>
          <sphereGeometry args={[2, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Glow trail around tip */}
      {progress > 0 && progress < 1 && (
        <mesh position={tipPosition}>
          <sphereGeometry args={[6, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   COMPLETED ORBIT RING — Static full ring
   ═══════════════════════════════════════════════ */
export function OrbitalRing({ radius, color = '#4466ff', opacity = 0.15 }) {
  return (
    <group rotation-x={Math.PI / 2}>
      <mesh>
        <ringGeometry args={[radius - 0.4, radius + 0.4, 256]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Subtle outer glow */}
      <mesh>
        <ringGeometry args={[radius - 2, radius + 2, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.2}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
