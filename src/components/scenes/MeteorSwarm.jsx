import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────
   METEOR SWARM — High performance InstancedMesh system
   with collision flashes and debris particles
   ───────────────────────────────────────────────────── */

const EXPLOSION_LIFETIME = 60; // frames

export function MeteorSwarm({ count = 200, speed = 2, spread = 200 }) {
  const meshRef = useRef();
  const flashRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const flashDummy = useMemo(() => new THREE.Object3D(), []);

  const meteors = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      // Random direction vector for each meteor
      const dirX = (Math.random() - 0.5) * 2;
      const dirY = (Math.random() - 0.5) * 0.5;
      const dirZ = -1 - Math.random(); // Mostly towards camera

      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          Math.random() * spread + 50
        ),
        direction: new THREE.Vector3(dirX, dirY, dirZ).normalize(),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: Math.random() * 0.8 + 0.1,
        speed: Math.random() * speed + speed * 0.3,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
        // Slight color variation via emissive
        heat: Math.random(), // 0 = cold grey, 1 = hot orange
      });
    }
    return data;
  }, [count, speed, spread]);

  // Explosions tracking
  const explosions = useRef([]);
  const maxExplosions = 5;

  useFrame(() => {
    if (!meshRef.current) return;

    // Check for collisions between nearby meteors
    for (let i = 0; i < count - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 5, count); j++) {
        const dist = meteors[i].position.distanceTo(meteors[j].position);
        if (dist < 2 && explosions.current.length < maxExplosions) {
          // Create explosion at midpoint
          const midpoint = meteors[i].position.clone().add(meteors[j].position).multiplyScalar(0.5);
          explosions.current.push({
            position: midpoint.clone(),
            life: EXPLOSION_LIFETIME,
            scale: Math.random() * 3 + 1,
          });
          // Reset these meteors far away
          meteors[i].position.set((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, spread);
          meteors[j].position.set((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, spread);
        }
      }
    }

    // Update meteors
    meteors.forEach((m, i) => {
      m.position.addScaledVector(m.direction, m.speed);
      m.rotation.x += m.rotSpeed.x;
      m.rotation.y += m.rotSpeed.y;
      m.rotation.z += m.rotSpeed.z;

      // Reset if too far past camera
      if (m.position.z < -100 || m.position.length() > spread * 1.5) {
        m.position.set(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          spread * 0.5 + Math.random() * spread * 0.5
        );
      }

      dummy.position.copy(m.position);
      dummy.rotation.copy(m.rotation);
      dummy.scale.setScalar(m.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Update explosion flashes
    if (flashRef.current) {
      explosions.current = explosions.current.filter(e => e.life > 0);
      explosions.current.forEach((exp, i) => {
        exp.life--;
        const progress = exp.life / EXPLOSION_LIFETIME;
        flashDummy.position.copy(exp.position);
        flashDummy.scale.setScalar(exp.scale * (1 - progress) * 3);
        flashDummy.updateMatrix();
        flashRef.current.setMatrixAt(i, flashDummy.matrix);
      });
      // Hide unused flash slots
      for (let i = explosions.current.length; i < maxExplosions; i++) {
        flashDummy.position.set(0, 0, 9999);
        flashDummy.scale.setScalar(0);
        flashDummy.updateMatrix();
        flashRef.current.setMatrixAt(i, flashDummy.matrix);
      }
      flashRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Meteor rocks */}
      <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#665544"
          roughness={0.9}
          metalness={0.1}
          emissive="#331100"
          emissiveIntensity={0.3}
        />
      </instancedMesh>

      {/* Explosion flashes */}
      <instancedMesh ref={flashRef} args={[null, null, maxExplosions]} frustumCulled={false}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ffaa44"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
