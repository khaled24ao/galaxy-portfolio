import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const StarField = ({ quality = 'medium' }) => {
  const pointsRef = useRef()

  const starCounts = {
    low: 500,
    medium: 1500,
    high: 4000
  }

  const count = starCounts[quality] || starCounts.medium

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const radius = 80 + Math.random() * 120
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const colorChoice = Math.random()
      if (colorChoice < 0.7) {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 1
      } else if (colorChoice < 0.85) {
        colors[i * 3] = 0.7
        colors[i * 3 + 1] = 0.8
        colors[i * 3 + 2] = 1
      } else {
        colors[i * 3] = 0.8
        colors[i * 3 + 1] = 0.6
        colors[i * 3 + 2] = 1
      }

      sizes[i] = Math.random() * 2 + 0.5
    }

    return { positions, colors, sizes }
  }, [count])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.005
      pointsRef.current.rotation.x += delta * 0.002
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

export default StarField
