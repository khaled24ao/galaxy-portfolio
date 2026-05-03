import { useSystem } from '../../context/SystemContext'
import HUDInfoPanel from './HUDInfoPanel'
import HUDCornerDecor from './HUDCornerDecor'
import { audioManager } from '../utils/AudioManager'
import styles from './HUDRenderer.module.css'

const HUDRenderer = () => {
  const { selectedProject, closeHUD } = useSystem()

  const handleBackdropClick = () => {
    if (selectedProject) {
      audioManager.playSound('hud-close')
      closeHUD()
    }
  }

  return (
    <div className={styles.hudRenderer}>
      {/* Background click handler */}
      {selectedProject && (
        <div className={styles.backdrop} onClick={handleBackdropClick} />
      )}

      {/* HUD Info Panel */}
      {selectedProject && (
        <HUDInfoPanel
          project={selectedProject}
          onClose={closeHUD}
        />
      )}

      {/* Corner decorations (always visible) */}
      <HUDCornerDecor position="all" />

      {/* Scanning line effect */}
      <div className={styles.scanline} />

      {/* Ambient glow border */}
      <div className={styles.glowBorder} />
    </div>
  )
}

export default HUDRenderer
