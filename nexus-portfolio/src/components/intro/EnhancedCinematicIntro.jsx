import { useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration, 
  Noise, 
  Vignette 
} from '@react-three/postprocessing'
import CinematicIntroScene from './CinematicIntroScene'
import { audioManager } from '../utils/AudioManager'
import { cinematicController } from '../system/SpaceCinematics'
import styles from './CinematicIntro.module.css'

const EnhancedCinematicIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('waiting')
  const [audioReady, setAudioReady] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [bootProgress, setBootProgress] = useState(0)
  const sequenceTimeoutRef = useRef(null)

  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioManager.init()
        audioManager.startMusic('symphonic-war', 1.5)
        audioManager.scheduleMusicTransition()
        setAudioReady(true)
      } catch {
        setAudioReady(true)
      }
    }

    const timer = setTimeout(initAudio, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (phase !== 'hologram') return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    sequenceTimeoutRef.current = setTimeout(() => {
      setPhase('explosion')
      audioManager.playExplosion()
    }, 5000)

    return () => {
      clearInterval(interval)
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'explosion') return

    sequenceTimeoutRef.current = setTimeout(() => {
      setPhase('zooming')
      cinematicController.playSequence('intro-explosion', () => {
        setPhase('complete')
        onComplete?.()
      })
    }, 4000)

    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current)
    }
  }, [phase, onComplete])

  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (phase === 'waiting') {
      const interval = setInterval(() => {
        setBootProgress(prev => Math.min(prev + Math.random() * 10, 100))
      }, 200)
      return () => clearInterval(interval)
    }
  }, [phase])

  if (phase === 'complete') return null

  return (
    <div className={`${styles.introFullscreen} ${phase === 'zooming' ? styles.zooming : ''}`}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <CinematicIntroScene phase={phase} countdown={countdown} />
        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          <ChromaticAberration offset={[0.0005, 0.0005]} />
          <Noise opacity={0.05} blendMode="overlay" />
          <Vignette offset={0.4} darkness={0.7} />
        </EffectComposer>
      </Canvas>

      {phase === 'waiting' && (
        <div className={styles.bootScreen}>
          <div className={styles.bootContent}>
            <div className={styles.bootRing}>
              <div className={styles.progressRing} style={{ '--progress': `${bootProgress}%` }}></div>
            </div>
            <p className={styles.bootText}>SYSTEM INITIALIZING</p>
            <p className={styles.bootSubtext}>Neural link established... {Math.floor(bootProgress)}%</p>
            {!audioReady && <span className={styles.clickHint}>Click anywhere to enable audio</span>}
          </div>
        </div>
      )}

      {phase === 'hologram' && (
        <>
          <div className={styles.hudOverlay}>
            <div className={styles.cornerDecor}></div>
            <div className={styles.countdownDisplay}>
              <span className={styles.countdownNumber}>{countdown}</span>
              <p className={styles.countdownLabel}>SYSTEM UNLOCK IN</p>
            </div>
          </div>
          <div className={styles.scanlines}></div>
        </>
      )}

      {phase === 'explosion' && (
        <div className={styles.explosionOverlay}>
          <div className={styles.warningText}>WARPDRIVE ENGAGED</div>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && audioReady && (
        <div className={styles.debugInfo}>
          Music: Symphonic War → Deep Space (4m)
        </div>
      )}
    </div>
  )
}

export default EnhancedCinematicIntro
