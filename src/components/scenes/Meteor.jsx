// src/components/scenes/Meteor.jsx
import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Trail, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// مكون النيزك المنفرد بكل تفاصيله
function Meteor({ position, speed, size, color, noise }) {
  const meshRef = useRef();
  const trailRef = useRef();
  const [exploded, setExploded] = useState(false);

  // حساب المسار العشوائي لكل نيزك
  const randomRotation = useMemo(() => [
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  ], []);

  useFrame((state, delta) => {
    if (meshRef.current && !exploded) {
      // 1. حركة النيزك في الفضاء (Linear Motion + Sine Wave)
      meshRef.current.position.x += speed * delta;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * noise) * 0.02;

      // 2. دوران النيزك حول نفسه ليعطي شكل حجري واقعي
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.z += delta * 0.3;

      // 3. إعادة التدوير (Recycling) لو خرج عن الحدود
      if (meshRef.current.position.x > 60) {
        meshRef.current.position.x = -60;
        meshRef.current.position.y = (Math.random() - 0.5) * 40;
      }
    }
  });

  if (exploded) {
    return (
      <group position={position}>
        <Sparkles count={50} scale={3} size={4} speed={2} color={color} />
        {/* هنا ممكن تضيف صوت انفجار لحظي */}
      </group>
    );
  }

  return (
    <group>
      {/* ذيل النيزك (The Trail) - يعطي إحساس السرعة */}
      <Trail
        width={1.5}
        length={8}
        color={new THREE.Color(color)}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          position={position}
          rotation={randomRotation}
          onClick={() => setExploded(true)}
        >
          <icosahedronGeometry args={[size, 0]} />
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.4}
            emissive={color}
            emissiveIntensity={1.5}
            metalness={1}
            roughness={0.2}
          />
        </mesh>
      </Trail>

      {/* وهج إضافي حول النيزك */}
      <pointLight position={position} intensity={2} distance={10} color={color} />
    </group>
  );
}

// المولد الأساسي للنيازك في المجرة
export function MeteorSpawner() {
  const count = 20; // عدد النيازك

  const meteorsData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      id: Math.random(),
      position: [
        (Math.random() - 0.5) * 100, // توزيع واسع في المحور X
        (Math.random() - 0.5) * 50,  // توزيع في المحور Y
        (Math.random() - 0.5) * 60   // توزيع في المحور Z للعمق
      ],
      speed: 3 + Math.random() * 8, // سرعات متفاوتة
      size: 0.15 + Math.random() * 0.4,
      color: Math.random() > 0.5 ? "#00d4ff" : "#ffae00", // ألوان متناسقة مع الخريطة
      noise: 0.5 + Math.random() * 1.5 // معامل تذبذب الحركة
    }));
  }, []);

  return (
    <group>
      {meteorsData.map((data) => (
        <Meteor key={data.id} {...data} />
      ))}
    </group>
  );
}