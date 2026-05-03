import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const ProjectPlanet = ({ 
  project, 
  position, 
  isExploded = false, 
  onProjectSelect,
  isSelected = false 
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Apply rotation speed from project data
      meshRef.current.rotation.y += project.rotationSpeed * 0.01;
      
      // Gentle floating animation
      if (!isExploded) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
    }

    // Material updates will be handled via React state
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const handlePointerOver = (event) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <Float 
      speed={isExploded ? 0 : 1} 
      rotationIntensity={isExploded ? 0 : 0.2}
      floatIntensity={isExploded ? 0 : 0.5}
    >
      <group position={position}>
        {/* Planet mesh */}
        <mesh
          ref={meshRef}
          scale={project.size}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={project.color}
            roughness={0.7}
            metalness={0.3}
            emissive={project.color}
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </mesh>

        {/* Atmosphere glow effect */}
        <mesh scale={project.size * 1.1}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={project.color}
            transparent={true}
            opacity={hovered ? 0.2 : 0.1}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Sparkles - ONLY render when hovered for performance */}
        {hovered && (
          <Sparkles
            count={20}
            scale={project.size * 2}
            size={2}
            speed={0.5}
            opacity={0.8}
            color={project.color}
          />
        )}

        {/* Text label - ONLY render when hovered for performance */}
        {hovered && (
          <Text
            position={[0, project.size * 2, 0]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {project.name}
          </Text>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <mesh scale={project.size * 1.3}>
            <ringGeometry args={[1.2, 1.4, 32]} />
            <meshBasicMaterial
              color={project.color}
              transparent={true}
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
};

export default React.memo(ProjectPlanet);
