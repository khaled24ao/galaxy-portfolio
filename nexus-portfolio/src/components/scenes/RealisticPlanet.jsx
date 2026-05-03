import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { TIMINGS } from '../utils/constants'

const RealisticPlanet = ({
  project,
  position,
  isHovered,
  isSelected,
  onClick,
  onHover,
  textureMap,
  showDetails = false
}) => {
  const planetRef = useRef()
  const atmosphereRef = useRef()
  const cloudRef = useRef()
  const glowRef = useRef()
  const ringsRef = useRef()
  
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)
  const [assemblyProgress, setAssemblyProgress] = useState(0)

  // Planet scale based on dataset size
  const baseScale = project.size || 1
  
  // Dynamic scale for selection/hover
  const scale = isSelected 
    ? baseScale * TIMINGS.selectScale
    : isHovered 
    ? baseScale * TIMINGS.hoverScale
    : baseScale

  // Generate procedural texture for planet
  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    // Base gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    const baseColor = project.color || '#4a9eff'
    
    // Convert hex to RGB for gradient
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)
    
    gradient.addColorStop(0, `rgba(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}, 1)`)
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 1)`)
    gradient.addColorStop(1, `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, 1)`)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 256)
    
    // Add some surface details (craters/continents)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const size = Math.random() * 30 + 5
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Dark spots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const size = Math.random() * 20 + 3
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return canvas
  }, [project.color])

  // Cloud texture
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const radius = Math.random() * 40 + 10
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return canvas
  }, [])

  // Assembly effect: planet forms from scattered particles
  useEffect(() => {
    const startTime = Date.now()
    const duration = 2000 // 2 seconds to assemble
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Cubic ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setAssemblyProgress(eased)
      
      if (progress >= 1) clearInterval(interval)
    }, 16)
    
    return () => clearInterval(interval)
  }, [])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime

    // Planet rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * TIMINGS.planetRotation * 0.5
      planetRef.current.rotation.x = Math.sin(time * 0.2) * 0.05
    }

    // Cloud layer rotation (slightly faster)
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * TIMINGS.planetRotation * 0.7
      cloudRef.current.rotation.x = Math.sin(time * 0.2) * 0.05
    }

    // Atmospheric glow pulsing
    if (atmosphereRef.current) {
      const pulse = Math.sin(time * 1.5) * 0.1 + 1
      atmosphereRef.current.scale.setScalar(1.1 * pulse)
      atmosphereRef.current.material.opacity = (hovered || selected ? 0.3 : 0.15) * pulse
    }

    // Outer glow effect
    if (glowRef.current) {
      const glowPulse = Math.sin(time * 0.8) * 0.2 + 0.8
      glowRef.current.scale.setScalar(glowPulse)
    }

    // Ring rotation if planet has rings
    if (ringsRef.current) {
      ringsRef.current.rotation.z += delta * 0.1
    }
  })

  const handlePointerOver = (e) => {
    e.stopPropagation()
    onHover(true)
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    onHover(false)
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e) => {
    e.stopPropagation()
    onClick()
  }

  const textures = useTexture({
    map: planetTexture,
    clouds: cloudTexture
  })

  // Determine if planet has ring system based on size
  const hasRings = baseScale > 1.3

  return (
    <group position={position}>
      {/* Atmosphere glow (inner) */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={hovered || selected ? 0.3 : 0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmospheric glow */}
      <mesh ref={glowRef} scale={1.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Planet body */}
      <mesh 
        ref={planetRef}
        scale={scale * assemblyProgress + (1 - assemblyProgress) * 0.1}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={textures.map}
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered || selected ? 0.3 : 0.15}
          metalness={0.3}
          roughness={0.7}
          transparent
          opacity={assemblyProgress}
        />
      </mesh>

      {/* Cloud layer (if not gaseous planet) */}
      {baseScale < 1.5 && (
        <mesh 
          ref={cloudRef} 
          scale={1.03 * assemblyProgress + (1 - assemblyProgress) * 0.1}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            map={textures.clouds}
            transparent
            opacity={0.4 * assemblyProgress}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Ring system for larger planets */}
      {hasRings && (
        <group ref={ringsRef} rotation={[Math.PI / 2.5, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.4, 2.2, 64]} />
            <meshStandardMaterial
              color={`${project.color}80`}
              transparent
              opacity={0.6 * assemblyProgress}
              side={THREE.DoubleSide}
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.3, 2.5, 32]} />
            <meshStandardMaterial
              color={`${project.color}40`}
              transparent
              opacity={0.4 * assemblyProgress}
              side={THREE.DoubleSide}
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
        </group>
      )}

      {/* Surface illumination - interior light */}
      <pointLight
        color={project.color}
        intensity={hovered || selected ? 4 : 2}
        distance={15}
        decay={2}
      />

      {/* Sparkles on hover/select */}
      {(hovered || selected) && (
        <Sparkles
          count={25}
          scale={2.5}
          size={1.5}
          speed={2}
          opacity={0.8}
          color={project.color}
          position={[0, 0, 0]}
        />
      )}

      {/* Name label on hover/select */}
      {(hovered || selected) && (
        <Html
          position={[0, 2.2, 0]}
          center
          distanceFactor={12}
          occlude="blending"
        >
          <div className="planet-label">
            <div className="planet-name">{project.name}</div>
            <div className="planet-category">{project.category}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

export default RealisticPlanet
