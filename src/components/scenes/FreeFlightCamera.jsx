import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   FREE FLIGHT CAMERA CONTROLLER
   WASD + mouse look when right-click held
   Shift = fast, normal = medium, slow when zoomed in
   ═══════════════════════════════════════════════ */

export function FreeFlightCamera({ active = false, speed = 80 }) {
  const { camera, gl } = useThree();
  const keys     = useRef({});
  const mouseDelta = useRef({ x: 0, y: 0 });
  const isRMB    = useRef(false);
  const euler    = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const vel      = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!active) return;

    const onKey = (e) => { keys.current[e.code] = e.type === 'keydown'; };
    const onMouseDown = (e) => { if (e.button === 2) { isRMB.current = true; gl.domElement.requestPointerLock?.(); } };
    const onMouseUp   = (e) => { if (e.button === 2) { isRMB.current = false; document.exitPointerLock?.(); } };
    const onMouseMove = (e) => {
      if (isRMB.current) {
        mouseDelta.current.x += e.movementX;
        mouseDelta.current.y += e.movementY;
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup',   onKey);
    gl.domElement.addEventListener('mousedown', onMouseDown);
    gl.domElement.addEventListener('mouseup',   onMouseUp);
    gl.domElement.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup',   onKey);
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      gl.domElement.removeEventListener('mouseup',   onMouseUp);
      gl.domElement.removeEventListener('mousemove', onMouseMove);
      document.exitPointerLock?.();
    };
  }, [active, gl]);

  useFrame((_, delta) => {
    if (!active) return;

    // Mouse look
    if (isRMB.current && (mouseDelta.current.x !== 0 || mouseDelta.current.y !== 0)) {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= mouseDelta.current.x * 0.002;
      euler.current.x -= mouseDelta.current.y * 0.002;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
      mouseDelta.current.x = 0;
      mouseDelta.current.y = 0;
    }

    // WASD movement
    const k = keys.current;
    const spd = (k['ShiftLeft'] || k['ShiftRight']) ? speed * 4 : speed;
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    const right = new THREE.Vector3();
    right.crossVectors(fwd, camera.up).normalize();

    vel.current.set(0, 0, 0);
    if (k['KeyW'] || k['ArrowUp'])   vel.current.addScaledVector(fwd,  1);
    if (k['KeyS'] || k['ArrowDown']) vel.current.addScaledVector(fwd, -1);
    if (k['KeyD'] || k['ArrowRight']) vel.current.addScaledVector(right, 1);
    if (k['KeyA'] || k['ArrowLeft'])  vel.current.addScaledVector(right,-1);
    if (k['KeyE'] || k['Space'])      vel.current.y +=  1;
    if (k['KeyQ'] || k['ControlLeft']) vel.current.y -= 1;

    if (vel.current.length() > 0) {
      vel.current.normalize().multiplyScalar(spd * delta);
      camera.position.add(vel.current);
    }
  });

  return null;
}
