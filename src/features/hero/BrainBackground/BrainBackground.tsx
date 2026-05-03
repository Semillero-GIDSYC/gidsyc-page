import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { NeuralNetworkBackground } from '../NeuralNetworkBackground';
import { useDeviceTier } from './useDeviceTier';

// Lazy load the 3D scene so the main bundle isn't bloated
const BrainScene = React.lazy(() => import('./BrainScene'));

export function BrainBackground() {
  const deviceTier = useDeviceTier();
  const [shouldRender, setShouldRender] = useState(true);

  // Pause rendering when tab is inactive to save battery
  useEffect(() => {
    const handleVisibilityChange = () => {
      setShouldRender(document.visibilityState === 'visible');
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  if (prefersReducedMotion || !deviceTier.supportsWebGL) {
    return <NeuralNetworkBackground />;
  }

  if (!shouldRender) return null;

  return (
    <div className="absolute inset-0 z-0 bg-slate-50">
      <Suspense fallback={<div className="absolute inset-0 bg-slate-50" />}>
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 45 }}
          dpr={deviceTier.dpr}
          gl={{ 
            powerPreference: 'high-performance',
            alpha: true,
            antialias: false,
            stencil: false,
            depth: false // Disabled to prevent depth-testing conflicts between points and lines
          }}
        >
          <BrainScene deviceTier={deviceTier} />
        </Canvas>
      </Suspense>
    </div>
  );
}
