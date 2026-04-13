import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

export const LineGraph3D: React.FC = () => {
  const { data, chartConfig, visualConfig } = useAppStore();

  if (!data || !chartConfig.xAxis || !chartConfig.yAxis || !chartConfig.zAxis || chartConfig.type !== 'line') {
    return null;
  }

  // Generate points
  const points = useMemo(() => {
    const xValues = data.map(d => Number(d[chartConfig.xAxis] || 0));
    const yValues = data.map(d => Number(d[chartConfig.yAxis] || 0));
    const zValues = data.map(d => Number(d[chartConfig.zAxis] || 0));
    const minX = Math.min(...xValues); const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues); const maxY = Math.max(...yValues);
    const minZ = Math.min(...zValues); const maxZ = Math.max(...zValues);

    return data.map((d) => {
        const nx = ((Number(d[chartConfig.xAxis] || 0) - minX) / (maxX - minX || 1) - 0.5) * 10;
        const ny = ((Number(d[chartConfig.yAxis] || 0) - minY) / (maxY - minY || 1) - 0.5) * 10;
        const nz = ((Number(d[chartConfig.zAxis] || 0) - minZ) / (maxZ - minZ || 1) - 0.5) * 10;
        return new THREE.Vector3(nx, ny, nz);
    });
  }, [data, chartConfig]);

  if (points.length < 2) return null;

  return (
    <group position={[-5, -2, -5]}>
      <Line
        points={points}
        color={visualConfig.primaryColor}
        lineWidth={2 + (visualConfig.edgeThickness * 10)}
        dashed={false}
        transparent
        opacity={visualConfig.nodeOpacity}
      />
      {points.map((p, i) => (
        <mesh key={i} position={p}>
            <sphereGeometry args={[0.05 * visualConfig.pointScale, 8, 8]} />
            <meshStandardMaterial color={visualConfig.secondaryColor} emissive={visualConfig.secondaryColor} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
};
