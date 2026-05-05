import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { BrainPointCloudCanvas } from './BrainPointCloudCanvas';
import { useDeviceTier } from './useDeviceTier';

// Lazy load the 3D scene so the main bundle isn't bloated
const BrainScene = React.lazy(() => import('./BrainScene'));

export function BrainBackground() {
  const deviceTier = useDeviceTier();
  const [shouldRender, setShouldRender] = useState(true);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);

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

  if (prefersReducedMotion || !deviceTier.supportsWebGL || useCanvasFallback) {
    return (
      <div className="absolute inset-0 z-[1] bg-slate-50 pointer-events-auto">
        <BrainPointCloudCanvas />
      </div>
    );
  }

  if (!shouldRender) return null;

  return (
    <div className="absolute inset-0 z-[1] bg-slate-50 pointer-events-auto">
      <Suspense fallback={<div className="absolute inset-0 bg-slate-50" />}>
        <Canvas
          camera={{ position: [0, 0, 4.8], fov: 50 }}
          dpr={deviceTier.dpr}
          gl={{ 
            alpha: true,
            antialias: true,
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', () => {
              setUseCanvasFallback(true);
            }, { once: true });
          }}
        >
          <BrainScene deviceTier={deviceTier} />
        </Canvas>
      </Suspense>
    </div>
  );
}
