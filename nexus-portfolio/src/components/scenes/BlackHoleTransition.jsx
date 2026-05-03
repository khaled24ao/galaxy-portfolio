import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BlackHoleTransition = ({
  active = false,
  onComplete,
  duration = 3000,
  position = [0, 0, 0],
  direction = 'in' // 'in' = warp into black hole, 'out' = emerge from wormhole
}) => {
  const groupRef = useRef()
  const eventHorizonRef = useRef()
  const accretionDiskRef = useRef()
  const tunnelRef = useRef()
  const particlesRef = useRef()
  
  const [progress, setProgress] = useState(0)
  const [cameraDistortion, setCameraDistortion] = useState(0)

  // Generate accretion disk particles
  const diskParticles = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Torus distribution around black hole
      const angle = Math.random() * Math.PI * 2
      const majorRadius = 4 + Math.random() * 3
      const minorRadius = Math.random() * 1.5
      const height = (Math.random() - 0.5) * 2

      positions[i * 3] = Math.cos(angle) * majorRadius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * majorRadius

      // Hot, glowing colors (orange to white)
      const heat = Math.random()
      if (heat < 0.3) {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.3
        colors[i * 3 + 2] = 0.1
      } else if (heat < 0.7) {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.3
        colors[i * 3 + 2] = 0.2
      } else {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 0.8
      }

      sizes[i] = 0.05 + Math.random() * 0.15
    }

    return { positions, colors, sizes }
  }, [])

  // Gravitational lensing particles
  const lensParticles = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.3
      positions[i * 3 + 2] = radius * Math.cos(phi)

      colors[i * 3] = 0.9
      colors[i * 3 + 1] = 0.9
      colors[i * 3 + 2] = 1
    }

    return { positions, colors }
  }, [])

  // Animation
  useFrame((state, delta) => {
    if (!active) return

    const time = state.clock.elapsedTime

    // Progress animation
    setProgress(prev => {
      const next = Math.min(prev + delta / (duration / 1000), 1)
      if (next >= 1 && onComplete) {
        setTimeout(onComplete, 100)
      }
      return next
    })

    // Camera distortion effect
    if (direction === 'in') {
      setCameraDistortion(progress * 2) // Intensifies as we approach
    } else {
      setCameraDistortion(2 * (1 - progress)) // Fades out
    }

    // Rotate black hole components
    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.y += delta * 0.2
    }

    if (tunnelRef.current) {
      tunnelRef.current.rotation.z -= delta * 0.5
    }

    // Animate particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1
      particlesRef.current.rotation.x = Math.sin(time * 0.5) * 0.1
    }

    // Event horizon pulse
    if (eventHorizonRef.current) {
      const pulse = Math.sin(time * 3) * 0.02 + 1
      eventHorizonRef.current.scale.setScalar(pulse)
    }
  })

  if (!active) return null

  const warpFactor = direction === 'in' ? progress : (1 - progress)

  return (
    <group ref={groupRef} position={position}>
      {/* Event horizon - pure black sphere */}
      <mesh ref={eventHorizonRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Accretion disk - glowing ring */}
      <group ref={accretionDiskRef}>
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[2.5, 5, 64]} />
          <meshBasicMaterial
            color="#ff4400"
            transparent
            opacity={0.6 * warpFactor}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Spiral arms */}
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[5.5, 8, 64]} />
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.3 * warpFactor}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Inner glow */}
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[2.2, 2.8, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.8 * warpFactor}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Gravitational lensing distortion field */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={lensParticles.positions}
            count={lensParticles.positions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={lensParticles.colors}
            count={lensParticles.colors.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.3 * warpFactor}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Warp tunnel effect */}
      <group ref={tunnelRef}>
        {Array.from({ length: 20 }).map((_, i) => {
          const radius = 3 + i * 1.5
          return (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius, radius + 0.2, 32]} />
              <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={(0.5 - i * 0.02) * warpFactor}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )
        })}
      </group>

      {/* Particle stream into black hole */}
      <group>
        {Array.from({ length: 200 }).map((_, i) => {
          const angle = (i / 200) * Math.PI * 2
          const dist = 10 + Math.random() * 30
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 2,
                Math.sin(angle) * dist
              ]}
              scale={[0.05, 0.05, 0.3]}
            >
              <boxGeometry />
              <meshBasicMaterial
                color="#ffaa00"
                emissive="#ff4400"
                transparent
                opacity={0.5 * warpFactor}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )
        })}
      </group>

      {/* Distortion shader effect (simplified) */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.7 * (1 - warpFactor) * 0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

export default BlackHoleTransition
