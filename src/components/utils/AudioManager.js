import { Howl } from 'howler';

/* ═══════════════════════════════════════════════════
   AUDIO MANAGER — Full Cinematic Sound Design
   ═══════════════════════════════════════════════════ */

class AudioManager {
  constructor() {
    this.sounds = {};
    this.isInitialized = false;
    this.analyser = null;
    this.dataArray = null;
    this.isRiserPlaying = false;
    this._activeOscillators = [];
  }

  async init() {
    if (this.isInitialized) return;

    const soundFiles = {
      'nuclear-boom':    { path: '/sounds/nuclear-boom.mp3',    html5: false },
      'symphonic-war':   { 
        path: '/sounds/symphonic-war.mp3',   
        html5: true,
        onend: () => {
          this.playSound('space-ambient', { volume: 0.3, loop: true });
        }
      },
      'space-ambient':   { path: '/sounds/deep-space-ambient.mp3', html5: true },
      'intro-engine':    { path: '/sounds/deep-space-ambient.mp3', html5: true },
    };

    for (const [key, config] of Object.entries(soundFiles)) {
      try {
        this.sounds[key] = new Howl({
          src: [config.path],
          html5: config.html5,
          preload: true,
          volume: 0.5,
          onend: config.onend,
          onload: () => console.log(`[Audio] Loaded: ${key}`),
          onloaderror: (id, err) => console.warn(`[Audio] Load Error "${key}":`, err),
          onplayerror: (id, err) => {
            console.warn(`[Audio] Play Error "${key}":`, err);
            // Try to resume context and play again if it was a permissions issue
            this._ctx()?.resume().then(() => this.sounds[key].play());
          }
        });
      } catch (e) {
        console.warn(`[Audio] Error creating "${key}":`, e);
      }
    }

    this.isInitialized = true;

    try {
      this.analyser = Howler.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      Howler.masterGain.connect(this.analyser);
    } catch (e) {
      console.warn("[Audio] Could not init Analyser:", e);
    }

    console.log(">> 🔊 AudioManager Initialized.");
  }

  _ctx() {
    if (!this.isInitialized) return null;
    const ctx = Howler.ctx;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  getFrequencyData() {
    if (!this.analyser) return { average: 0, bass: 0, mid: 0, treble: 0 };
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) sum += this.dataArray[i];
    const avg = sum / this.dataArray.length;
    return {
      average: avg / 255,
      bass: (this.dataArray[1] || 0) / 255,
      mid: (this.dataArray[this.dataArray.length / 2] || 0) / 255,
      treble: (this.dataArray[this.dataArray.length - 2] || 0) / 255,
    };
  }

  // ─── FILE-BASED PLAYBACK ───
  playSound(name, options = {}) {
    if (name === 'tech-beep' || name === 'glitch-trans') {
      this.playUI(name === 'tech-beep' ? 'click' : 'success');
      return;
    }
    if (!this.sounds[name]) {
      console.warn(`[Audio] Sound not found: ${name}`);
      return;
    }
    try {
      console.log(`[Audio] Playing: ${name}`, options);
      const sound = this.sounds[name];
      this._ctx()?.resume(); // Force resume on every play attempt
      
      if (options.loop !== undefined) sound.loop(options.loop);
      if (options.fade) {
        sound.volume(0);
        sound.play();
        sound.fade(0, options.volume || 0.5, options.fade * 1000);
      } else {
        if (options.volume !== undefined) sound.volume(options.volume);
        sound.play();
      }
    } catch (e) {
      console.error(`[Audio] Exception playing "${name}":`, e);
    }
  }

  stopSound(name, fadeOut = 1000) {
    if (!this.sounds[name]) return;
    try {
      const sound = this.sounds[name];
      if (fadeOut > 0) {
        sound.fade(sound.volume(), 0, fadeOut);
        setTimeout(() => sound.stop(), fadeOut);
      } else {
        sound.stop();
      }
    } catch (e) {}
  }

  crossfade(fromName, toName, duration = 2000, toOptions = {}) {
    console.log(`[Audio] Crossfading ${fromName} -> ${toName}`);
    this.stopSound(fromName, duration);
    // Ensure the new sound plays immediately within the same call stack
    this.playSound(toName, { ...toOptions, fade: duration / 1000 });
  }

  // ═══════════════════════════════════════════════
  //  PROCEDURAL SOUND LIBRARY (Web Audio API)
  // ═══════════════════════════════════════════════

  playUI(type = 'click') {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (type) {
      case 'click': {
        const g = ctx.createGain();
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.setValueAtTime(1200, now);
        o.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        g.gain.setValueAtTime(0.15, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.08);
        break;
      }
      case 'hover': {
        const g = ctx.createGain();
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(500, now);
        o.frequency.linearRampToValueAtTime(600, now + 0.04);
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.04);
        break;
      }
      case 'success': {
        const g = ctx.createGain();
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        o1.frequency.setValueAtTime(600, now);
        o2.frequency.setValueAtTime(900, now + 0.08);
        g.gain.setValueAtTime(0.15, now);
        g.gain.linearRampToValueAtTime(0, now + 0.25);
        o1.connect(g); o2.connect(g); g.connect(ctx.destination);
        o1.start(now); o1.stop(now + 0.12);
        o2.start(now + 0.08); o2.stop(now + 0.25);
        break;
      }
      case 'scan': {
        const g = ctx.createGain();
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.setValueAtTime(100, now);
        o.frequency.exponentialRampToValueAtTime(3000, now + 0.12);
        g.gain.setValueAtTime(0.04, now);
        g.gain.linearRampToValueAtTime(0, now + 0.12);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.12);
        break;
      }
      case 'error': {
        const g = ctx.createGain();
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(150, now);
        o.frequency.linearRampToValueAtTime(80, now + 0.25);
        g.gain.setValueAtTime(0.2, now);
        g.gain.linearRampToValueAtTime(0, now + 0.25);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.25);
        break;
      }
    }
  }

  // ─── CINEMATIC: Camera whoosh ───
  playWhoosh(speed = 1) {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.4 / speed;

    // White noise burst shaped like a swoosh
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for wind-like character
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2500, now + dur * 0.3);
    filter.frequency.exponentialRampToValueAtTime(400, now + dur);
    filter.Q.value = 1.5;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.15 * speed, now + dur * 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur);
  }

  // ─── CINEMATIC: Deep rumble for sun/star events ───
  playDeepRumble(duration = 2) {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();

    o1.type = 'sine';
    o1.frequency.setValueAtTime(30, now);
    o1.frequency.linearRampToValueAtTime(50, now + duration);

    o2.type = 'sine';
    o2.frequency.setValueAtTime(55, now);
    o2.frequency.linearRampToValueAtTime(35, now + duration);

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.25, now + 0.3);
    g.gain.linearRampToValueAtTime(0.15, now + duration * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    o1.connect(g); o2.connect(g); g.connect(ctx.destination);
    o1.start(now); o1.stop(now + duration);
    o2.start(now); o2.stop(now + duration);
  }

  // ─── CINEMATIC: Planet lock-on (zoom to planet) ───
  playPlanetLock() {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Rising tone + click
    const g = ctx.createGain();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();

    o1.type = 'sine';
    o1.frequency.setValueAtTime(200, now);
    o1.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    o1.frequency.setValueAtTime(800, now + 0.15);

    o2.type = 'square';
    o2.frequency.setValueAtTime(1000, now + 0.15);
    o2.frequency.exponentialRampToValueAtTime(600, now + 0.22);

    g.gain.setValueAtTime(0.12, now);
    g.gain.linearRampToValueAtTime(0.18, now + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    o1.connect(g); o2.connect(g); g.connect(ctx.destination);
    o1.start(now); o1.stop(now + 0.18);
    o2.start(now + 0.15); o2.stop(now + 0.3);
  }

  // ─── CINEMATIC: Planet release (zoom out) ───
  playPlanetRelease() {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const g = ctx.createGain();
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(800, now);
    o.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + 0.25);
  }

  // ─── CINEMATIC: Deep pulsating sound for binary stars ───
  playBinaryPulsar(duration = 10) {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const g = ctx.createGain();
    const o = ctx.createOscillator();
    
    // Low, heavy frequency that drops even lower to simulate mass
    o.type = 'sine';
    o.frequency.setValueAtTime(65, now);
    o.frequency.linearRampToValueAtTime(35, now + duration);

    // LFO for the pulsating effect (amplitude modulation)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    // Starts slow (2Hz), speeds up dramatically as they spin faster (15Hz)
    lfo.frequency.setValueAtTime(2, now);
    lfo.frequency.exponentialRampToValueAtTime(15, now + duration * 0.9);
    lfo.frequency.linearRampToValueAtTime(30, now + duration);

    const lfoGain = ctx.createGain();
    // Depth of the pulsation increases over time
    lfoGain.gain.setValueAtTime(0.2, now);
    lfoGain.gain.linearRampToValueAtTime(0.8, now + duration);

    // Envelope for the main sound: starts soft, gets super loud, then stops
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.1, now + 2);
    g.gain.exponentialRampToValueAtTime(0.7, now + duration - 0.5);
    g.gain.linearRampToValueAtTime(0.001, now + duration);

    lfo.connect(lfoGain);
    lfoGain.connect(g.gain); // Modulate the main gain with the LFO
    
    o.connect(g);
    g.connect(ctx.destination);

    o.start(now); o.stop(now + duration);
    lfo.start(now); lfo.stop(now + duration);
    this._activeOscillators.push(o, lfo);
  }

  // ─── CINEMATIC: Title reveal (epic chord) ───
  playTitleReveal() {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 1.5;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.1);
    g.gain.linearRampToValueAtTime(0.08, now + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Major chord: C5, E5, G5
    [523, 659, 784].forEach(freq => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq;
      o.connect(g);
      o.start(now);
      o.stop(now + dur);
    });
    g.connect(ctx.destination);
  }

  // ─── CINEMATIC: Panel open/close ───
  playPanelOpen() {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const g = ctx.createGain();
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(300, now);
    o.frequency.exponentialRampToValueAtTime(700, now + 0.1);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + 0.12);
  }

  playPanelClose() {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const g = ctx.createGain();
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(700, now);
    o.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + 0.12);
  }



  // ═══ HIGH-LEVEL CINEMATIC METHODS ═══

  playHeavyExplosion() {
    if (!this.isInitialized) return;
    // Duck music only if it's already playing
    const music = this.sounds['symphonic-war'];
    if (music && music.playing()) {
      music.fade(music.volume(), 0.05, 80);
      setTimeout(() => {
        if (music.playing()) music.fade(0.05, 0.8, 5000);
      }, 2000);
    }
    // Play boom file
    const boom = this.sounds['nuclear-boom'];
    if (boom) {
      boom.rate(0.8 + Math.random() * 0.4);
      boom.volume(0.9);
      boom.play();
    }
    // Add procedural sub-bass layer
    this.playDeepRumble(3);
  }

  playEnergyRiser(duration = 10) {
    const ctx = this._ctx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = 'sawtooth';
    o.frequency.setValueAtTime(50, now);
    o.frequency.exponentialRampToValueAtTime(800, now + duration);

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.3, now + duration * 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(5000, now + duration);

    o.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);

    o.start(now);
    o.stop(now + duration);
    this._activeOscillators.push(o);
  }

  stopAmbient() {
    this.stopSound('intro-engine');
    this.stopSound('space-ambient');
  }

  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      try { sound.stop(); } catch(e) {}
    });
    this._activeOscillators.forEach(o => {
      try { o.stop(); o.disconnect(); } catch(e) {}
    });
    this._activeOscillators = [];
  }
}

export const audioManager = new AudioManager();