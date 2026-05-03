import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Singularity = ({ scale = 1, isExploding = false }) => {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing effect when exploding
      if (isExploding) {
        const pulseScale = scale * (1 + Math.sin(state.clock.elapsedTime * 10) * 0.1);
        meshRef.current.scale.setScalar(pulseScale);
      } else {
        meshRef.current.scale.setScalar(scale);
      }
      
      // Intense rotation during explosion
      meshRef.current.rotation.y += isExploding ? 0.1 : 0.01;
    }

    if (glowRef.current) {
      glowRef.current.rotation.y -= 0.005;
      glowRef.current.rotation.x += 0.003;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer glow effect */}
      <mesh ref={glowRef} scale={scale * 2}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent={true}
          opacity={0.3}
          emissive={0xffffff}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Core singularity */}
      <mesh ref={meshRef} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={0xffffff}
          emissive={0xffffff}
          emissiveIntensity={2}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh scale={scale * 0.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={0xffffff}
          emissive={0xffffff}
          emissiveIntensity={3}
          transparent={true}
          opacity={1}
        />
      </mesh>

      {/* Energy particles */}
      {isExploding && [...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * scale * 3,
            Math.sin((i / 8) * Math.PI * 2) * scale * 3,
            0
          ]}
          scale={0.2}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color={0xffffff}
            transparent={true}
            opacity={0.8}
            emissive={0xffffff}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Singularity;
