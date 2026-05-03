// src/components/effects/WarpSpeed.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function WarpSpeed({ active, color = "#00d4ff" }) {
    const meshRef = useRef();

    // إنشاء 500 خط للسرعة
    const count = 500;
    const [positions, stretch] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const str = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 40;     // X
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // Y
            pos[i * 3 + 2] = (Math.random() - 1) * 50;   // Z
            str[i] = Math.random() * 10;                 // طول الخط
        }
        return [pos, str];
    }, []);

    useFrame((state, delta) => {
        if (!active || !meshRef.current) return;

        const positions = meshRef.current.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            // تحريك الخطوط نحو الكاميرا بسرعة خرافية
            positions[i * 3 + 2] += delta * 150;

            // إعادة الخط للخلف لو مر بجانب الكاميرا
            if (positions[i * 3 + 2] > 10) {
                positions[i * 3 + 2] = -50;
            }
        }
        meshRef.current.geometry.attributes.position.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color={color}
                size={0.15}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                sizeAttenuation={true}
            />
        </points>
    );
}