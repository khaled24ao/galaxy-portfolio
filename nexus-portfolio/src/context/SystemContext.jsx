import { createContext, useContext, useState, useCallback } from 'react'

const SystemContext = createContext()

export const SystemProvider = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState(null)
  const [scene, setScene] = useState('intro') // 'intro' | 'galaxy'
  const [showGlitch, setShowGlitch] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [introPhase, setIntroPhase] = useState('waiting') // waiting, hologram, explosion, zooming, complete

  const selectProject = useCallback((project) => {
    setSelectedProject(project)
    setScene('galaxy')
  }, [])

  const closeHUD = useCallback(() => {
    setSelectedProject(null)
  }, [])

  const introComplete = useCallback(() => {
    setShowGlitch(true)
    setTimeout(() => {
      setScene('galaxy')
      setShowGlitch(false)
      setIntroPhase('complete')
    }, 800)
  }, [])

  const systemReady = useCallback(() => {
    setIsLoaded(true)
  }, [])

  // Update intro phase (used by cinematic intro)
  const setIntroPhaseState = useCallback((phase) => {
    setIntroPhase(phase)
  }, [])

  return (
    <SystemContext.Provider value={{
      scene,
      selectedProject,
      showGlitch,
      isLoaded,
      introPhase,
      selectProject,
      closeHUD,
      introComplete,
      systemReady,
      setIntroPhase: setIntroPhaseState
    }}>
      {children}
    </SystemContext.Provider>
  )
}

export const useSystem = () => {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider')
  }
  return context
}
