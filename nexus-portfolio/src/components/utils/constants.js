// Neon color palette for planets
export const NEON_COLORS = [
  '#00d4ff', // cyan
  '#9d4edd', // purple
  '#ff00ff', // pink
  '#feca57', // amber
  '#ff6b6b', // red
  '#2ecc71', // green
  '#ff9ff3', // light pink
  '#54a0ff', // blue
  '#5f27cd', // deep purple
  '#00d2d3', // teal
  '#ff9f43', // orange
  '#ee5a24', // red-orange
  '#2e86de', // royal blue
  '#10ac84'  // emerald
]

// HUD styling constants
export const HUD_CONFIG = {
  glassBg: 'rgba(5, 5, 20, 0.9)',
  glassBorder: 'rgba(0, 212, 255, 0.3)',
  neonGlow: '0 0 60px rgba(0, 212, 255, 0.2)',
  maxProjects: 14,
  galaxyRadius: 12,
  cameraMinDistance: 8,
  cameraMaxDistance: 30,
  autoRotateSpeed: 0.5,
  meteorSpawnRate: 0.01,
  maxMeteors: 5,
  meteorSpeed: 15,
  meteorFallSpeed: 8
}

// Animation timings (ms)
export const TIMINGS = {
  introDecode: 80,      // per character
  glitchDelay: 2000,
  glitchDuration: 800,
  hudSlideIn: 400,
  hudSlideOut: 300,
  hoverScale: 1.2,
  selectScale: 1.5,
  planetRotation: 0.5,
  floatSpeed: 2,
  floatIntensity: 0.2
}
