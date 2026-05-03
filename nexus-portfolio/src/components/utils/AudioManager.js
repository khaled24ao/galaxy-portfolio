class AudioManager {
  constructor() {
    this.initialized = false
    this.audioContext = null
    this.soundUrls = {}
    this.currentAmbient = null
    this.currentMusic = null
    this.volume = 1
    this.muted = false
    this.musicVolume = 0.4
    this.ambientVolume = 0.15
    this.sfxVolume = 0.6
    this.musicTransitionTimeout = null
    this.introMusicDuration = 4 * 60 * 1000 // 4 minutes in ms
  }

  async init() {
    if (this.initialized) return

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()

      this.soundUrls = {
        // Music tracks
        'symphonic-war': '/sounds/symphonic-war.mp3',
        'deep-space-ambient': '/sounds/deep-space-ambient.mp3',
        
        // SFX
        ambient: '/sounds/ambient-space.mp3',
        hover: '/sounds/hover-planet.mp3',
        click: '/sounds/click-planet.mp3',
        'hud-open': '/sounds/hud-open.mp3',
        'hud-close': '/sounds/hud-close.mp3',
        glitch: '/sounds/glitch-transition.mp3',
        explosion: '/sounds/nuclear-boom.mp3',
      }

      this.initialized = true
      console.log('[AudioManager] Initialized')
    } catch (error) {
      console.warn('[AudioManager] Init failed:', error)
    }
  }

  playSound(soundName, options = {}) {
    if (!this.initialized || this.muted) return

    const url = this.soundUrls[soundName]
    if (!url) {
      console.warn(`[AudioManager] Sound not found: ${soundName}`)
      return
    }

    const audio = new Audio(url)
    audio.volume = (options.volume || this.sfxVolume) * this.volume
    audio.loop = options.loop || false

    audio.play().catch(err => {
      console.debug('[AudioManager] Playback failed:', err.message)
    })
  }

  startMusic(trackName, fadeIn = 1.0) {
    if (!this.initialized) return
    this.stopMusic()

    const url = this.soundUrls[trackName]
    if (!url) return

    const audio = new Audio(url)
    audio.loop = trackName === 'deep-space-ambient'
    audio.volume = 0
    audio.play().catch(() => {})
    
    this.currentMusic = audio

    // Fade in
    const fadeSteps = 20
    const fadeInterval = (fadeIn * 1000) / fadeSteps
    let step = 0
    
    const fadeIntervalId = setInterval(() => {
      step++
      const targetVol = trackName === 'symphonic-war' ? this.musicVolume : this.ambientVolume
      audio.volume = (step / fadeSteps) * targetVol * this.volume
      
      if (step >= fadeSteps) {
        clearInterval(fadeIntervalId)
      }
    }, fadeInterval)
  }

  stopMusic(fadeOut = 0.5) {
    if (!this.currentMusic) return

    const audio = this.currentMusic
    const fadeSteps = 10
    const fadeInterval = (fadeOut * 1000) / fadeSteps
    let step = 0

    const fadeIntervalId = setInterval(() => {
      step++
      audio.volume = (1 - step / fadeSteps) * audio.volume
      
      if (step >= fadeSteps) {
        clearInterval(fadeIntervalId)
        audio.pause()
        audio.currentTime = 0
        if (this.currentMusic === audio) {
          this.currentMusic = null
        }
      }
    }, fadeInterval)
  }

  scheduleMusicTransition() {
    if (this.musicTransitionTimeout) {
      clearTimeout(this.musicTransitionTimeout)
    }

    this.musicTransitionTimeout = setTimeout(() => {
      this.transitionToAmbient()
    }, this.introMusicDuration)
  }

  transitionToAmbient() {
    this.stopMusic(2.0) // 2 second fade
    setTimeout(() => {
      this.startMusic('deep-space-ambient', 3.0)
    }, 1000)
  }

  startAmbient() {
    if (!this.initialized) return
    this.stopAmbient()

    try {
      const audio = new Audio(this.soundUrls.ambient)
      audio.loop = true
      audio.volume = this.ambientVolume * this.volume
      audio.play().catch(() => {})
      this.currentAmbient = audio
    } catch (error) {
      console.warn('[AudioManager] Ambient start failed:', error)
    }
  }

  stopAmbient() {
    if (this.currentAmbient) {
      this.currentAmbient.pause()
      this.currentAmbient = null
    }
  }

  playExplosion() {
    this.playSound('explosion', { volume: 1.2 })
  }

  getVolume() { return this.volume || 1 }
  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)) }
  toggleMute() { this.muted = !this.muted }
  isMuted() { return this.muted }
}

export const audioManager = new AudioManager()
