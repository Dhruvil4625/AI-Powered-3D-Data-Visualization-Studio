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
    // Sort data for a contiguous line if requested, or just connect as they are
    // Typically 3D line graphs map sequentially, so we just use the raw array order
    return data.map((d) => {
        const xPos = Number(d[chartConfig.xAxis] || 0) * 0.5;
        const yPos = Number(d[chartConfig.yAxis] || 0) * 0.5;
        const zPos = Number(d[chartConfig.zAxis] || 0) * 0.5;
        return new THREE.Vector3(xPos, yPos, zPos);
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
