import { useRef, useEffect, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audioManager } from '../utils/AudioManager'

class CinematicController {
  constructor() {
    this.camera = null
    this.scene = null
    this.isPlaying = false
    this.currentSequence = null
    this.sequenceStartTime = 0
    this.sequenceDuration = 0
    this.keyframes = []
    this.currentKeyframe = 0
    this.onComplete = null
    this.interrupted = false
  }

  setCameraAndScene(camera, scene) {
    this.camera = camera
    this.scene = scene
  }

  // Easing functions
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  }

  smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
  }

  // Spherical linear interpolation for smooth rotations
  slerpQuaternions(q1, q2, t) {
    const result = new THREE.Quaternion()
    result.copy(q1).slerp(q2, t)
    return result
  }

  interpolateVector3(v1, v2, t) {
    return new THREE.Vector3().lerpVectors(v1, v2, t)
  }

  async playSequence(sequenceName, onComplete) {
    if (this.isPlaying) this.stopSequence()
    
    this.isPlaying = true
    this.interrupted = false
    this.onComplete = onComplete
    this.sequenceStartTime = performance.now()

    switch (sequenceName) {
      case 'intro-explosion':
        await this.playIntroExplosionSequence()
        break
      case 'planet-tour':
        await this.playPlanetTourSequence()
        break
      case 'black-hole-transition':
        await this.playBlackHoleTransition()
        break
      case 'panoramic':
        await this.playPanoramicSequence()
        break
      default:
        console.warn(`Unknown sequence: ${sequenceName}`)
        this.isPlaying = false
    }

    if (!this.interrupted && this.onComplete) {
      this.onComplete()
    }
    this.isPlaying = false
  }

  async playIntroExplosionSequence() {
    const duration = 6000 // 6 seconds total
    const startTime = performance.now()

    // Starting camera position: far away, looking at center
    const startPos = new THREE.Vector3(0, 5, 40)
    const startTarget = new THREE.Vector3(0, 0, 0)
    
    // After explosion: fly through the explosion toward planets
    const midPos = new THREE.Vector3(0, 0, 5)
    const midTarget = new THREE.Vector3(0, 0, 0)

    return new Promise(resolve => {
      const animate = () => {
        if (this.interrupted) {
          resolve()
          return
        }

        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / duration, 1)

        // Phase 1: 0-40% - Approach explosion
        if (t < 0.4) {
          const localT = this.easeInOutQuad(t / 0.4)
          this.camera.position.lerpVectors(startPos, midPos, localT)
        }
        // Phase 2: 40-100% - Accelerate through
        else {
          const localT = this.easeInOutQuad((t - 0.4) / 0.6)
          const speed = 10 + localT * 50
          this.camera.position.z = 5 - speed * 0.01
        }

        this.camera.lookAt(startTarget)

        if (t < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      animate()
    })
  }

  async playPlanetTourSequence(planets = [], visitDuration = 3) {
    if (!planets || planets.length === 0) return

    const totalDuration = planets.length * (visitDuration * 1000 + 2000) // visit + transition
    const startTime = performance.now()
    const cameraStartPos = this.camera.position.clone()

    return new Promise(resolve => {
      const animate = () => {
        if (this.interrupted) {
          resolve()
          return
        }

        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / totalDuration, 1)

        // Calculate which planet we're visiting
        const segmentDuration = (visitDuration + 2) * 1000
        const currentSegment = Math.min(Math.floor(elapsed / segmentDuration), planets.length - 1)
        const segmentProgress = (elapsed % segmentDuration) / segmentDuration

        if (currentSegment < planets.length) {
          const planet = planets[currentSegment]
          const planetPos = new THREE.Vector3(planet.position.x, planet.position.y, planet.position.z)
          
          // Offset camera to show planet with nice angle
          const offset = new THREE.Vector3(3, 2, 3).normalize().multiplyScalar(planet.size * 4)
          const targetPos = planetPos.clone().add(offset)

          if (segmentProgress < 0.2) {
            // Transition to planet
            const localT = this.easeInOutCubic(segmentProgress / 0.2)
            this.camera.position.lerpVectors(
              currentSegment === 0 ? cameraStartPos : this.getPreviousPlanetPos(planets, currentSegment),
              targetPos,
              localT
            )
          } else if (segmentProgress > 0.8) {
            // Transition to next planet
            const localT = this.easeInOutCubic((segmentProgress - 0.8) / 0.2)
            const nextPlanet = planets[currentSegment + 1]
            if (nextPlanet) {
              const nextOffset = new THREE.Vector3(3, 2, 3).normalize().multiplyScalar(nextPlanet.size * 4)
              const nextTargetPos = new THREE.Vector3(nextPlanet.position.x, nextPlanet.position.y, nextPlanet.position.z).add(nextOffset)
              this.camera.position.lerpVectors(targetPos, nextTargetPos, localT)
            }
          }

          this.camera.lookAt(planetPos)
        }

        if (t < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      animate()
    })
  }

  getPreviousPlanetPos(planets, index) {
    if (index === 0) {
      return new THREE.Vector3(0, 0, 20)
    }
    const prev = planets[index - 1]
    const offset = new THREE.Vector3(3, 2, 3).normalize().multiplyScalar(prev.size * 4)
    return new THREE.Vector3(prev.position.x, prev.position.y, prev.position.z).add(offset)
  }

  async playBlackHoleTransition() {
    const duration = 5000
    const startTime = performance.now()
    const startPos = this.camera.position.clone()
    const endPos = new THREE.Vector3(0, 0, 0)
    const startFov = this.camera.fov
    const endFov = 120 // Ultra wide for warping

    return new Promise(resolve => {
      const animate = () => {
        if (this.interrupted) {
          resolve()
          return
        }

        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / duration, 1)

        // Spiral into black hole
        const spiralT = this.easeInOutQuad(t)
        
        // Radial approach with spiral
        const angle = t * Math.PI * 4
        const radius = (1 - spiralT) * 10
        
        this.camera.position.x = Math.cos(angle) * radius
        this.camera.position.y = Math.sin(angle) * radius * 0.3
        this.camera.position.z = (1 - t) * 5

        // Extreme FOV for warping effect
        this.camera.fov = startFov + (endFov - startFov) * spiralT
        this.camera.updateProjectionMatrix()

        this.camera.lookAt(0, 0, 0)

        if (t < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      animate()
    })
  }

  async playPanoramicSequence(duration = 30000) {
    const startTime = performance.now()
    const radius = 25
    const startAngle = 0

    return new Promise(resolve => {
      const animate = () => {
        if (this.interrupted) {
          resolve()
          return
        }

        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / duration, 1)

        // Slow rotation around the galaxy
        const angle = startAngle + t * Math.PI * 2
        
        this.camera.position.x = Math.cos(angle) * radius
        this.camera.position.z = Math.sin(angle) * radius
        this.camera.position.y = Math.sin(t * Math.PI * 2) * 5 // Bob up and down

        this.camera.lookAt(0, 0, 0)

        if (t < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      animate()
    })
  }

  stopSequence() {
    this.interrupted = true
    this.isPlaying = false
    if (this.musicTransitionTimeout) {
      clearTimeout(this.musicTransitionTimeout)
    }
  }

  resetCameraToDefault() {
    if (this.camera) {
      this.camera.position.set(0, 0, 20)
      this.camera.fov = 60
      this.camera.updateProjectionMatrix()
      this.camera.lookAt(0, 0, 0)
    }
  }

  focusOnPlanet(planetPosition, planetSize, duration = 2000) {
    if (!this.camera) return

    const startPos = this.camera.position.clone()
    const offset = new THREE.Vector3(3, 2, 3).normalize().multiplyScalar(planetSize * 4)
    const targetPos = new THREE.Vector3(planetPosition.x, planetPosition.y, planetPosition.z).add(offset)
    
    const startTime = performance.now()

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / duration, 1)
        const eased = this.easeInOutCubic(t)

        this.camera.position.lerpVectors(startPos, targetPos, eased)
        this.camera.lookAt(planetPosition)

        if (t < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      animate()
    })
  }
}

export const cinematicController = new CinematicController()

export const useCinematicController = () => {
  const { camera } = useThree()
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    cinematicController.setCameraAndScene(camera, null)
  }, [camera])

  const playSequence = useCallback(async (sequenceName, onComplete) => {
    setIsPlaying(true)
    await cinematicController.playSequence(sequenceName, onComplete)
    setIsPlaying(false)
  }, [])

  const stopSequence = useCallback(() => {
    cinematicController.stopSequence()
    setIsPlaying(false)
  }, [])

  return {
    playSequence,
    stopSequence,
    isPlaying,
    cinematicController
  }
}
