import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration, 
  Noise, 
  Vignette,
  DepthOfField
} from '@react-three/postprocessing'
import * as THREE from 'three'

const PostProcessing = ({ 
  enableBloom = true,
  enableChromatic = true,
  enableNoise = true,
  enableVignette = true,
  enableDOF = false,
  focusedObject = null
}) => {
  const { camera, scene } = useThree()

  const blurMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial()
  }, [])

  return (
    <EffectComposer>
      {/* Bloom for glow effects */}
      {enableBloom && (
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      )}

      {/* Subtle chromatic aberration for cinematic feel */}
      {enableChromatic && (
        <ChromaticAberration
          offset={[0.001, 0.001]}
          radialModulation={false}
          modulationOffset={0.5}
        />
      )}

      {/* Film grain */}
      {enableNoise && (
        <Noise
          opacity={0.08}
          blendMode="overlay"
        />
      )}

      {/* Vignette for depth */}
      {enableVignette && (
        <Vignette
          offset={0.3}
          darkness={0.8}
        />
      )}

      {/* Depth of field (when focused on object) */}
      {enableDOF && focusedObject && (
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
      )}
    </EffectComposer>
  )
}

export default PostProcessing
