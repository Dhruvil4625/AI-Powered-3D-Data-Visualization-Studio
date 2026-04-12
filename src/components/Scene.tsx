import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useAppStore } from '../store/useAppStore';
import { ScatterChart } from './charts/ScatterChart';
import { BarChart3D } from './charts/BarChart3D';
import { LineGraph3D } from './charts/LineGraph3D';
import { SurfacePlot } from './charts/SurfacePlot';

export const Scene: React.FC<{ showGrid: boolean; showAxes: boolean; autoRotate: boolean }> = ({ showGrid, showAxes }) => {
  const { chartConfig, visualConfig } = useAppStore();

  const getCameraSettings = () => {
    switch(visualConfig.cameraMode) {
      case 'topDown': return { maxPolarAngle: 0, minPolarAngle: 0, autoRotate: false };
      case 'firstPerson': return { maxDistance: 5, minDistance: 1, autoRotate: false };
      case 'axonometric': return { maxPolarAngle: Math.PI / 4, minPolarAngle: Math.PI / 4, autoRotate: false };
      default: return { maxPolarAngle: Math.PI, minPolarAngle: 0, autoRotate: true };
    }
  };

  const controls = getCameraSettings();

  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
      <color attach="background" args={['#0a0a0a']} />
      {showGrid && <gridHelper args={[50, 50, visualConfig.primaryColor, '#222222']} position={[0, -2, 0]} />}
      {showAxes && <axesHelper args={[25]} position={[0, -1.99, 0]} />}
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={visualConfig.primaryColor} />
      <pointLight position={[-10, -10, -10]} intensity={1} color={visualConfig.secondaryColor} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Suspense fallback={null}>
        {chartConfig.type === 'scatter' && <ScatterChart />}
        {chartConfig.type === 'bar' && <BarChart3D />}
        {chartConfig.type === 'line' && <LineGraph3D />}
        {chartConfig.type === 'surface' && <SurfacePlot />}
      </Suspense>
      <OrbitControls
        autoRotateSpeed={0.5}
        maxPolarAngle={controls.maxPolarAngle}
        minPolarAngle={controls.minPolarAngle}
        maxDistance={controls.maxDistance || Infinity}
        minDistance={controls.minDistance || 0}
      />
      
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
      </EffectComposer>
    </Canvas>
  );
};
