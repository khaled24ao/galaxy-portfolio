import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* Small moon orbiting a planet */
export function PlanetMoon({ planetPosition, moonRadius = 8, orbitRadius = 60, orbitSpeed = 0.4, color = '#aaaaaa' }) {
  const moonRef   = useRef();
  const angleRef  = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!moonRef.current) return;
    angleRef.current += delta * orbitSpeed;
    const a = angleRef.current;
    moonRef.current.position.set(
      planetPosition[0] + Math.cos(a) * orbitRadius,
      planetPosition[1] + Math.sin(a * 0.3) * 8, // slight tilt
      planetPosition[2] + Math.sin(a) * orbitRadius,
    );
    moonRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      {/* Moon body */}
      <mesh ref={moonRef} castShadow>
        <sphereGeometry args={[moonRadius, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Orbit trail (faint ring) */}
      <group position={planetPosition}>
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[orbitRadius - 0.5, orbitRadius + 0.5, 64]} />
          <meshBasicMaterial
            color={color}
            transparent opacity={0.06}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
