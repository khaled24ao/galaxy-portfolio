# NEXUS 2050 - AI Engineer Portfolio

> An interactive 3D web experience showcasing 14 AI/ML projects in a cinematic galaxy environment

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r158-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-red?logo=framer)](https://www.framer.com/motion/)

## Features

- **Cinematic intro** with decoding text and glitch transition effects
- **14 orbiting planets** — each representing an AI project with unique color and size
- **Interactive 3D scene** with smooth camera controls, hover effects, and click-to-open
- **HUD info panels** with Iron Man-style glassmorphism UI
- **Dynamic visual effects** — scanlines, vignette, neon glows, floating animations
- **Meteor system** with procedural spawning and particle trails
- **Audio integration** (requires sound files in `public/sounds/`)
- **Fully responsive** and optimized for 60 FPS

## Tech Stack

### Frontend
- **React** 18.2 — component architecture
- **Three.js** 0.158 — 3D rendering
- **@react-three/fiber** 8.15 — React renderer for Three.js
- **@react-three/drei** 9.96 — useful helpers and abstractions
- **Framer Motion** 11.0 — animations and gestures

### Build & Dev
- **Vite** 5.0 — fast build tooling
- **ES6 modules** — modern JavaScript

## Project Structure

```
nexus-portfolio/
├── public/
│   └── sounds/              # Audio files (ambient, SFX)
├── src/
│   ├── main.jsx             # Entry point
│   ├── App.jsx              # Root orchestration
│   ├── styles/
│   │   ├── globals.css      # Variables, reset, typography
│   │   └── animations.css   # Keyframes and utility animations
│   └── components/
│       ├── scenes/
│       │   ├── GalaxyScene.jsx      # Main 3D scene (planets, lights, camera)
│       │   ├── ProjectPlanet.jsx    # Individual planet mesh
│       │   ├── Meteor.jsx           # Meteor particle effects
│       │   ├── StarField.jsx        # Background star particle system
│       │   └── Scene3D.jsx          # Canvas wrapper
│       ├── layout/
│       │   ├── HUDInfoPanel.jsx     # Project info overlay (glassmorphism)
│       │   ├── HUDInfoPanel.module.css
│       │   ├── HUDRenderer.jsx      # HUD system wrapper
│       │   ├── HUDRenderer.module.css
│       │   ├── HUDCornerDecor.jsx   # Decorative corner brackets
│       │   └── HUDCornerDecor.module.css
│       ├── intro/
│       │   ├── CinematicIntro.jsx   # Opening sequence with text decoding
│       │   └── CinematicIntro.module.css
│       ├── system/
│       │   ├── GlitchOverlay.jsx    # Transition glitch effect
│       │   └── GlitchOverlay.module.css
│       ├── utils/
│       │   ├── projectsData.js      # 14 project configurations (complete)
│       │   ├── constants.js         # Color palette, timings, HUD config
│       │   └── AudioManager.js      # Centralized sound control
│       └── context/
│           └── SystemContext.jsx    # Global state provider
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

## Installation & Usage

```bash
cd nexus-portfolio
npm install
npm run dev
```

Visit **http://localhost:5173** in your browser.

**Note:** Audio requires user interaction (click anywhere) to enable due to browser autoplay policies.

## Adding Audio Files

Place the following MP3/WAV files in `public/sounds/`:

- `ambient-space.mp3` — continuous background (loop, ~3 min)
- `hover-planet.mp3` — planet hover beep (0.3s)
- `click-planet.mp3` — selection click (0.2s)
- `hud-open.mp3` — panel open whoosh (0.5s)
- `hud-close.mp3` — panel close swoosh (0.3s)
- `glitch-transition.mp3` — digital glitch (0.8s)
- `meteor-explosion.mp3` — meteor impact (0.4s)

If files are missing, audio gracefully degrades (silent).

## Customizing Projects

All project data lives in **`src/components/utils/projectsData.js`**. Each project object supports:

```javascript
{
  id: 1,
  name: "Project Name",
  description: "Short tagline",
  fullDescription: "Full detailed description",
  tech: ["Tech1", "Tech2"],
  techIcons: ["🔧", "⚡"],
  stats: { metric1: "value1", metric2: "value2" },
  color: "#00d4ff",       // Neon color
  size: 1.2,              // Planet scale
  github: "https://...",
  demo: "https://...",
  category: "Category Name"
}
```

The color palette is defined in `constants.js` (`NEON_COLORS` array). Add more colors if needed.

## Credits

Built with **React + Three.js + Framer Motion**.

Designed to feel like a sci-fi video game—immersive, cinematic, and technically impressive.

---

🚀 *NEXUS 2050 — Where AI Meets the Stars*
