import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   REALISTIC SUN — Procedural Plasma Surface
   - Custom noise shader for rolling plasma
   - Animated corona layers
   - Dynamic solar flares
   ═══════════════════════════════════════════════ */

const FLARE_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLARE_FRAG = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    // Scroll noise along the flare length (uv.x)
    vec2 p = vec2(vUv.x * 5.0 - uTime * 3.0, vUv.y * 3.0 + uTime * 0.5);
    float n = noise(p) * 0.5 + noise(p * 2.0) * 0.25;

    // Base color: bright white-yellow at base (x=0), orange-red at tip (x=1)
    vec3 col1 = vec3(1.0, 0.9, 0.5); // core
    vec3 col2 = vec3(1.0, 0.4, 0.0); // fire
    vec3 col3 = vec3(0.8, 0.1, 0.0); // tip

    float gradient = vUv.x;
    vec3 col = mix(col1, col2, smoothstep(0.0, 0.5, gradient));
    col = mix(col, col3, smoothstep(0.5, 1.0, gradient));

    // Combine with noise
    float fireIntensity = n * (1.0 - gradient * 0.8) * 2.5;
    col *= fireIntensity;

    // Fade edges (uv.y)
    float edge = sin(vUv.y * 3.14159);
    col *= edge * 1.5;

    // Overall fade towards tip
    float alpha = uOpacity * (1.0 - gradient) * fireIntensity * edge;

    gl_FragColor = vec4(col, alpha);
  }
`;

const GLOW_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const GLOW_FRAG = `
  uniform vec3 color;
  uniform float coef;
  uniform float power;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    // dot product is 1 at center, 0 at edges. This creates a perfect radial fade.
    float intensity = pow(max(dot(normal, viewDir), 0.0), power) * coef;
    gl_FragColor = vec4(color, intensity);
  }
`;

// ── Solar Flare Tube ──
function SolarFlare({ angle, length, width, speed, delay = 0 }) {
  const ref  = useRef();
  const tRef = useRef(delay);

  const curve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const x = Math.cos(angle) * (1 + t * length);
      const y = Math.sin(angle) * (1 + t * length);
      const wobble = Math.sin(t * Math.PI) * width * (1 - t);
      pts.push(new THREE.Vector3(
        x + Math.cos(angle + Math.PI / 2) * wobble,
        y + Math.sin(angle + Math.PI / 2) * wobble,
        0,
      ));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [angle, length, width]);

  const tubeGeom = useMemo(() => new THREE.TubeGeometry(curve, 10, width * 0.25, 4, false), [curve, width]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0 }
  }), []);

  useFrame((_, delta) => {
    tRef.current += delta * speed;
    const cycle = (Math.sin(tRef.current) + 1) / 2;
    uniforms.uTime.value += delta * speed * 2;
    uniforms.uOpacity.value = cycle * 1.5;
    if (ref.current) {
      ref.current.scale.setScalar(0.8 + cycle * 0.5);
    }
  });

  return (
    <mesh ref={ref} geometry={tubeGeom}>
      <shaderMaterial
        vertexShader={FLARE_VERT}
        fragmentShader={FLARE_FRAG}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Sun Plasma Shader ──
const SUN_VERT = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SUN_FRAG = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // Simplex-like noise
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = vPosition * 2.0 + vec3(uTime * 0.08, uTime * 0.05, uTime * 0.03);
    float n1 = fbm(p);
    float n2 = fbm(p * 1.5 + vec3(3.1, 1.7, 2.3) + uTime * 0.04);
    
    // Solar color ramp: dark orange → bright yellow → white hot
    float t = n1 * 0.6 + n2 * 0.4;
    vec3 col;
    if (t > 0.65) {
      col = mix(vec3(1.0, 0.95, 0.6), vec3(1.0, 1.0, 1.0), (t - 0.65) / 0.35);
    } else if (t > 0.35) {
      col = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.95, 0.6), (t - 0.35) / 0.3);
    } else {
      col = mix(vec3(0.8, 0.2, 0.0), vec3(1.0, 0.5, 0.0), t / 0.35);
    }
    
    // Granulation effect (small-scale surface texture)
    float granules = noise(vPosition * 15.0 + uTime * 0.2) * 0.15;
    col += granules;
    
    // Limb darkening (edges are dimmer like a real star)
    float rim = dot(vNormal, vec3(0.0, 0.0, 1.0));
    float limb = pow(max(rim, 0.0), 0.4);
    col *= limb * 0.5 + 0.5;
    
    // Emissive boost
    col *= 1.8;
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function RealisticSun({ formationPhase = 1, scale = 1, ...props }) {
  const coreRef   = useRef();
  const glowRef   = useRef();

  const sunRadius = scale;

  // Memoize flare props
  const flares = useMemo(() => [0,1,2,3,4,5,6,7].map(i => ({
    angle: (i / 8) * Math.PI * 2 + Math.random() * 0.4,
    length: 0.3 + Math.random() * 0.4,
    width: 0.08 + Math.random() * 0.06,
    speed: 0.4 + Math.random() * 0.8,
    delay: Math.random() * Math.PI * 2,
  })), []);

  const sunUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    sunUniforms.uTime.value = t;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.01);
      coreRef.current.rotation.y += 0.001;
    }
  });

  // Volumetric Glow Uniforms
  const innerGlowUniforms = useMemo(() => ({
    color: { value: new THREE.Color('#ffaa00') },
    coef: { value: 0.6 },
    power: { value: 1.5 }
  }), []);

  const outerGlowUniforms = useMemo(() => ({
    color: { value: new THREE.Color('#ff2200') },
    coef: { value: 0.3 },
    power: { value: 3.5 }
  }), []);

  return (
    <group scale={[formationPhase, formationPhase, formationPhase]} {...props}>
      {/* 1. Core Plasma Sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[sunRadius, 64, 64]} />
        <shaderMaterial
          vertexShader={SUN_VERT}
          fragmentShader={SUN_FRAG}
          uniforms={sunUniforms}
        />
      </mesh>

      {/* 2. Realistic Volumetric Inner Glow */}
      <mesh scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[sunRadius, 48, 48]} />
        <shaderMaterial
          vertexShader={GLOW_VERT}
          fragmentShader={GLOW_FRAG}
          uniforms={innerGlowUniforms}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </mesh>

      {/* 3. Realistic Volumetric Outer Glow (The Big Red Light) */}
      <mesh ref={glowRef} scale={[6.0, 6.0, 6.0]}>
        <sphereGeometry args={[sunRadius, 48, 48]} />
        <shaderMaterial
          vertexShader={GLOW_VERT}
          fragmentShader={GLOW_FRAG}
          uniforms={outerGlowUniforms}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </mesh>

      {/* 5. Solar Flares (Removed by user request: weird red lines) */}
      {/* 
      <group scale={[sunRadius, sunRadius, sunRadius]}>
        {flares.map((f, i) => (
          <SolarFlare key={i} {...f} />
        ))}
      </group> 
      */}

      {/* 6. Light source */}
      <pointLight color="#ffccaa" intensity={500 * sunRadius} distance={sunRadius * 250} decay={2} />
    </group>
  );
}
