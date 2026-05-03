import React, { useEffect, useState, useRef } from 'react';
import { audioManager } from '../utils/AudioManager';
import './HologramIntro.css';

import heroImg from '../../assets/hero.png';

export function HologramIntro({ onComplete }) {
  const [showHologram, setShowHologram] = useState(false);
  const [startTyping, setStartTyping] = useState(false);
  const [fadeIntro, setFadeIntro] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const initialDelay = setTimeout(() => {
      if (isMounted.current) {
        setShowHologram(true);
        audioManager.init().then(() => {
          audioManager.playWhoosh(2); // Initial appearance sound
        });
      }
    }, 400);

    // Start typing shortly after
    const typingDelay = setTimeout(() => {
      if (isMounted.current) {
        setStartTyping(true);
        
        // Rapid clicks for typing effect
        let typedCount = 0;
        const typeInterval = setInterval(() => {
          if (!isMounted.current || typedCount > 20) {
            clearInterval(typeInterval);
            return;
          }
          audioManager.playUI('click');
          typedCount++;
        }, 50);
      }
    }, 1200);

    // Fade out and transition — total intro now ~3.5s
    const endDelay = setTimeout(() => {
      if (isMounted.current) {
        setFadeIntro(true);
        setTimeout(() => {
          if (isMounted.current) onComplete();
        }, 800);
      }
    }, 3000);

    return () => {
      isMounted.current = false;
      clearTimeout(initialDelay);
      clearTimeout(typingDelay);
      clearTimeout(endDelay);
    };
  }, [onComplete]);

  return (
    <div className={`hologram-intro-container ${fadeIntro ? 'fade-out' : ''}`}>
      {showHologram && (
        <div className="hologram-wrapper">
          <img src={heroImg} alt="Hero Hologram" className="hologram-image" />
          <div className={`hologram-text ${startTyping ? 'typing' : ''}`}>
            Welcome to my portfolio
          </div>
        </div>
      )}
      <div className="scanlines-overlay" />
    </div>
  );
}
