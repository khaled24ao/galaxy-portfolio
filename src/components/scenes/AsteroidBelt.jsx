import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* Asteroid Belt — ring of rocks between planet 4 and 5 */
export function AsteroidBelt({ innerRadius = 450, outerRadius = 530, count = 2000 }) {
  const meshRef = useRef();

  const { positions, rotations, scales } = useMemo(() => {
    const pos  = new Float32Array(count * 3);
    const rots = new Float32Array(count * 3);
    const sc   = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const r      = innerRadius + Math.random() * (outerRadius - innerRadius);
      const height = (Math.random() - 0.5) * 18;

      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      rots[i * 3]     = Math.random() * Math.PI * 2;
      rots[i * 3 + 1] = Math.random() * Math.PI * 2;
      rots[i * 3 + 2] = Math.random() * Math.PI * 2;

      sc[i] = 0.8 + Math.random() * 3.5;
    }
    return { positions: pos, rotations: rots, scales: sc };
  }, [innerRadius, outerRadius, count]);

  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 0); // low-poly rock
    return g;
  }, []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#666655',
    roughness: 0.95,
    metalness: 0.05,
  }), []);

  // Use InstancedMesh for performance
  const instancedRef = useRef();

  useMemo(() => {
    // Will be set after mount
  }, []);

  useFrame((state) => {
    if (!instancedRef.current) return;
    const t = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      // Slowly orbit around Y axis
      const angle = Math.atan2(z, x) + t * 0.008;
      const r     = Math.sqrt(x * x + z * z);

      dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      dummy.rotation.set(
        rotations[i * 3]     + t * 0.02,
        rotations[i * 3 + 1] + t * 0.015,
        rotations[i * 3 + 2] + t * 0.01,
      );
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
    }
    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedRef} args={[geometry, material, count]} castShadow>
    </instancedMesh>
  );
}
