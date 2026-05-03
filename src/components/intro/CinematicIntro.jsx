// src/components/intro/CinematicIntro.jsx
import React, { useEffect, useState, useRef } from 'react';
import { audioManager } from '../utils/AudioManager';
import './CinematicIntro.css';

const bootLines = [
  { text: ">> SYSTEM_BOOT_SEQUENCE [NEXUS_v4.1.2]", type: "command" },
  { text: ">> INITIALIZING BIO-LINK INTERFACE...", type: "normal" },
  { text: ">> LOADING NEURAL NETWORKS...", type: "normal" },
  { text: ">> MODEL: LLaMA 3.1 405B CORE [ONLINE]", type: "success" },
  { text: ">> ESTABLISHING QUANTUM LINK TO GROQ_API...", type: "normal" },
  { text: ">> LATENCY: < 1ms [HYPER-FAST]", type: "success" },
  { text: ">> DECRYPTING PROJECT DATA SPHERES...", type: "normal" },
  { text: ">> SYNCING GALAXY_SCENE RENDERER...", type: "normal" },
  { text: ">> AUTHENTICATING USER: KHALED_AO [GRANTED]", type: "success" },
  { text: ">> WARNING: GRAVITATIONAL DISTORTION DETECTED NEAR HUB", type: "warning" },
  { text: ">> ALL SYSTEMS OPERATIONAL.", type: "success" },
  { text: ">> ENTERING THE NEXUS.", type: "command" },
];

export function CinematicIntro({ onComplete }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [showMainTitle, setShowMainTitle] = useState(false);
  const [fadeIntro, setFadeIntro] = useState(false);
  const textEndRef = useRef();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 1. تهيئة الصوت وتشغيل خلفية المحرك
    audioManager.init().then(() => {
      if (isMounted.current) {
        audioManager.playSound('intro-engine', { loop: true, volume: 0.3 });
      }
    });

    let lineIndex = 0;
    const printLine = () => {
      if (!isMounted.current) return;

      if (lineIndex < bootLines.length) {
        setDisplayedLines(prev => [...prev, bootLines[lineIndex]]);

        // استخدام تقنية الـ Web Audio للبيبات السريعة
        audioManager.playUI('click');

        lineIndex++;
        const delay = Math.random() * 60 + 20;
        setTimeout(printLine, delay);
      } else {
        // 2. إظهار العنوان الرئيسي بعد انتهاء الأكواد
        setTimeout(() => {
          if (isMounted.current) {
            setShowMainTitle(true);
            audioManager.playTitleReveal(); // Epic chord for NEXUS title
          }
        }, 800);

        // 3. بدء التلاشي الصوتي والبصري
        setTimeout(() => {
          if (isMounted.current) {
            setFadeIntro(true);
            audioManager.stopAmbient();
          }
        }, 4500);

        // 4. الانتقال النهائي للمجرة
        setTimeout(() => {
          if (isMounted.current) {
            audioManager.playWhoosh(2); // Dramatic exit whoosh
            // وقت كافٍ لصوت الجليتش قبل تدمير الـ Component
            setTimeout(() => {
              if (isMounted.current) onComplete();
            }, 600);
          }
        }, 5500);
      }
    };

    const startDelay = setTimeout(printLine, 500);

    return () => {
      isMounted.current = false;
      clearTimeout(startDelay);
    };
  }, [onComplete]);

  // عمل Scroll تلقائي مع كل سطر جديد
  useEffect(() => {
    textEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedLines]);

  return (
    <div className={`cinematic-intro-container ${fadeIntro ? 'fade-out' : ''}`}>
      {!showMainTitle && (
        <div className="system-boot-hud">
          {displayedLines.map((line, index) => (
            <p key={index} className={`boot-text-line ${line?.type || 'normal'}`}>
              {line?.text || ""}
            </p>
          ))}
          <div ref={textEndRef} />
        </div>
      )}

      <div className={`main-title-container ${showMainTitle ? 'active' : ''}`}>
        <h1 className="nexus-main-title">NEXUS</h1>
        <p className="nexus-subtitle">AI ENGINEER PORTFOLIO 2026</p>
      </div>

      <div className="scanlines-overlay" />
    </div>
  );
}