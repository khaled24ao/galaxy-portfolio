import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   SOLAR SHOCKWAVE & DEBRIS
   Massive expanding ring of fire + rocks flying outward
   ═══════════════════════════════════════════════════════ */

export function SolarShockwave() {
  const ringRef1 = useRef();
  const ringRef2 = useRef();
  const debrisRef = useRef();
  const time = useRef(0);

  // Debris data
  const count = 300;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const debrisData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 2
      ).normalize();

      data.push({
        dir,
        speed: 15 + Math.random() * 25,
        rotSpeed: new THREE.Vector3(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2),
        scale: Math.random() * 4 + 1,
        pos: new THREE.Vector3(0, 0, 0),
        rot: new THREE.Euler(0, 0, 0)
      });
    }
    return data;
  }, [count]);

  useFrame((state, delta) => {
    time.current += delta;
    
    // 1. Expand the Shockwave Rings
    if (ringRef1.current) {
      const scale = 1 + (time.current * 800);
      ringRef1.current.scale.setScalar(scale);
      const opacity = Math.max(0, 1 - (time.current / 2.5));
      ringRef1.current.material.opacity = opacity * 0.8;
      ringRef1.current.rotation.x = Math.PI / 2 - 0.1;
      ringRef1.current.rotation.z += delta * 0.5;
    }
    
    if (ringRef2.current) {
      const scale = 1 + (time.current * 720); // slightly slower/smaller
      ringRef2.current.scale.setScalar(scale);
      const opacity = Math.max(0, 1 - (time.current / 2.5));
      ringRef2.current.material.opacity = opacity * 0.4;
      ringRef2.current.rotation.x = Math.PI / 2;
    }

    // 2. Animate Debris Flying Outwards
    if (debrisRef.current) {
      debrisData.forEach((d, i) => {
        d.pos.addScaledVector(d.dir, d.speed);
        d.rot.x += d.rotSpeed.x;
        d.rot.y += d.rotSpeed.y;
        d.rot.z += d.rotSpeed.z;

        dummy.position.copy(d.pos);
        dummy.rotation.copy(d.rot);
        
        const scaleDecay = Math.max(0, 1 - (time.current / 3.5));
        dummy.scale.setScalar(d.scale * scaleDecay);
        
        dummy.updateMatrix();
        debrisRef.current.setMatrixAt(i, dummy.matrix);
      });
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const debrisGeom = useMemo(() => new THREE.DodecahedronGeometry(1, 1), []);
  const debrisMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ff2200', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
  }), []);

  return (
    <group>
      {/* Expanding Fire Ring 1 */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1, 0.05, 16, 100]} />
        <meshBasicMaterial 
          color="#ff4400" 
          transparent 
          opacity={0.8} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
        />
      </mesh>
      
      {/* Inner Energy Wave 2 */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[1, 0.2, 16, 100]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent 
          opacity={0.4}
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
        />
      </mesh>

      {/* Burning Debris (Instanced) */}
      <instancedMesh ref={debrisRef} args={[debrisGeom, debrisMat, count]} />
    </group>
  );
}
