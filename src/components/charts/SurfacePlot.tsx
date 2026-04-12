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
        for (let i = 0; i < posAttribute.count; i++) {
            vertex.fromBufferAttribute(posAttribute, i);
            
            // Search the data to find height. We'll use a naive inverse distance weighting
            let totalWeight = 0;
            let totalHeight = 0;
            
            for(let j = 0; j < Math.min(data.length, 100); j++) {
                const d = data[j];
                const dx = Number(d[chartConfig.xAxis] || 0) * 0.5 - 2.5; // Offset logic
                const dz = Number(d[chartConfig.zAxis] || 0) * 0.5 - 2.5;
                const dy = Number(d[chartConfig.yAxis] || 0) * 0.5;

                const dist = Math.sqrt((vertex.x - dx)**2 + (vertex.z - dz)**2);
                if (dist < 0.001) {
                    totalHeight = dy;
                    totalWeight = 1;
                    break;
                }
                const weight = 1 / (dist**2);
                totalHeight += dy * weight;
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