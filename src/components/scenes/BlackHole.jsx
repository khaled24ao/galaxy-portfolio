import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   CINEMATIC 3D BLACK HOLE (Interstellar Style)
   - Massive 3D accretion disks
   - Pure black event horizon
   - Simulated gravitational lensing (top/bottom bent rings)
   ═══════════════════════════════════════════════════════ */

const DISK_VERT = `
  varying vec2 vUv;
  varying float vDist;
  void main(){
    vUv = uv;
    vDist = length(position.xz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DISK_FRAG = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDist;
  
  float rand(vec2 c){ return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p);vec2 f=fract(p);
    float a=rand(i);float b=rand(i+vec2(1,0));
    float c2=rand(i+vec2(0,1));float d=rand(i+vec2(1,1));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(a,b,u.x)+(c2-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
  }
  
  void main(){
    // Swirl pattern
    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
    float r = length(vUv - 0.5) * 2.0;
    
    // Complex noise for the plasma
    float swirl = noise(vec2(r * 4.0 + uTime * 0.5, angle * 3.0 - uTime * 1.5));
    float swirl2 = noise(vec2(r * 8.0 - uTime * 0.2, angle * 5.0 + uTime * 1.0));
    float finalNoise = swirl * 0.6 + swirl2 * 0.4;
    
    // Interstellar Colors: white core → bright yellow → deep orange → dark brown/black edge
    vec3 col;
    if(r < 0.2)      col = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.9, 0.6), r/0.2); // White to bright yellow
    else if(r < 0.5) col = mix(vec3(1.0, 0.9, 0.6), vec3(1.0, 0.4, 0.0), (r-0.2)/0.3); // Yellow to orange
    else if(r < 0.8) col = mix(vec3(1.0, 0.4, 0.0), vec3(0.5, 0.1, 0.0), (r-0.5)/0.3); // Orange to dark red/brown
    else             col = mix(vec3(0.5, 0.1, 0.0), vec3(0.0, 0.0, 0.0), (r-0.8)/0.2); // Fade to black
    
    // Add noise texture
    col *= (0.5 + finalNoise * 1.5);
    col *= 3.0; // High Emissive boost for Bloom
    
    // Fade out edges and inner ring
    float alpha = smoothstep(1.0, 0.8, r) * smoothstep(0.0, 0.1, r) * (0.6 + finalNoise * 0.4);
    
    gl_FragColor = vec4(col, alpha);
  }
`;

export function BlackHole({ position = [0, 0, 0], scale = 1, visible = true }) {
  const groupRef = useRef();
  const mainDiskRef = useRef();
  const topLensRef = useRef();
  const bottomLensRef = useRef();

  const diskUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (!visible) return;
    const t = state.clock.elapsedTime;
    diskUniforms.uTime.value = t;
    
    // Spin the main disk
    if (mainDiskRef.current) {
      mainDiskRef.current.rotation.z -= 0.005; // Fast spin for accretion disk
    }
    
    // Spin the lensing rings to make them feel alive
    if (topLensRef.current) topLensRef.current.rotation.z += 0.008;
    if (bottomLensRef.current) bottomLensRef.current.rotation.z += 0.008;
    
    // Gentle bobbing effect for the whole black hole
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * (scale * 0.05);
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      
      {/* 1. THE EVENT HORIZON (Pure Black Sphere, DepthWrite = true to block things behind it) */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#000000" depthWrite={true} />
      </mesh>

      {/* 2. PHOTON SPHERE (Bright inner ring hugging the event horizon) */}
      <mesh rotation-x={Math.PI * 0.5}>
        <ringGeometry args={[1.5, 1.65, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 3. MAIN ACCRETION DISK (Using the Interstellar custom shader) */}
      <mesh ref={mainDiskRef} rotation-x={Math.PI * 0.45}>
        <ringGeometry args={[1.6, 6.5, 256, 1]} />
        <shaderMaterial
          uniforms={diskUniforms}
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          transparent 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
        />
      </mesh>

      {/* 4. GRAVITATIONAL LENSING - TOP RING (Simulates the disk bending over the top) */}
      <mesh ref={topLensRef} position={[0, 0.8, -1.0]} rotation-x={Math.PI * 0.15}>
        <ringGeometry args={[1.5, 3.5, 128, 1]} />
        <shaderMaterial
          uniforms={diskUniforms}
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          transparent 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
          opacity={0.5}
        />
      </mesh>

      {/* 5. GRAVITATIONAL LENSING - BOTTOM RING (Simulates the disk bending under the bottom) */}
      <mesh ref={bottomLensRef} position={[0, -0.8, -1.0]} rotation-x={-Math.PI * 0.15}>
        <ringGeometry args={[1.5, 3.5, 128, 1]} />
        <shaderMaterial
          uniforms={diskUniforms}
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          transparent 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
          opacity={0.5}
        />
      </mesh>

      {/* 6. OUTER GLOW (Deep orange ambient halo) */}
      <mesh>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial color="#331100" transparent opacity={0.15} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 7. LIGHTING */}
      <pointLight color="#ff8844" intensity={800} distance={50} decay={2} />
    </group>
  );
}
