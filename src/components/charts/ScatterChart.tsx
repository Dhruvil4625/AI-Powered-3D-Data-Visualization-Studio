/// <reference types="@react-three/fiber" />
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export const ScatterChart: React.FC = () => {
  const { data, chartConfig, visualConfig } = useAppStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const palette = useMemo(() => ['#00f5ff', '#ff0055', '#ffaa00', '#00ffaa', '#aa00ff', '#5500ff'], []);

  const points = useMemo(() => {
    if (!data || !chartConfig.xAxis || !chartConfig.yAxis || !chartConfig.zAxis) return [];
    
    const xValues = data.map(d => parseFloat(d[chartConfig.xAxis]) || 0);
    const yValues = data.map(d => parseFloat(d[chartConfig.yAxis]) || 0);
    const zValues = data.map(d => parseFloat(d[chartConfig.zAxis]) || 0);
    
    const minX = Math.min(...xValues); const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues); const maxY = Math.max(...yValues);
    const minZ = Math.min(...zValues); const maxZ = Math.max(...zValues);
    
    return data.map((d, i) => {
      const nx = ((xValues[i] - minX) / (maxX - minX || 1) - 0.5) * 10;
      const ny = ((yValues[i] - minY) / (maxY - minY || 1) - 0.5) * 10;
      const nz = ((zValues[i] - minZ) / (maxZ - minZ || 1) - 0.5) * 10;
      
      let colorValue = undefined;
      if (chartConfig.colorAxis && d[chartConfig.colorAxis] !== undefined) {
         colorValue = d[chartConfig.colorAxis];
      }
      
      return {
        pos: [nx, ny, nz] as [number, number, number],
        isOutlier: d.is_outlier || false,
        colorValue
      };
    });
  }, [data, chartConfig]);

  useLayoutEffect(() => {
    if (!meshRef.current || points.length === 0) return;

    points.forEach((p, i) => {
      // Position and Scale
      tempObject.position.set(p.pos[0], p.pos[1], p.pos[2]);
      const scale = (p.isOutlier ? 0.25 : 0.12) * visualConfig.pointScale;
      tempObject.scale.set(scale, scale, scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);

      // Color
      let nodeColor = p.isOutlier ? visualConfig.secondaryColor : visualConfig.primaryColor;
      if (p.colorValue !== undefined) {
        const index = Math.abs(Math.floor(Number(p.colorValue))) % palette.length;
        nodeColor = palette[index];
      }
      tempColor.set(nodeColor);
      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [points, visualConfig, palette]);

  if (points.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          transparent={true}
          opacity={visualConfig.nodeOpacity}
          toneMapped={false}
          emissiveIntensity={2}
        />
      </instancedMesh>
      
      <axesHelper args={[6]} />
      <gridHelper args={[10, 10, '#333333', '#111111']} position={[0, -5, 0]} />
    </group>
  );
};
