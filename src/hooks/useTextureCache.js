import { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Simple texture cache to avoid loading the same texture multiple times
const textureCache = new Map();

export const useTextureCache = () => {
  const cacheRef = useRef(textureCache);

  const getTexture = (path) => {
    if (cacheRef.current.has(path)) {
      return cacheRef.current.get(path);
    }

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      path,
      (loadedTexture) => {
        loadedTexture.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.warn(`Failed to load texture: ${path}`, error);
        // Create fallback texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create a gradient fallback
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        const fallbackTexture = new THREE.CanvasTexture(canvas);
        cacheRef.current.set(path, fallbackTexture);
      }
    );

    cacheRef.current.set(path, texture);
    return texture;
  };

  const disposeTexture = (path) => {
    if (cacheRef.current.has(path)) {
      const texture = cacheRef.current.get(path);
      texture.dispose();
      cacheRef.current.delete(path);
    }
  };

  const disposeAll = () => {
    cacheRef.current.forEach((texture) => {
      texture.dispose();
    });
    cacheRef.current.clear();
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      disposeAll();
    };
  }, []);

  return { getTexture, disposeTexture, disposeAll };
};
