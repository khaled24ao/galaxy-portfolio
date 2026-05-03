import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../system/GlitchOverlay.css';

export function GlitchOverlay({ visible = false, duration = 0.3 }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="glitch-overlay-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          <div className="glitch-line top" />
          <div className="glitch-line middle" />
          <div className="glitch-line bottom" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
