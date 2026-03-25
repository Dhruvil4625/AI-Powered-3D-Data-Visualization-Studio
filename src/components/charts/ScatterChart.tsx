/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';

export const ScatterChart: React.FC = () => {
  const { data, chartConfig, visualConfig } = useAppStore();
  
  const points = useMemo(() => {
    if (!data || !chartConfig.xAxis || !chartConfig.yAxis || !chartConfig.zAxis) return [];
    
    const xValues = data.map(d => parseFloat(d[chartConfig.xAxis]) || 0);
    const yValues = data.map(d => parseFloat(d[chartConfig.yAxis]) || 0);
    const zValues = data.map(d => parseFloat(d[chartConfig.zAxis]) || 0);
    
    const minX = Math.min(...xValues); const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues); const maxY = Math.max(...yValues);
    const minZ = Math.min(...zValues); const maxZ = Math.max(...zValues);
    
    // Scale everything to a manageable 10x10x10 local coordinate box around center
    return data.map((d, i) => {
      const nx = ((xValues[i] - minX) / (maxX - minX || 1) - 0.5) * 10;
      const ny = ((yValues[i] - minY) / (maxY - minY || 1) - 0.5) * 10;
      const nz = ((zValues[i] - minZ) / (maxZ - minZ || 1) - 0.5) * 10;
      
      return {
        pos: new THREE.Vector3(nx, ny, nz),
        isOutlier: d.is_outlier || false
      };
    });
  }, [data, chartConfig]);

  if (points.length === 0) return null;

  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p.pos}>
          {/* Apply pointScale to dynamic geometry */}
          <sphereGeometry args={[(p.isOutlier ? 0.25 : 0.12) * visualConfig.pointScale, 8, 8]} />
          <meshStandardMaterial 
            color={p.isOutlier ? visualConfig.secondaryColor : visualConfig.primaryColor} 
            emissive={p.isOutlier ? visualConfig.secondaryColor : visualConfig.primaryColor} 
            emissiveIntensity={p.isOutlier ? 4 : 2} 
            transparent={true}
            opacity={visualConfig.nodeOpacity}
            toneMapped={false} 
          />
        </mesh>
      ))}
      
      {/* Basic axes helpers centered naturally */}
      <axesHelper args={[6]} />
      <gridHelper args={[10, 10, '#333333', '#111111']} position={[0, -5, 0]} />
    </group>
  );
};
