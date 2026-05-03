import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { audioManager } from '../utils/AudioManager';

/* ═══════════════════════════════════════════════════
   OPTIMIZED SHADER PLANETS
   - uAlpha uniform instead of re-creating material
   - Dynamic Lighting from Sun (Center)
   ═══════════════════════════════════════════════════ */

const NOISE_GLSL = `
  vec3 mod289v3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289v4(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289v4(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);
    const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289v3(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;
    vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
  float fbm(vec3 p,int oct){
    float v=0.0,a=0.5,f=1.0;
    for(int i=0;i<8;i++){if(i>=oct)break;v+=a*snoise(p*f);a*=0.5;f*=2.0;}
    return v;
  }
`;

const VERT = `
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vWorldPos;
  void main(){
    vN=normalize(normalMatrix*normal);
    vP=position;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  }
`;

const SHADERS = [
  // 0 LAVA
  { u:{uC1:{value:new THREE.Color('#ff2200')},uC2:{value:new THREE.Color('#ff8800')},uC3:{value:new THREE.Color('#ffee00')}},
    f:`${NOISE_GLSL}uniform float uT, uAlpha;uniform vec3 uC1,uC2,uC3;varying vec3 vN,vP,vWorldPos;void main(){vec3 p=vP*1.8+vec3(uT*.08,0.,uT*.05);float n=fbm(p,6);float n2=fbm(p*2.+vec3(3.1,1.7,.9)+uT*.04,4);float t=clamp(n*.5+.5,0.,1.);vec3 c=mix(uC1,uC2,t);c=mix(c,uC3,clamp(n2*.5+.5,0.,1.)*t);float cr=smoothstep(.4,.42,abs(n));c=mix(c,uC3*2.,cr*.6);vec3 lightDir=normalize(-vWorldPos);float l=max(dot(vN,lightDir),0.0)*0.8+0.2;gl_FragColor=vec4(c*l,uAlpha);}` },
  // 1 GAS GIANT
  { u:{uC1:{value:new THREE.Color('#cc8844')},uC2:{value:new THREE.Color('#ffcc88')},uC3:{value:new THREE.Color('#884422')}},
    f:`${NOISE_GLSL}uniform float uT, uAlpha;uniform vec3 uC1,uC2,uC3;varying vec3 vN,vP,vWorldPos;void main(){float y=vP.y*1.2;float n=snoise(vec3(vP.x*.5+uT*.02,y*3.,vP.z*.5))*.15;float band=sin(y*8.+n*4.)*.5+.5;float storm=fbm(vP*2.+vec3(uT*.01,0.,0.),4);vec3 c=mix(uC1,uC2,band);c=mix(c,uC3,smoothstep(.6,.8,storm)*.4);float dx=vP.x-.3,dy=vP.y+.2;float spot=smoothstep(.25,.1,sqrt(dx*dx+dy*dy*4.));c=mix(c,uC3*.6,spot*.7);vec3 lightDir=normalize(-vWorldPos);float l=max(dot(vN,lightDir),0.0)*0.8+0.2;gl_FragColor=vec4(c*l,uAlpha);}` },
  // 2 OCEAN
  { u:{uC1:{value:new THREE.Color('#0033cc')},uC2:{value:new THREE.Color('#0099ff')},uC3:{value:new THREE.Color('#ffffff')}},
    f:`${NOISE_GLSL}uniform float uT, uAlpha;uniform vec3 uC1,uC2,uC3;varying vec3 vN,vP,vWorldPos;void main(){vec3 p=vP*2.+vec3(uT*.04,uT*.02,0.);float waves=fbm(p,5);float cloud=fbm(vP*1.5+vec3(uT*.015,0.,uT*.01),4);vec3 ocean=mix(uC1,uC2,clamp(waves*.5+.5,0.,1.));float cMask=smoothstep(.55,.75,cloud*.5+.5);vec3 c=mix(ocean,uC3,cMask*.9);vec3 lightDir=normalize(-vWorldPos);vec3 h=normalize(vN+lightDir);float spec=pow(max(dot(vN,h),0.),32.)*(1.-cMask)*.6;c+=spec;float l=max(dot(vN,lightDir),0.0)*0.8+0.2;gl_FragColor=vec4(c*l,uAlpha);}` },
  // 3 ICE
  { u:{uC1:{value:new THREE.Color('#aaddff')},uC2:{value:new THREE.Color('#ffffff')},uC3:{value:new THREE.Color('#6699cc')}},
    f:`${NOISE_GLSL}uniform float uT, uAlpha;uniform vec3 uC1,uC2,uC3;varying vec3 vN,vP,vWorldPos;void main(){float n=fbm(vP*3.,5);float cr=fbm(vP*6.+vec3(1.2,3.4,2.1),4);vec3 c=mix(uC1,uC2,n*.5+.5);float cMask=smoothstep(.1,.0,abs(cr));c=mix(c,uC3*.6,cMask*.8);float pole=smoothstep(.4,.9,abs(vP.y));c=mix(c,uC2,pole*.5);vec3 lightDir=normalize(-vWorldPos);vec3 h=normalize(vN+lightDir);float spec=pow(max(dot(vN,h),0.),64.)*.8;c+=spec;float l=max(dot(vN,lightDir),0.0)*0.7+0.3;gl_FragColor=vec4(c*l,uAlpha);}` },
  // 4 DESERT
  { u:{uC1:{value:new THREE.Color('#cc7722')},uC2:{value:new THREE.Color('#ffcc44')},uC3:{value:new THREE.Color('#994411')}},
    f:`${NOISE_GLSL}uniform float uT, uAlpha;uniform vec3 uC1,uC2,uC3;varying vec3 vN,vP,vWorldPos;void main(){float d=fbm(vP*2.5+vec3(uT*.005,0.,0.),6);float r=fbm(vP*5.+vec3(1.1,2.3,.7),4);vec3 c=mix(uC3,uC1,clamp(d*.5+.5,0.,1.));c=mix(c,uC2,r*.5+.4);float st=fbm(vP*1.5+vec3(uT*.02,uT*.015,0.),3);c=mix(c,uC2*.8,smoothstep(.3,.7,st*.5+.5)*.3);vec3 lightDir=normalize(-vWorldPos);float l=max(dot(vN,lightDir),0.0)*0.8+0.2;gl_FragColor=vec4(c*l,uAlpha);}` },
  // 5 CRYSTAL
  { u:{uC1:{value:new THREE.Color('#9933ff')},uC2:{value:new THREE.Color('#cc66ff')},uC3:{value:new THREE.Color('#ffffff')}},
    f:`${NOISE_GLSL}uniform float uT, uAlpha;uniform vec3 uC1,uC2,uC3;varying vec3 vN,vP,vWorldPos;void main(){float n=fbm(vP*4.,5);float f=fbm(vP*8.+vec3(2.1,1.4,3.7),3);vec3 c=mix(uC1,uC2,n*.5+.5);c=mix(c,uC3,smoothstep(.6,.62,abs(f)));float sh=sin(dot(vN,vec3(1,1,1))*20.+uT*2.)*.5+.5;c+=uC3*sh*.2;vec3 lightDir=normalize(-vWorldPos);vec3 h=normalize(vN+lightDir);float spec=pow(max(dot(vN,h),0.),128.)*1.2;c+=spec;float l=max(dot(vN,lightDir),0.0)*0.7+0.3;gl_FragColor=vec4(c*l,uAlpha);}` },
  // 6 FOREST
  { u:{uC1:{value:new THREE.Color('#224400')},uC2:{value:new THREE.Color('#44aa00')},uC3:{value:new THREE.Color('#aaffaa')}},
    f:`${NOISE_GLSL}uniform float uT, uAlpha;uniform vec3 uC1,uC2,uC3;varying vec3 vN,vP,vWorldPos;void main(){vec3 p=vP*2.+vec3(uT*.01,0.,uT*.008);float forest=fbm(p,6);float cloud=fbm(vP*1.5+vec3(uT*.02,0.,0.),4);vec3 c=mix(uC1,uC2,clamp(forest*.5+.5,0.,1.));float bio=fbm(vP*5.+vec3(uT*.1,0.,0.),3);c=mix(c,uC3,smoothstep(.7,.9,bio*.5+.5)*.5);float cMask=smoothstep(.6,.8,cloud*.5+.5);c=mix(c,vec3(.9,.95,1.),cMask*.7);vec3 lightDir=normalize(-vWorldPos);float l=max(dot(vN,lightDir),0.0)*0.8+0.2;gl_FragColor=vec4(c*l,uAlpha);}` },
];

function PlanetMesh({ project, position, index, isHovered, isSelected, onClick, onHover, scale = 1, alpha = 1 }) {
  const meshRef = useRef();
  
  // Exaggerate size differences (e.g. 1.0 -> ~4.8, 1.4 -> ~13)
  const exaggeratedSize = Math.pow(project.size, 3) * 0.6;
  const size = exaggeratedSize * scale;
  
  const shaderIndex = index % SHADERS.length;
  const shaderDef   = SHADERS[shaderIndex];

  // OPTIMIZED: Memoize material based ONLY on shader definition
  // alpha is now a uniform uAlpha
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uT:     { value: 0 },
      uAlpha: { value: 1 },
      uC1:    { value: shaderDef.u.uC1.value.clone() },
      uC2:    { value: shaderDef.u.uC2.value.clone() },
      uC3:    { value: shaderDef.u.uC3.value.clone() },
    },
    vertexShader:   VERT,
    fragmentShader: shaderDef.f,
    transparent:    true, // always true to allow fading without re-compiling
  }), [shaderIndex]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += (project.rotationSpeed || 0.3) * 0.005;
      material.uniforms.uT.value = state.clock.elapsedTime;
      // Smoothly update alpha uniform
      material.uniforms.uAlpha.value = alpha;
    }
  });

  const audioData = useRef({ scale: 1 });
  useFrame(() => {
    const data = audioManager.getFrequencyData();
    // Use mid frequency for pulsing effect
    audioData.current.scale = 1 + data.mid * 0.4;
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(true);  document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e)  => { e.stopPropagation(); onHover(false); document.body.style.cursor = 'default';  }}
      >
        <sphereGeometry args={[size, 48, 48]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Inner Bright Glow (Triggers Bloom) */}
      <mesh scale={[1.08 * audioData.current.scale, 1.08 * audioData.current.scale, 1.08 * audioData.current.scale]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={project.color}
          transparent opacity={(isHovered || isSelected ? 0.7 : 0.4) * alpha * (0.8 + audioData.current.scale * 0.2)}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Diffuse Glow */}
      <mesh scale={[1.35, 1.35, 1.35]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={project.color}
          transparent opacity={(isHovered || isSelected ? 0.3 : 0.1) * alpha}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Selection ring */}
      {(isHovered || isSelected) && (
        <mesh rotation-x={Math.PI / 2} scale={[audioData.current.scale, audioData.current.scale, 1]}>
          <ringGeometry args={[size * 1.3, size * 1.4, 128]} />
          <meshBasicMaterial
            color={project.color} transparent opacity={0.8 * alpha}
            side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>
      )}

      {/* Name */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, size * 2.1, 0]}
          fontSize={size * 0.45} color="#ffffff"
          anchorX="center" anchorY="middle"
          outlineWidth={0.08} outlineColor="#000000"
        >
          {project.name}
        </Text>
      )}
    </group>
  );
}

export function ProjectPlanet(props) {
  return (
    <Suspense fallback={null}>
      <PlanetMesh {...props} />
    </Suspense>
  );
}