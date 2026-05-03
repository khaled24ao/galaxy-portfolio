import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   3D HOLOGRAPHIC PROJECT PANEL
   Floats in world-space next to the selected planet.
   Uses @react-three/drei Html for crisp text in 3D.
   ═══════════════════════════════════════════════ */

export function HolographicPanel({ project, planetPosition, visible = false }) {
  const groupRef = useRef();
  const ringRef  = useRef();

  useFrame((state) => {
    if (!groupRef.current || !visible) return;
    const t = state.clock.elapsedTime;

    // Floating bob
    groupRef.current.position.y = planetPosition[1] + 30 + Math.sin(t * 0.8) * 5;

    // Facing camera (billboard)
    groupRef.current.position.x = planetPosition[0] + 80;
    groupRef.current.position.z = planetPosition[2];

    // Rotating ring
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
      ringRef.current.rotation.x += 0.005;
    }
  });

  if (!visible || !project) return null;

  return (
    <group ref={groupRef} position={[planetPosition[0] + 80, planetPosition[1] + 30, planetPosition[2]]}>
      {/* Rotating holographic ring */}
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[18, 0.4, 8, 64]} />
          <meshBasicMaterial
            color={project.color}
            transparent opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation-y={Math.PI / 2}>
          <torusGeometry args={[18, 0.2, 8, 64]} />
          <meshBasicMaterial
            color={project.color}
            transparent opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* HTML panel — rendered in 3D space */}
      <Html
        center
        distanceFactor={120}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        occlude={false}
      >
        <div style={{
          width: 280,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${project.color}55`,
          borderTop: `2px solid ${project.color}`,
          borderRadius: 8,
          padding: '16px 18px',
          fontFamily: "'Courier New', monospace",
          color: '#fff',
          boxShadow: `0 0 30px ${project.color}33`,
          animation: 'holoIn 0.4s ease-out',
        }}>
          <style>{`
            @keyframes holoIn { from { opacity:0; transform: scale(0.8); } to { opacity:1; transform: scale(1); } }
          `}</style>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.color, boxShadow: `0 0 8px ${project.color}` }} />
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>{project.name}</span>
          </div>

          {/* Description */}
          <p style={{ fontSize: 11, color: '#999', lineHeight: 1.5, margin: '0 0 10px' }}>
            {project.description?.slice(0, 100)}...
          </p>

          {/* Tech tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(project.tech || []).slice(0, 4).map((t, i) => (
              <span key={i} style={{
                background: `${project.color}22`,
                border: `1px solid ${project.color}55`,
                color: project.color,
                padding: '2px 7px',
                borderRadius: 3,
                fontSize: 10,
              }}>{t}</span>
            ))}
          </div>

          {/* Scan line effect */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px', background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
            animation: 'scanLine 2s linear infinite',
            opacity: 0.6,
          }} />
          <style>{`
            @keyframes scanLine {
              from { top: 0; } to { top: 100%; }
            }
          `}</style>
        </div>
      </Html>

      {/* Connection line from panel to planet */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, -80, -30, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={project.color}
          transparent opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>
    </group>
  );
}
