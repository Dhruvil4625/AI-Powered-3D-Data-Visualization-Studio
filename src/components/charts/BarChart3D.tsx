import React, { useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';

export const BarChart3D: React.FC = () => {
  const { data, chartConfig, visualConfig } = useAppStore();
  const groupRef = useRef<THREE.Group>(null);

  if (!data || !chartConfig.xAxis || !chartConfig.yAxis || !chartConfig.zAxis || chartConfig.type !== 'bar') {
    return null;
  }

  // Normalize and scale the data a bit
  const yValues = data.map(d => Number(d[chartConfig.yAxis] || 0));

  const maxVal = Math.max(...yValues, 1);
  const minVal = Math.min(...yValues, 0);
  const range = maxVal - minVal || 1;

  const colorPrimary = new THREE.Color(visualConfig.primaryColor);
  const colorSecondary = new THREE.Color(visualConfig.secondaryColor);

  return (
    <group ref={groupRef} position={[-5, 0, -5]}>
      {data.map((d, i) => {
        const xPos = Number(d[chartConfig.xAxis] || 0);
        const yPos = Number(d[chartConfig.yAxis] || 0);
        const zPos = Number(d[chartConfig.zAxis] || 0);

        const height = ((yPos - minVal) / range) * 10 + 0.1; // Scale height between 0.1 and 10

        // Interpolate color based on height
        const barColor = colorPrimary.clone().lerp(colorSecondary, height / 10);

        return (
          <mesh
            key={i}
            position={[xPos * 0.5, height / 2, zPos * 0.5]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.5, height, 0.5]} />
            <meshStandardMaterial
              color={barColor}
              metalness={0.6}
              roughness={0.2}
              transparent
              opacity={visualConfig.nodeOpacity}
            />
          </mesh>
        );
      })}
    </group>
  );
};
