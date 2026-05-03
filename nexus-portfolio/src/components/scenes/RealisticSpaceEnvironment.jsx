import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NEBULA_REGIONS = [
  { x: 15, y: 5, z: -10, color: { r: 0.2, g: 0.4, b: 1.0 } },
  { x: -20, y: -10, z: 5, color: { r: 0.8, g: 0.2, b: 1.0 } },
  { x: 5, y: 15, z: 15, color: { r: 0.3, g: 0.8, b: 0.3 } },
]

const SpaceEnvironment = ({ density = 1.0 }) => {
  const starFieldRef = useRef()
  const nebulaRef = useRef()
  const dustRef = useRef()
  const galaxyRef = useRef()

  const { positions, colors, sizes } = useMemo(() => {
    const count = Math.floor(15000 * density)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const starTypes = [
      { temp: 3000, color: [1.0, 0.6, 0.4] },
      { temp: 4000, color: [1.0, 0.8, 0.6] },
      { temp: 6000, color: [1.0, 1.0, 0.9] },
      { temp: 8000, color: [0.9, 0.95, 1.0] },
      { temp: 12000, color: [0.7, 0.85, 1.0] },
      { temp: 20000, color: [0.6, 0.7, 1.0] },
      { temp: 30000, color: [0.5, 0.6, 0.9] },
    ]

    const getStarColor = () => {
      const r = Math.random()
      if (r < 0.7) return starTypes[Math.floor(Math.random() * 2)]
      if (r < 0.95) return starTypes[2 + Math.floor(Math.random() * 3)]
      return starTypes[5 + Math.floor(Math.random() * 2)]
    }

    for (let i = 0; i < count; i++) {
      const radius = 80 + Math.pow(Math.random(), 0.5) * 170
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const star = getStarColor()
      colors[i * 3] = star.color[0]
      colors[i * 3 + 1] = star.color[1]
      colors[i * 3 + 2] = star.color[2]

      sizes[i] = (Math.random() * 1.5 + 0.5) * (star.temp > 10000 ? 1.2 : 1)
    }

    return { positions, colors, sizes }
  }, [density])

  const nebulaData = useMemo(() => {
    const count = Math.floor(5000 * density)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 4)
    const sizes = new Float32Array(count)

    const nebulaColors = [
      [0.2, 0.4, 1.0, 0.3],
      [0.8, 0.2, 1.0, 0.25],
      [0.3, 0.8, 0.3, 0.2],
      [1.0, 0.5, 0.1, 0.15],
    ]

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const cluster = Math.random()
      let baseRadius
      if (cluster < 0.3) baseRadius = 10 + Math.random() * 15
      else if (cluster < 0.7) baseRadius = 20 + Math.random() * 25
      else baseRadius = 30 + Math.random() * 40

      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = baseRadius * Math.sin(phi) * Math.cos(angle)
      positions[i * 3 + 1] = baseRadius * Math.sin(phi) * Math.sin(angle) * 0.6
      positions[i * 3 + 2] = baseRadius * Math.cos(phi)

      const colorChoice = nebulaColors[Math.floor(Math.random() * nebulaColors.length)]
      colors[i * 4] = colorChoice[0] + (Math.random() - 0.5) * 0.2
      colors[i * 4 + 1] = colorChoice[1] + (Math.random() - 0.5) * 0.2
      colors[i * 4 + 2] = colorChoice[2] + (Math.random() - 0.5) * 0.2
      colors[i * 4 + 3] = colorChoice[3] * (0.5 + Math.random() * 0.5)

      sizes[i] = 2 + Math.random() * 5
    }

    return { positions, colors, sizes }
  }, [density])

  const dustData = useMemo(() => {
    const count = Math.floor(20000 * density)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const radius = 5 + Math.random() * 150
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.5
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const dustType = Math.random()
      if (dustType < 0.5) { colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.9 }
      else if (dustType < 0.8) { colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.8 }
      else { colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.6 }

      sizes[i] = 0.1 + Math.random() * 0.3
    }

    return { positions, colors, sizes }
  }, [density])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    if (starFieldRef.current) starFieldRef.current.rotation.y += delta * 0.001
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += delta * 0.0005
      nebulaRef.current.rotation.x = Math.sin(time * 0.1) * 0.1
    }
    if (dustRef.current) dustRef.current.rotation.y += delta * 0.0008
    if (galaxyRef.current) galaxyRef.current.scale.setScalar(Math.sin(time * 0.5) * 0.1 + 1)
  })

  return (
    <group>
      <color attach="background" args={['#000005']} />
      
      <points ref={starFieldRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-size" array={sizes} count={sizes.length} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial size={0.4} vertexColors transparent opacity={0.9} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      <group ref={nebulaRef}>
        {NEBULA_REGIONS.map((region, regionIdx) => {
          const regionPositions = new Float32Array(2000 * 3)
          const regionColors = new Float32Array(2000 * 4)
          for (let i = 0; i < 2000; i++) {
            const angle = Math.random() * Math.PI * 2
            const clusterRadius = 10 + Math.random() * 30
            const phi = Math.acos(2 * Math.random() - 1)
            regionPositions[i * 3] = region.x + clusterRadius * Math.sin(phi) * Math.cos(angle)
            regionPositions[i * 3 + 1] = region.y + clusterRadius * Math.sin(phi) * Math.sin(angle)
            regionPositions[i * 3 + 2] = region.z + clusterRadius * Math.cos(phi)
            regionColors[i * 4] = region.color.r + (Math.random() - 0.5) * 0.2
            regionColors[i * 4 + 1] = region.color.g + (Math.random() - 0.5) * 0.2
            regionColors[i * 4 + 2] = region.color.b + (Math.random() - 0.5) * 0.2
            regionColors[i * 4 + 3] = 0.15 * (0.5 + Math.random() * 0.5)
          }
          return (
            <points key={regionIdx}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={regionPositions} count={2000} itemSize={3} />
                <bufferAttribute attach="attributes-color" array={regionColors} count={2000} itemSize={4} />
              </bufferGeometry>
              <pointsMaterial size={4} vertexColors transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>
          )
        })}
      </group>

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={dustData.positions} count={dustData.positions.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={dustData.colors} count={dustData.colors.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-size" array={dustData.sizes} count={dustData.sizes.length} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial size={0.15} vertexColors transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}

export default SpaceEnvironment
