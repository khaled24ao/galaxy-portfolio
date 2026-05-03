import { motion, AnimatePresence } from 'framer-motion'
import styles from './GlitchOverlay.module.css'

const GlitchOverlay = ({ active, onComplete }) => {
  if (!active) return null

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, times: [0, 0.5, 1] }}
        onAnimationComplete={onComplete}
      >
        <div className={styles.scanline} />
        <div className={styles.staticNoise} />
        <div className={styles.colorShift} />
      </motion.div>
    </AnimatePresence>
  )
}

export default GlitchOverlay
