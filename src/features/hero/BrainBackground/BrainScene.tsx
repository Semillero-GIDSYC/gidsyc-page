import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useBrainGeometry } from './useBrainGeometry';
import { usePulseSystem } from './usePulseSystem';
import { BrainParticles } from './BrainParticles';
import { BrainConnections } from './BrainConnections';
import { DeviceTier } from './useDeviceTier';

interface BrainSceneProps {
  deviceTier: DeviceTier;
}

export default function BrainScene({ deviceTier }: BrainSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Data + State Hooks
  const brainData = useBrainGeometry(deviceTier.particleCount, deviceTier.edgeK);
  const pulseSystem = usePulseSystem(brainData);
  const { activations, stateRef: needsPulseUpdate, triggerPulseAt } = pulseSystem;

  // Gentle slow idle rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02; // Slower rotation
      groupRef.current.rotation.x = Math.sin(performance.now() * 0.0003) * 0.03;
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.index !== undefined) {
      triggerPulseAt(e.index); // e.index comes from raycasting on BrainParticles
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      
      <group 
        ref={groupRef} 
        scale={[2.2, 2.2, 2.2]} 
        position={[-0.12, -0.05, 0]} 
      >
        <BrainParticles 
          brainData={brainData} 
          activations={activations} 
          onPointerDown={handlePointerDown}
          needsUpdate={{
            get current() { return needsPulseUpdate.current.needsUpdate; },
            set current(v) { needsPulseUpdate.current.needsUpdate = v; }
          }} 
        />
        <BrainConnections 
          brainData={brainData} 
          activations={activations} 
          needsUpdate={{
            get current() { return needsPulseUpdate.current.needsUpdate; },
            set current(v) { needsPulseUpdate.current.needsUpdate = v; }
          }} 
        />
      </group>
    </>
  );
}
