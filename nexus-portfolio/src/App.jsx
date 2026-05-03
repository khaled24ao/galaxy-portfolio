import { useState, useEffect } from 'react'
import { SystemProvider, useSystem } from './context/SystemContext'
import Scene3D from './components/scenes/Scene3D'
import EnhancedCinematicIntro from './components/intro/EnhancedCinematicIntro'
import HUDRenderer from './components/layout/HUDRenderer'
import { audioManager } from './components/utils/AudioManager'
import './styles/globals.css'
import './styles/animations.css'

const AppContent = () => {
  const { scene, selectedProject, showGlitch, introComplete, selectProject, closeHUD } = useSystem()

  const handleIntroComplete = () => {
    introComplete()
  }

  // Handle initial load if scene is intro
  if (scene === 'intro') {
    return (
      <EnhancedCinematicIntro 
        onComplete={handleIntroComplete}
      />
    )
  }

  // Main galaxy scene
  return (
    <div className="app-container">
      {/* 3D Scene */}
      <Scene3D
        onProjectSelect={selectProject}
        selected={selectedProject}
        showMeteors={true}
      />

      {/* HUD Renderer (panels, corners) */}
      <HUDRenderer />

      {/* Glitch overlay during transitions */}
      {showGlitch && (
        <div className="glitch-overlay-global">
          {/* Handled by CSS overlay */}
        </div>
      )}

      {/* Audio controls (hidden UI) */}
      <AudioControls />
    </div>
  )
}

// Hidden audio controls component
const AudioControls = () => {
  useEffect(() => {
    // Keyboard shortcuts for dev
    const handleKeyDown = (e) => {
      if (e.key === 'm' && e.ctrlKey) {
        audioManager.toggleMute()
        console.log('Audio:', audioManager.isMuted() ? 'Muted' : 'Unmuted')
      }
      if (e.key === 'r' && e.ctrlKey) {
        audioManager.stopMusic()
        audioManager.startMusic('symphonic-war', 1.0)
        audioManager.scheduleMusicTransition()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}

function App() {
  return (
    <SystemProvider>
      <AppContent />
    </SystemProvider>
  )
}

export default App
