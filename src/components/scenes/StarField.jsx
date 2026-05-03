// src/components/scenes/StarField.jsx
import React, { useMemo, useRef } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StarField({ quality = 'high' }) {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const starCount = quality === 'high' ? 12000 : 6000; // زودنا العدد للواقعية
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorOptions = [
      new THREE.Color("#ffffff"), // أبيض
      new THREE.Color("#ffe4e1"), // أحمر خافت
      new THREE.Color("#00d4ff"), // أزرق نيون
      new THREE.Color("#fff4ea"), // أصفر شمسي
    ];

    for (let i = 0; i < starCount; i++) {
      // توزيع كروي بدلاً من مكعب لإعطاء شكل المجرة
      const r = 150 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // اختيار لون عشوائي من القائمة
      const chosenColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      // أحجام متفاوتة جداً للعمق البصري
      sizes[i] = Math.random() * 0.4;
    }
    return { positions, colors, sizes };
  }, [quality]);

  // إضافة حركة دوران بطيئة جداً للمجرة كلها
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.005;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.002) * 0.05;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 8]}>
      <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.25} // الحجم الأساسي
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending} // التداخل المضيء بين النجوم
        />
      </Points>
    </group>
  );
}