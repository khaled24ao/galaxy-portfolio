import React, { useMemo } from 'react';
import ProjectPlanet from './ProjectPlanet';

const GalaxyFormation = ({ 
  projectsData, 
  isExploded = false, 
  onProjectSelect,
  selectedProject 
}) => {
  // Calculate logarithmic spiral positions for all planets
  const planetPositions = useMemo(() => {
    const positions = [];
    const totalPlanets = projectsData.length;
    
    // Logarithmic spiral parameters
    const a = 0.5; // Initial radius
    const b = 0.3; // Growth rate
    const totalRotations = 3; // Number of spiral rotations
    
    for (let i = 0; i < totalPlanets; i++) {
      const t = (i / totalPlanets) * totalRotations * Math.PI * 2;
      const radius = a * Math.exp(b * t);
      
      // Convert polar to Cartesian coordinates
      const x = radius * Math.cos(t);
      const z = radius * Math.sin(t);
      
      // Add some vertical variation for visual interest
      const y = (Math.random() - 0.5) * 4 + Math.sin(t) * 2;
      
      positions.push([x, y, z]);
    }
    
    return positions;
  }, [projectsData]);

  return (
    <>
      {projectsData.map((project, index) => (
        <ProjectPlanet
          key={project.id}
          project={project}
          position={planetPositions[index]}
          isExploded={isExploded}
          onProjectSelect={onProjectSelect}
          isSelected={selectedProject?.id === project.id}
        />
      ))}
    </>
  );
};

export default GalaxyFormation;
