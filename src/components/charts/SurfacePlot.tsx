import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';

export const SurfacePlot: React.FC = () => {
    const { data, chartConfig, visualConfig } = useAppStore();

    const geometry = useMemo(() => {
        if (!data || !chartConfig.xAxis || !chartConfig.yAxis || !chartConfig.zAxis || chartConfig.type !== 'surface') {
            return null;
        }

        // To create a surface plot, we typically need a grid.
        // For a generic dataset, triangulating scattered points into a surface is complex.
        // We will do a basic planar projection. Let's create a plane and displace its vertices.

        const resolution = 20; // 20x20 grid
        const geo = new THREE.PlaneGeometry(10, 10, resolution, resolution);
        geo.rotateX(-Math.PI / 2); // Lay flat
        
        const posAttribute = geo.getAttribute('position');
        const vertex = new THREE.Vector3();

        // Very basic interpolation heuristic mapping scatter to plane vertices nearest to them.
        const xValues = data.map(d => Number(d[chartConfig.xAxis] || 0));
        const yValues = data.map(d => Number(d[chartConfig.yAxis] || 0));
        const zValues = data.map(d => Number(d[chartConfig.zAxis] || 0));
        const minX = Math.min(...xValues); const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues); const maxY = Math.max(...yValues);
        const minZ = Math.min(...zValues); const maxZ = Math.max(...zValues);

        for (let i = 0; i < posAttribute.count; i++) {
            vertex.fromBufferAttribute(posAttribute, i);
            
            // Search the data to find height. We'll use a naive inverse distance weighting
            let totalWeight = 0;
            let totalHeight = 0;
            
            for(let j = 0; j < Math.min(data.length, 100); j++) {
                const d = data[j];
                const nx = ((Number(d[chartConfig.xAxis] || 0) - minX) / (maxX - minX || 1) - 0.5) * 10;
                const ny = ((Number(d[chartConfig.yAxis] || 0) - minY) / (maxY - minY || 1) - 0.5) * 10;
                const nz = ((Number(d[chartConfig.zAxis] || 0) - minZ) / (maxZ - minZ || 1) - 0.5) * 10;

                const dist = Math.sqrt((vertex.x - nx)**2 + (vertex.z - nz)**2);
                if (dist < 0.001) {
                    totalHeight = ny;
                    totalWeight = 1;
                    break;
                }
                const weight = 1 / (dist**2);
                totalHeight += ny * weight;
                totalWeight += weight;
            }

            if (totalWeight > 0) {
               vertex.y = totalHeight / totalWeight; 
            }
            
            posAttribute.setY(i, vertex.y);
        }
        
        geo.computeVertexNormals();
        return geo;

    }, [data, chartConfig]);

    if (!geometry) return null;

    return (
        <group position={[0, -2, 0]}>
            <mesh geometry={geometry}>
                <meshStandardMaterial 
                    color={visualConfig.primaryColor} 
                    wireframe={false} 
                    side={THREE.DoubleSide} 
                    transparent 
                    opacity={visualConfig.nodeOpacity}
                    roughness={0.4}
                    metalness={0.6}
                />
            </mesh>
            <mesh geometry={geometry}>
                <meshBasicMaterial color={visualConfig.secondaryColor} wireframe={true} transparent opacity={0.3} />
            </mesh>
        </group>
    );
};