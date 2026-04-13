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
  // Extract and normalize values
  const xValues = data.map(d => Number(d[chartConfig.xAxis] || 0));
  const yValues = data.map(d => Number(d[chartConfig.yAxis] || 0));
  const zValues = data.map(d => Number(d[chartConfig.zAxis] || 0));

  const maxVal = Math.max(...yValues, 1);
  const minVal = Math.min(...yValues, 0);
  const range = maxVal - minVal || 1;
  const minX = Math.min(...xValues); const maxX = Math.max(...xValues);
  const minZ = Math.min(...zValues); const maxZ = Math.max(...zValues);

  const colorPrimary = new THREE.Color(visualConfig.primaryColor);
  const colorSecondary = new THREE.Color(visualConfig.secondaryColor);

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      {data.map((d, i) => {
        const xPos = Number(d[chartConfig.xAxis] || 0);
        const yPos = Number(d[chartConfig.yAxis] || 0);
        const zPos = Number(d[chartConfig.zAxis] || 0);

        const nx = ((xPos - minX) / (maxX - minX || 1) - 0.5) * 10;
        const nz = ((zPos - minZ) / (maxZ - minZ || 1) - 0.5) * 10;

        const height = ((yPos - minVal) / range) * 10 * visualConfig.pointScale + 0.1;

        // Interpolate color based on height
        const barColor = colorPrimary.clone().lerp(colorSecondary, height / 10);

        return (
          <mesh
            key={i}
            position={[nx, height / 2, nz]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.5 * visualConfig.pointScale, height, 0.5 * visualConfig.pointScale]} />
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
