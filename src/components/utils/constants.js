export const COLORS = {
  neon: {
    cyan: '#00d4ff',
    purple: '#9d4edd',
    pink: '#ff00ff',
    amber: '#feca57',
    red: '#ff6b6b',
    green: '#2ecc71'
  },
  bg: {
    dark: '#000005',
    panel: 'rgba(5, 5, 20, 0.9)'
  }
};

export const CAMERA_SETTINGS = {
  position: [0, 5, 15],
  fov: 60,
  near: 0.1,
  far: 1000
};

export const ORBIT_CONTROLS = {
  enableZoom: true,
  enablePan: false,
  autoRotate: true,
  autoRotateSpeed: 2,
  minDistance: 8,
  maxDistance: 30,
  dampingFactor: 0.05,
  enableDamping: true
};

export const ANIMATION_TIMINGS = {
  intro: {
    charDelay: 100,
    glitchDuration: 800,
    waitBeforeGlitch: 2000
  },
  hud: {
    slideIn: 0.3,
    slideOut: 0.2
  },
  planet: {
    hoverScale: 1.2,
    selectScale: 1.5
  }
};
