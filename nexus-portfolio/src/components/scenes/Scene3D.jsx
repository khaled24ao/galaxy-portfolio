import { Canvas } from '@react-three/fiber'
import GalaxyScene from '../scenes/GalaxyScene'
import PostProcessing from '../effects/PostProcessing'

const Scene3D = ({ onProjectSelect, selected, showMeteors = true }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <GalaxyScene
        onProjectSelect={onProjectSelect}
        selected={selected}
        showMeteors={showMeteors}
      />
      <PostProcessing
        enableBloom={true}
        enableChromatic={true}
        enableNoise={true}
        enableVignette={true}
      />
    </Canvas>
  )
}

export default Scene3D
