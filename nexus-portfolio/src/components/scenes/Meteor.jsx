import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Meteor = ({ x, y, z, onCollision }) => {
  const meshRef = useRef()
  const [trail, setTrail] = useState([])
  const [alive, setAlive] = useState(true)

  // Initial velocity (diagonal movement)
  const velocity = useMemo(() => ({
    x: 15,
    y: -8,
    z: 0
  }), [])

  useFrame((state, delta) => {
    if (!alive || !meshRef.current) return

    // Move meteor
    meshRef.current.position.x += velocity.x * delta
    meshRef.current.position.y += velocity.y * delta

    // Add trail particle randomly
    if (Math.random() > 0.3) {
      const pos = meshRef.current.position.clone()
      setTrail(prev => [...prev.slice(-8), { pos, life: 1.0 }])
    }

    // Update trail lifetimes
    setTrail(prev =>
      prev
        .map(t => ({ ...t, life: t.life - delta * 2 }))
        .filter(t => t.life > 0)
    )

    // Check collision with any planet
    // Simplified: if meteor goes too far off-screen, despawn
    if (
      Math.abs(meshRef.current.position.x) > 30 ||
      Math.abs(meshRef.current.position.y) > 30
    ) {
      onCollision()
      setAlive(false)
    }
  })

  if (!alive) return null

  return (
    <group>
      {/* Meteor core (cone) */}
      <mesh ref={meshRef} position={[x, y, z]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.15, 0.8, 4]} />
        <meshBasicMaterial
          color="#ffaa00"
          emissive="#ff6b6b"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Trail particles */}
      {trail.map((t, i) => (
        <mesh key={i} position={t.pos} scale={t.life * 0.3}>
          <sphereGeometry args={[0.08, 4, 4]} />
          <meshBasicMaterial
            color="#ff6b6b"
            transparent
            opacity={t.life * 0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

export default Meteor
