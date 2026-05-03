import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CinematicIntroScene = ({ phase, countdown }) => {
  const groupRef = useRef()
  const explosionRef = useRef()
  const hologramRef = useRef()
  const [explosionProgress, setExplosionProgress] = useState(0)
  
  const fullText = 'WELCOME TO MY PORTFOLIO'
  const particlesCount = 150

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime

    // Subtle floating for hologram
    if (hologramRef.current && phase === 'hologram') {
      hologramRef.current.position.y = Math.sin(time * 2) * 0.2
      hologramRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
    }

    // Explosion expansion
    if (phase === 'explosion' || phase === 'zooming') {
      setExplosionProgress(prev => {
        const maxProgress = phase === 'explosion' ? 1.5 : 2.5
        return Math.min(prev + delta * 0.4, maxProgress)
      })
    }

    // Update explosion rings
    if (explosionRef.current) {
      explosionRef.current.children.forEach((ring, i) => {
        if (ring.material && ring.scale) {
          const expandFactor = explosionProgress * (2 + i * 0.5)
          ring.scale.setScalar(expandFactor)
          ring.material.opacity = Math.max(0, 1.2 - explosionProgress * 0.8) * (0.8 - i * 0.15)
        }
      })
    }
  })

  // Render nothing if complete
  if (phase === 'waiting' || phase === 'complete') return null

  return (
    <group ref={groupRef}>
      {/* Black background for waiting/hologram */}
      {(phase === 'waiting' || phase === 'hologram') && (
        <mesh position={[0, 0, -5]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}

      {/* Hologram phase */}
      {phase === 'hologram' && (
        <>
          {/* Hologram projection beam */}
          <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 1.5, 6, 16, 1, true]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.1}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Hologram text */}
          <group ref={hologramRef} position={[0, 1.5, 0]}>
            <sprite scale={[14, 2.5, 1]}>
              <spriteMaterial color="#00ffff" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
            </sprite>
            
            {fullText.split('').map((char, i) => {
              const charWidth = 0.3
              const totalWidth = fullText.length * charWidth
              const x = -totalWidth / 2 + i * charWidth
              
              return (
                <sprite key={i} position={[x, 0, 0.1]} scale={[0.25, 0.4, 1]}>
                  <spriteMaterial 
                    color="#00ffff" 
                    transparent 
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                  />
                </sprite>
              )
            })}
          </group>

          {/* Floating particles */}
          {Array.from({ length: particlesCount }).map((_, i) => {
            const angle = (i / particlesCount) * Math.PI * 2
            const radius = 3 + Math.random() * 4
            const timeOffset = i * 0.1
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(time * 1.5 + timeOffset) * 0.3,
                  Math.sin(angle) * radius
                ]}
              >
                <sphereGeometry args={[0.03, 4, 4]} />
                <meshBasicMaterial
                  color="#00ffff"
                  transparent
                  opacity={0.5 + Math.sin(time * 3 + timeOffset) * 0.3}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )
          })}
        </>
      )}

      {/* Explosion phase */}
      {(phase === 'explosion' || phase === 'zooming') && (
        <group ref={explosionRef} position={[0, 0, 0]}>
          {/* Fireball */}
          <mesh>
            <sphereGeometry args={[3, 32, 32]} />
            <meshBasicMaterial
              color="#ffaa00"
              transparent
              opacity={Math.min(explosionProgress * 2, 1) * 0.9}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Shockwave rings */}
          {[0, 1, 2, 3, 4].map(i => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[i * 2, (i + 1) * 2, 64]} />
              <meshBasicMaterial
                color={i < 2 ? '#ffffff' : i < 3 ? '#ff8800' : '#ff0000'}
                transparent
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}

          {/* Lightning */}
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * Math.PI * 2 / 16) * 4,
                Math.sin(i * Math.PI * 2 / 16) * 4,
                0
              ]}
              rotation={[0, 0, i * Math.PI * 2 / 16]}
            >
              <coneGeometry args={[0.15, 5, 4]} />
              <meshBasicMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={3}
                transparent
                opacity={Math.max(0, 1 - explosionProgress * 0.8) * (0.7 + Math.random() * 0.3)}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}

          {/* Debris */}
          {Array.from({ length: 80 }).map((_, i) => {
            const angle = (i / 80) * Math.PI * 2
            const dist = 2 + Math.random() * explosionProgress * 15
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * dist, Math.sin(angle) * dist, 0]}
              >
                <sphereGeometry args={[0.08, 4, 4]} />
                <meshBasicMaterial
                  color="#ff6600"
                  emissive="#ff3300"
                  transparent
                  opacity={Math.max(0, 1 - explosionProgress * 0.6)}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )
          })}
        </group>
      )}

      {/* White flash */}
      {phase === 'explosion' && (
        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.6 * (1 - explosionProgress * 0.6)}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
}

export default CinematicIntroScene
