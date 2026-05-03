import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   LEGENDARY CINEMATIC EXPLOSION (AAA GRADE)
   
   - 3D Simplex Noise Volumetric Fireball
   - Spherical Energy Shockwave with Scanlines
   - 100k Hyper-Velocity Turbulent Debris
   - Pure Physical Bloom Lighting
   ═══════════════════════════════════════════════════════ */

const FIREBALL_VERT = `
  uniform float uTime;
  uniform float uExpand;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vNoise;

  // 3D Simplex Noise Function
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0; 
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    
    // Boiling volumetric effect
    float n = snoise(position * 0.15 + uTime * 0.8) * 0.5 + 
              snoise(position * 0.4 - uTime * 0.5) * 0.25;
    vNoise = n;
    
    // Astronomical expansion! (Swallows the camera and the whole solar system)
    float heatExp = pow(uExpand, 1.5);
    float scale = (heatExp * 15000.0) + (n * heatExp * 5000.0);
    
    vec3 pos = position * scale;
    vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FIREBALL_FRAG = `
  uniform float uTime;
  uniform float uExpand;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vNoise;

  void main() {
    float heat = clamp(1.0 - uExpand * 0.9, 0.0, 1.0);
    
    float intensity = vNoise * 0.5 + 0.5;
    float t = heat * intensity * 2.0;
    
    vec3 color;
    if (t > 0.8)      color = mix(vec3(0.5, 0.9, 1.0), vec3(1.0, 1.0, 1.0), (t - 0.8) * 5.0); // Cyan/White hot
    else if (t > 0.4) color = mix(vec3(0.0, 0.4, 1.0), vec3(0.5, 0.9, 1.0), (t - 0.4) * 2.5); // Deep Blue
    else              color = mix(vec3(0.0, 0.1, 0.3), vec3(0.0, 0.4, 1.0), t * 2.5); // Dark Blue smoke    
    // Cinematic sci-fi rim lighting (Purple/Blue tint on edges)
    float rim = 1.0 - max(dot(normalize(-vPos), vNormal), 0.0);
    color += vec3(0.2, 0.5, 1.0) * pow(rim, 3.0) * heat * 2.0;

    // Mega brightness curve for bloom (Liquid Plasma effect)
    color *= (pow(heat, 1.2) * 25.0);

    float alpha = smoothstep(0.0, 0.15, heat * intensity) * 0.8;
    gl_FragColor = vec4(color, alpha);
  }
`;

const AURA_VERT = `
  uniform float uExpand;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    // Shockwave expands to the edge of the universe instantly
    vec3 pos = position * (pow(uExpand, 0.8) * 50000.0);
    vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const AURA_FRAG = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    float rim = 1.0 - max(dot(normalize(-vPos), vNormal), 0.0);
    float glow = pow(rim, 5.0);
    // Scanline distortion
    float scan = sin(vPos.y * 0.05 - uTime * 30.0) * 0.5 + 0.5;
    vec3 col = vec3(0.7, 0.2, 1.0) * glow * scan * 8.0; // Purple Shockwave
    gl_FragColor = vec4(col, glow * 0.7);
  }
`;

export function CinematicExplosion() {
  const fireballRef = useRef();
  const auraRef = useRef();
  const debrisRef = useRef();
  const lightRef1 = useRef(), lightRef2 = useRef();
  const startRef = useRef(null);
  
  // New Refs for the Light Beams and Core
  const beamYRef = useRef();
  const beamXRef = useRef();
  const coreRef = useRef();

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uExpand: { value: 0 },
  }), []);

  // 100k Hyper-Velocity Debris Particles
  const DEBRIS = 100000;
  const { dPos, dCol, dVel } = useMemo(() => {
    const dPos = new Float32Array(DEBRIS * 3);
    const dCol = new Float32Array(DEBRIS * 3);
    const dVel = new Float32Array(DEBRIS * 3);

    for (let i = 0; i < DEBRIS; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      
      // Astronomical velocity explosion (crosses space instantly)
      const speed = 10000 + Math.random() * 40000;

      dVel[i * 3]     = Math.sin(phi) * Math.cos(theta) * speed;
      dVel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      dVel[i * 3 + 2] = Math.cos(phi) * speed;

      dPos[i * 3] = dPos[i * 3 + 1] = dPos[i * 3 + 2] = 0;

      const ct = Math.random();
      if (ct < 0.2)       { dCol[i*3]=1;   dCol[i*3+1]=1;    dCol[i*3+2]=1;   } // White
      else if (ct < 0.5)  { dCol[i*3]=1;   dCol[i*3+1]=0.8;  dCol[i*3+2]=0.2; } // Yellow
      else if (ct < 0.8)  { dCol[i*3]=1;   dCol[i*3+1]=0.3;  dCol[i*3+2]=0;   } // Orange
      else                { dCol[i*3]=0.2; dCol[i*3+1]=0.5;  dCol[i*3+2]=1;   } // Blue
    }
    return { dPos, dCol, dVel };
  }, []);

  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const el = state.clock.elapsedTime - startRef.current;
    if (el > 10) return; // Cleanup logic in parent handles unmounting

    uniforms.uTime.value = el;
    // Slower, more persistent plasma expansion
    uniforms.uExpand.value = Math.pow(el / 6.0, 0.45);

    if (auraRef.current) {
      auraRef.current.material.opacity = Math.max(0, 1.0 - el * 0.4);
    }

    // Apocalyptic Light Beams (Gamma Ray Burst)
    if (beamYRef.current) {
      beamYRef.current.scale.x = beamYRef.current.scale.z = Math.pow(el, 0.8) * 8000;
      beamYRef.current.material.opacity = Math.max(0, 1.5 - el * 0.5);
    }
    if (beamXRef.current) {
      beamXRef.current.scale.x = beamXRef.current.scale.z = Math.pow(el, 0.8) * 5000;
      beamXRef.current.material.opacity = Math.max(0, 1.2 - el * 0.4);
    }

    // Exploding Core
    if (coreRef.current) {
      coreRef.current.scale.setScalar(Math.pow(el, 0.6) * 15000);
      coreRef.current.material.opacity = Math.max(0, 1.2 - el * 0.5);
    }

    // Advanced Physics for Debris
    if (debrisRef.current) {
      const arr = debrisRef.current.geometry.attributes.position.array;
      // Air resistance / Drag
      const drag = Math.max(0, 1 - el * 0.1);
      for (let i = 0; i < DEBRIS; i++) {
        arr[i * 3]     += dVel[i * 3]     * drag * 0.016; // 60fps approx
        arr[i * 3 + 1] += dVel[i * 3 + 1] * drag * 0.016;
        arr[i * 3 + 2] += dVel[i * 3 + 2] * drag * 0.016;
      }
      debrisRef.current.geometry.attributes.position.needsUpdate = true;
      debrisRef.current.material.opacity = Math.max(0, 1.0 - el * 0.25);
    }

    // God-tier blinding light physics
    if (lightRef1.current) lightRef1.current.intensity = Math.max(0, 5000000 - el * 800000);
    if (lightRef2.current) lightRef2.current.intensity = Math.max(0, 3000000 - el * 500000);
  });

  return (
    <group>
      {/* 3D Volumetric Boiling Fireball */}
      <mesh ref={fireballRef}>
        <sphereGeometry args={[10, 64, 64]} />
        <shaderMaterial
          vertexShader={FIREBALL_VERT}
          fragmentShader={FIREBALL_FRAG}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sci-Fi Energy Shockwave Aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[10, 64, 64]} />
        <shaderMaterial
          vertexShader={AURA_VERT}
          fragmentShader={AURA_FRAG}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Massive Exploding Core (The Star) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Apocalyptic Light Beams (Gamma Ray Burst - Fiery Orange/Pink) */}
      <mesh ref={beamYRef}>
        <cylinderGeometry args={[1, 1, 250000, 32]} />
        <meshBasicMaterial color="#ff5522" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={beamXRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1, 1, 250000, 32]} />
        <meshBasicMaterial color="#ff22aa" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 100k Debris */}
      <points ref={debrisRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={DEBRIS} array={dPos} itemSize={3} />
          <bufferAttribute attach="attributes-color"    count={DEBRIS} array={dCol} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.8} vertexColors transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      {/* Overwhelming Bloom Lights that illuminate the entire space environment */}
      <pointLight ref={lightRef1} color="#ffffff" intensity={5000000} distance={150000} decay={1.2} />
      <pointLight ref={lightRef2} color="#ff3300" intensity={3000000} distance={120000} decay={1.2} />
    </group>
  );
}

