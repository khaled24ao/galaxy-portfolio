import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import RealisticPlanet from "./RealisticPlanet"
import RealisticSun from "./RealisticSun"
import RealisticSpaceEnvironment from "./RealisticSpaceEnvironment"
import EnhancedMeteor from "./EnhancedMeteor"
import { projectsData } from "../utils/projectsData"
import { HUD_CONFIG } from "../utils/constants"

const GalaxyScene = ({ onProjectSelect, selected, showMeteors = true }) => {
  const groupRef = useRef()
  const [hoveredProject, setHoveredProject] = useState(null)
  const [meteors, setMeteors] = useState([])

  const projectPositions = useMemo(() => {
    const total = projectsData.length
    const galaxyRadius = 18
    return projectsData.map((project, i) => {
      const phi = Math.acos(-1 + (2 * i) / total)
      const theta = Math.sqrt(total * Math.PI) * phi
      const orbitRadius = 8 + (i / total) * (galaxyRadius - 8)
      return {
        initialPos: {
          x: orbitRadius * Math.cos(theta),
          y: (Math.random() - 0.5) * 4,
          z: orbitRadius * Math.sin(theta)
        },
        orbitRadius,
        orbitAngle: theta,
        orbitSpeed: (0.05 / Math.pow(orbitRadius, 0.5)),
        project
      }
    })
  }, [])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    if (groupRef.current && !selected) {
      groupRef.current.rotation.y += delta * HUD_CONFIG.autoRotateSpeed * 0.3
    }
    if (showMeteors && Math.random() < HUD_CONFIG.meteorSpawnRate && meteors.length < HUD_CONFIG.maxMeteors) {
      const id = Date.now() + Math.random()
      const angle = Math.random() * Math.PI * 2
      const dist = 35 + Math.random() * 15
      setMeteors(prev => [...prev, {
        id, x: Math.cos(angle) * dist, y: (Math.random() - 0.5) * 30, z: Math.sin(angle) * dist,
        vx: -Math.cos(angle) * (12 + Math.random() * 8), vy: (Math.random() - 0.5) * 4, life: 4, size: 0.3 + Math.random() * 0.3
      }])
    }
    setMeteors(prev => 
      prev.map(m => ({
        ...m, x: m.x + m.vx * delta, y: m.y + m.vy * delta, z: m.z + Math.sin(time * 2 + m.id) * 0.1, life: m.life - delta
      })).filter(m => m.life > 0 && Math.abs(m.x) < 60 && Math.abs(m.y) < 60)
    )
  })

  return (
    <>
      <color attach="background" args={['#000005']} />
      <RealisticSpaceEnvironment density={1.0} />
      <RealisticSun position={[0, 0, 0]} scale={2.5} />
      <group ref={groupRef}>
        {projectPositions.map((orbital) => (
          <RealisticPlanet
            key={orbital.project.id}
            project={orbital.project}
            position={[orbital.initialPos.x, orbital.initialPos.y, orbital.initialPos.z]}
            isHovered={hoveredProject === orbital.project.id}
            isSelected={selected?.id === orbital.project.id}
            onClick={() => onProjectSelect(orbital.project)}
            onHover={(isHovered) => setHoveredProject(isHovered ? orbital.project.id : null)}
          />
        ))}
      </group>
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#fff5e6" distance={100} decay={2} />
      <ambientLight intensity={0.08} color="#1a1a2e" />
      {showMeteors && meteors.map(meteor => (
        <EnhancedMeteor key={meteor.id} meteor={meteor} onCollision={() => audioManager.playExplosion()} />
      ))}
      <OrbitControls
        enableZoom enablePan={false} autoRotate={!selected} autoRotateSpeed={HUD_CONFIG.autoRotateSpeed * 0.4}
        minDistance={HUD_CONFIG.cameraMinDistance} maxDistance={HUD_CONFIG.cameraMaxDistance}
        dampingFactor={0.05} enableDamping target={[0, 0, 0]}
        maxPolarAngle={Math.PI * 0.85} minPolarAngle={Math.PI * 0.15}
      />
    </>
  )
}

export default GalaxyScene
