import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RealisticSun = ({ 
  onAssemblyComplete, 
  assemblyDuration = 4,
  position = [0, 0, 0],
  scale = 1
}) => {
  const sunRef = useRef()
  const coronaRef = useRef()
  const particlesRef = useRef()
  const flaresRef = useRef()
  const coreParticlesRef = useRef()
  
  const [assemblyProgress, setAssemblyProgress] = useState(0)
  const [isAssembled, setIsAssembled] = useState(false)
  
  const particleCount = 5000
  const coreParticleCount = 2000

  // Generate sun particles that converge from scattered positions
  const { positions, colors, sizes, corePositions, coreColors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const corePositions = new Float32Array(coreParticleCount * 3)
    const coreColors = new Float32Array(coreParticleCount * 3)

    // Outer corona particles - scattered far away
    for (let i = 0; i < particleCount; i++) {
      const radius = 3 + Math.random() * 20
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // Color gradient from yellow to orange to red
      const distRatio = (radius - 3) / 17
      if (distRatio < 0.3) {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.9 - distRatio * 0.5
        colors[i * 3 + 2] = 0.5 - distRatio * 1.5
      } else if (distRatio < 0.7) {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.6 - (distRatio - 0.3) * 1.2
        colors[i * 3 + 2] = 0.2 - (distRatio - 0.3) * 0.6
      } else {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.2 - (distRatio - 0.7) * 0.6
        colors[i * 3 + 2] = 0.1
      }
      
      sizes[i] = 0.5 + Math.random() * 1.5 * (1 - distRatio * 0.5)
    }

    // Core particles - dense center
    for (let i = 0; i < coreParticleCount; i++) {
      const radius = Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      corePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      corePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      corePositions[i * 3 + 2] = radius * Math.cos(phi)

      coreColors[i * 3] = 1
      coreColors[i * 3 + 1] = 0.95
      coreColors[i * 3 + 2] = 0.8
      
      sizes[i] = 0.3 + Math.random() * 0.5
    }

    return { positions, colors, sizes, corePositions, coreColors }
  }, [])

  // Solar flares positions (connected to surface)
  const flares = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      length: 2 + Math.random() * 3,
      width: 0.3 + Math.random() * 0.2,
      speed: 0.5 + Math.random() * 0.5,
      intensity: 0.5 + Math.random() * 0.5
    }))
  }, [])

  // Assembly animation
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (assemblyDuration * 1000), 1)
      setAssemblyProgress(progress)
      
      if (progress >= 1) {
        clearInterval(interval)
        setIsAssembled(true)
        if (onAssemblyComplete) onAssemblyComplete()
      }
    }, 16)
    
    return () => clearInterval(interval)
  }, [assemblyDuration, onAssemblyComplete])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime

    // Pulsing corona
    if (coronaRef.current && isAssembled) {
      const pulse = Math.sin(time * 2) * 0.05 + 1
      coronaRef.current.scale.setScalar(pulse)
      coronaRef.current.material.opacity = 0.3 + Math.sin(time * 3) * 0.1
    }

    // Rotating flares
    if (flaresRef.current && isAssembled) {
      flaresRef.current.children.forEach((flare, i) => {
        if (flare.material) {
          const flareData = flares[i]
          const wobble = Math.sin(time * flareData.speed + flareData.angle) * 0.2
          flare.scale.setScalar(flareData.intensity + wobble)
          flare.material.opacity = 0.3 + Math.sin(time * 4 + i) * 0.2
        }
      })
    }

    // Update particle positions during assembly
    if (particlesRef.current && !isAssembled) {
      const positions = particlesRef.current.geometry.attributes.position.array
      const targetPositions = particlesRef.current.userData.targetPositions
      
      if (targetPositions) {
        const smoothProgress = this.easeInOutCubic(assemblyProgress)
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3
          positions[i3] = positions[i3] + (targetPositions[i3] - positions[i3]) * 0.1
          positions[i3 + 1] = positions[i3 + 1] + (targetPositions[i3 + 1] - positions[i3 + 1]) * 0.1
          positions[i3 + 2] = positions[i3 + 2] + (targetPositions[i3 + 2] - positions[i3 + 2]) * 0.1
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true
      }
    }
  })

  // Calculate target positions for assembly
  const targetParticlePositions = useMemo(() => {
    const target = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      // Target: form a sphere around center
      const radius = 2 + Math.random() * 1.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      target[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      target[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      target[i * 3 + 2] = radius * Math.cos(phi)
    }
    return target
  }, [])

  return (
    <group position={position} scale={scale}>
      {/* Core sun sphere - visible surface */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#fff5e6"
          emissive="#ffaa00"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* Corona glow layer */}
      <mesh ref={coronaRef} scale={1.5}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer glow */}
      <mesh scale={2.5}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Particle assembly system */}
      {!isAssembled && (
        <points ref={particlesRef} userData={{ targetPositions: targetParticlePositions }}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={positions}
              count={particleCount}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              array={colors}
              count={particleCount}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              array={sizes}
              count={particleCount}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.2}
            vertexColors
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}

      {/* Core particles (visible always) */}
      <points ref={coreParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={corePositions}
            count={coreParticleCount}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={coreColors}
            count={coreParticleCount}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            array={sizes.slice(0, coreParticleCount)}
            count={coreParticleCount}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Solar flares */}
      <group ref={flaresRef}>
        {flares.map((flare, i) => (
          <mesh key={i} position={[0, 0, 1.2]}>
            <coneGeometry args={[flare.width, flare.length, 8]} />
            <meshBasicMaterial
              color="#ffaa00"
              emissive="#ff4400"
              emissiveIntensity={2}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Point light for sun illumination */}
      <pointLight
        color="#fff5e6"
        intensity={2}
        distance={100}
        decay={2}
      />
    </group>
  )
}

export default RealisticSun
