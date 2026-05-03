import { motion, AnimatePresence } from 'framer-motion'
import { useSystem } from '../../context/SystemContext'
import { audioManager } from '../utils/AudioManager'
import styles from './HUDInfoPanel.module.css'

const HUDInfoPanel = ({ project, onClose }) => {
  const { closeHUD } = useSystem()

  if (!project) return null

  const handleClose = () => {
    audioManager.playSound('hud-close')
    onClose()
    closeHUD()
  }

  return (
    <AnimatePresence>
      <motion.div
        className={styles.hudOverlay}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.hudPanel}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleClose}>×</button>

        {/* Header with color indicator */}
        <div className={styles.header}>
          <div
            className={styles.indicator}
            style={{ background: project.color }}
          />
          <h2 className={styles.title}>{project.name}</h2>
          <span className={styles.id}>#{project.id.toString().padStart(2, '0')}</span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Short description */}
          <p className={styles.description}>{project.description}</p>

          {/* Tech Stack */}
          <section className={styles.section}>
            <h3>TECH STACK</h3>
            <div className={styles.techList}>
              {project.tech.map((tech, i) => (
                <span key={i} className={styles.techItem}>
                  {project.techIcons?.[i] || '•'} {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Statistics */}
          <section className={styles.section}>
            <h3>STATISTICS</h3>
            <div className={styles.statsGrid}>
              {Object.entries(project.stats).map(([key, val]) => (
                <div key={key} className={styles.statItem}>
                  <span className={styles.statLabel}>{key.toUpperCase()}</span>
                  <span className={styles.statValue}>{val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Full description */}
          <section className={styles.section}>
            <h3>DETAILS</h3>
            <p className={styles.fullDesc}>{project.fullDescription}</p>
          </section>

          {/* Action buttons */}
          <div className={styles.actions}>
            <a href={project.github} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.githubBtn}`}>
              <span>GitHub Repository</span>
            </a>
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.demoBtn}`}>
              <span>Live Demo</span>
            </a>
          </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default HUDInfoPanel
