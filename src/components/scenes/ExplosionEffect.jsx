import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   CINEMATIC BIG BANG EXPLOSION
   Designed to fill a camera at z=1500 from origin.
   
   FOV 40° → at distance 1500, visible height ≈ 1100 units.
   So fireball must expand to radius ~800 to fill screen.
   ═══════════════════════════════════════════════════════ */

const FRAG = `
  uniform float uT;
  uniform float uEx;
  varying vec3 vN;
  varying vec3 vP;
  
  float rand(vec2 c){ return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p); vec2 f=fract(p);
    float a=rand(i); float b=rand(i+vec2(1,0));
    float c2=rand(i+vec2(0,1)); float d=rand(i+vec2(1,1));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(a,b,u.x)+(c2-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v=0.0,a=0.5;
    for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
    return v;
  }
  
  void main(){
    float heat = clamp(1.0 - uEx * 1.2, 0.0, 1.0);
    float n = fbm(vP.xy * 0.04 + uT * 0.3);
    float n2 = fbm(vP.yz * 0.06 - uT * 0.2);
    
    // Core white-hot → orange → red → dark smoke
    vec3 col;
    float t = heat + n * 0.2;
    if(t > 0.85)      col = mix(vec3(1.,0.9,0.6), vec3(1.,1.,1.),  (t-0.85)/0.15);
    else if(t > 0.6)  col = mix(vec3(1.,0.4,0.0), vec3(1.,0.9,0.6),(t-0.6)/0.25);
    else if(t > 0.3)  col = mix(vec3(0.3,0.05,0.), vec3(1.,0.4,0.0),(t-0.3)/0.3);
    else              col = mix(vec3(0.),vec3(0.3,0.05,0.), max(0.,t/0.3));
    
    col *= (0.6 + n2 * 0.8);
    
    // Rim glow
    float rim = 1.0 - max(dot(normalize(-vP), vN), 0.0);
    col += vec3(1.,0.5,0.1) * pow(rim, 2.0) * heat * 2.0;
    
    // Emissive boost
    col *= (heat * 4.0 + 0.5);
    
    float alpha = smoothstep(0., 0.15, heat) * (0.6 + n * 0.4);
    gl_FragColor = vec4(col, alpha);
  }
`;

const VERT = `
  uniform float uT;
  uniform float uEx;
  varying vec3 vN;
  varying vec3 vP;
  
  float rand(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5); }
  
  void main(){
    vN = normalize(normalMatrix * normal);
    float disp = rand(position + uT * 0.1) * 0.5 * uEx;
    vec3 pos = position * (1.0 + uEx * 180.0) + normal * disp * 40.0;
    vP = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export function ExplosionEffect({ active }) {
  const fireRef  = useRef();
  const sw1Ref   = useRef();
  const sw2Ref   = useRef();
  const sw3Ref   = useRef();
  const debRef   = useRef();
  const startRef = useRef(null);

  const uniforms = useMemo(() => ({
    uT:  { value: 0 },
    uEx: { value: 0 },
  }), []);

  // 40k debris particles (optimized — visually equivalent with larger sizes)
  const DEBRIS = 40000;
  const { dPos, dCol, dVel } = useMemo(() => {
    const dPos = new Float32Array(DEBRIS * 3);
    const dCol = new Float32Array(DEBRIS * 3);
    const dVel = new Float32Array(DEBRIS * 3);

    for (let i = 0; i < DEBRIS; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const speed = 30 + Math.random() * 120;

      dVel[i*3]   = Math.sin(phi) * Math.cos(theta) * speed;
      dVel[i*3+1] = Math.sin(phi) * Math.sin(theta) * speed;
      dVel[i*3+2] = Math.cos(phi) * speed;

      dPos[i*3] = dPos[i*3+1] = dPos[i*3+2] = 0;

      // Colors: white core → orange → red
      const ct = Math.random();
      if (ct < 0.3) { dCol[i*3]=1; dCol[i*3+1]=1; dCol[i*3+2]=0.8; }
      else if (ct < 0.6) { dCol[i*3]=1; dCol[i*3+1]=0.5; dCol[i*3+2]=0.1; }
      else { dCol[i*3]=1; dCol[i*3+1]=0.15; dCol[i*3+2]=0; }
    }
    return { dPos, dCol, dVel };
  }, []);

  useFrame((state) => {
    if (!active) return;
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const el = state.clock.elapsedTime - startRef.current;
    if (el > 8) return;

    uniforms.uT.value  = el;
    uniforms.uEx.value = Math.pow(el / 5, 0.6); // accelerating expansion

    // Shockwave rings expand
    const swR = el * 200;
    if (sw1Ref.current) {
      sw1Ref.current.scale.setScalar(swR);
      sw1Ref.current.material.opacity = Math.max(0, 1 - el * 0.5);
    }
    if (sw2Ref.current) {
      sw2Ref.current.scale.setScalar(swR * 0.7);
      sw2Ref.current.material.opacity = Math.max(0, 0.6 - el * 0.3);
    }
    if (sw3Ref.current) {
      sw3Ref.current.scale.setScalar(swR * 1.3);
      sw3Ref.current.material.opacity = Math.max(0, 0.3 - el * 0.15);
    }

    // Debris fly out
    if (debRef.current) {
      const arr = debRef.current.geometry.attributes.position.array;
      const drag = Math.max(0, 1 - el * 0.08);
      for (let i = 0; i < DEBRIS; i++) {
        arr[i*3]   += dVel[i*3]   * drag * 0.04;
        arr[i*3+1] += dVel[i*3+1] * drag * 0.04;
        arr[i*3+2] += dVel[i*3+2] * drag * 0.04;
      }
      debRef.current.geometry.attributes.position.needsUpdate = true;
      debRef.current.material.opacity = Math.max(0, 1.2 - el * 0.25);
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Fireball — HUGE shader sphere */}
      <mesh ref={fireRef}>
        <sphereGeometry args={[4, 48, 48]} />
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent blending={THREE.AdditiveBlending}
          depthWrite={false} side={THREE.FrontSide}
        />
      </mesh>

      {/* 3 Expanding shockwave rings */}
      <mesh ref={sw1Ref} rotation-x={Math.PI / 2}>
        <ringGeometry args={[0.98, 1.0, 256]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={1}
          side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={sw2Ref} rotation-x={Math.PI / 3}>
        <ringGeometry args={[0.97, 1.0, 256]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.6}
          side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={sw3Ref} rotation-y={Math.PI / 4}>
        <ringGeometry args={[0.96, 1.0, 256]} />
        <meshBasicMaterial color="#ff8844" transparent opacity={0.3}
          side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 80k debris particles */}
      <points ref={debRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={DEBRIS} array={dPos} itemSize={3} />
          <bufferAttribute attach="attributes-color"    count={DEBRIS} array={dCol} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={3} vertexColors transparent opacity={1}
          blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation
        />
      </points>

      {/* Intense lights */}
      <pointLight color="#ffffff" intensity={200000} distance={5000} decay={2} />
      <pointLight color="#ff6600" intensity={80000}  distance={3000} decay={2} />
    </group>
  );
}
