import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { audioManager } from '../utils/AudioManager'

const EnhancedMeteor = ({ meteor, onCollision }) => {
  const meshRef = useRef()
  const [trail, setTrail] = useState([])
  const [exploding, setExploding] = useState(false)

  // Pre-calculate trail particles
  const trailParticles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      offset: i,
      size: 0.15 * (1 - i / 15),
      opacity: 1 - i / 15
    }))
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current || exploding) return

    // Move meteor
    meshRef.current.position.x += meteor.vx * delta
    meshRef.current.position.y += meteor.vy * delta
    meshRef.current.position.z += Math.sin(state.clock.elapsedTime * 2 + meteor.id) * 0.1

    // Trail update - store positions with life
    if (Math.random() > 0.2) {
      const pos = meshRef.current.position.clone()
      setTrail(prev => [...prev.slice(-20), { 
        pos, 
        life: 1.0,
        size: 0.2 + Math.random() * 0.2
      }])
    }

    // Update trail lifetimes
    setTrail(prev =>
      prev
        .map(t => ({ ...t, life: t.life - delta * 2 }))
        .filter(t => t.life > 0)
    )

    // Check collision with any planet or boundary
    const speed = Math.sqrt(meteor.vx ** 2 + meteor.vy ** 2)
    if (speed > 20 || Math.abs(meshRef.current.position.x) > 40 || Math.abs(meshRef.current.position.y) > 40) {
      triggerExplosion()
      onCollision()
    }
  })

  const triggerExplosion = () => {
    if (exploding) return
    setExploding(true)
    audioManager.playExplosion()
  }

  if (exploding) {
    return (
      <group position={[meteor.x, meteor.y, meteor.z]}>
        {/* Explosion fireball */}
        <mesh scale={[1, 1, 1]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#ffaa00"
            emissive="#ff4400"
            emissiveIntensity={3}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Shockwave ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 1.5, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Debris particles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const speed = 2 + Math.random() * 3
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.5,
                Math.sin(angle) * 0.5,
                0
              ]}
            >
              <sphereGeometry args={[0.1, 4, 4]} />
              <meshBasicMaterial
                color="#ff6600"
                emissive="#ff0000"
                emissiveIntensity={1}
              />
            </mesh>
          )
        })}
      </group>
    )
  }

  return (
    <group>
      {/* Main meteor body */}
      <mesh ref={meshRef} position={[meteor.x, meteor.y, meteor.z]}>
        <coneGeometry args={[0.2, 1.2, 6]} />
        <meshBasicMaterial
          color="#ffaa00"
          emissive="#ff4400"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Trail particles */}
      {trail.map((t, i) => (
        <mesh 
          key={i} 
          position={t.pos}
          scale={[t.size, t.size * 3, t.size]}
        >
          <sphereGeometry args={[1, 4, 4]} />
          <meshBasicMaterial
            color="#ff6b6b"
            emissive="#ff4400"
            emissiveIntensity={1}
            transparent
            opacity={t.life * 0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

export default EnhancedMeteor
