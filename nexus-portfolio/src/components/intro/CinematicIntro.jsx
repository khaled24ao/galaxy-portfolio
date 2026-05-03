import { useEffect, useState } from 'react'
import { audioManager } from '../utils/AudioManager'
import styles from './CinematicIntro.module.css'

const CinematicIntro = ({ onComplete }) => {
  const [displayedText, setDisplayedText] = useState('')
  const fullText = 'WELCOME TO THE NEXUS'
  const [showGlitch, setShowGlitch] = useState(false)
  const [bootComplete, setBootComplete] = useState(false)

  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = async () => {
      await audioManager.init()
      audioManager.startAmbient()
      setBootComplete(true)
    }

    // Add click listener for audio initialization (browser autoplay policy)
    const handleClick = () => {
      initAudio()
      document.removeEventListener('click', handleClick)
    }

    document.addEventListener('click', handleClick, { once: true })

    // If already interacted (rare), initialize immediately
    if (document.readyState === 'complete') {
      initAudio()
    }

    // Text decoding effect
    let index = 0
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(prev => prev + fullText[index])
        index++
      } else {
        clearInterval(interval)
        // Wait then trigger glitch transition
        setTimeout(() => {
          setShowGlitch(true)
          audioManager.playSound('glitch')
          setTimeout(onComplete, 800)
        }, 2000)
      }
    }, 80) // char per 80ms

    return () => {
      clearInterval(interval)
      document.removeEventListener('click', handleClick)
    }
  }, [onComplete])

  return (
    <div className={styles.intro}>
      <div className={styles.bg} />

      {/* Main text */}
      <div className={styles.content}>
        <h1 className={`${styles.glitchText} ${showGlitch ? styles.glitchActive : ''}`} data-text={displayedText}>
          {displayedText}
        </h1>
        <p className={styles.subtitle}>AI Engineer Portfolio — 2050</p>
      </div>

      {/* Boot sequence indicator */}
      {!bootComplete && (
        <div className={styles.bootIndicator}>
          <div className={styles.bootDot} />
          <span>Initializing system...</span>
        </div>
      )}

      {/* Scanlines overlay */}
      <div className={styles.scanlines} />

      {/* Glitch overlay */}
      {showGlitch && (
        <div className={styles.glitchOverlay}>
          <div className={styles.glitchBar} style={{ top: '20%' }} />
          <div className={styles.glitchBar} style={{ top: '50%' }} />
          <div className={styles.glitchBar} style={{ top: '80%' }} />
        </div>
      )}

      {/* Vignette */}
      <div className={styles.vignette} />
    </div>
  )
}

export default CinematicIntro
