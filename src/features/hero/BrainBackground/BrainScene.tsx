import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useBrainGeometry } from './useBrainGeometry';
import { usePulseSystem } from './usePulseSystem';
import { BrainParticles } from './BrainParticles';
import { BrainConnections } from './BrainConnections';
import { computeBrainWorldFrame } from './brainFraming';
import type { DeviceTier } from './useDeviceTier';
import type { BrainGeometryData } from './useBrainGeometry';

interface BrainSceneProps {
  deviceTier: DeviceTier;
}

export default function BrainScene({ deviceTier }: BrainSceneProps) {
  const brainData = useBrainGeometry(deviceTier.particleCount, deviceTier.edgeK);

  if (!brainData) {
    return null;
  }

  return <BrainSceneContent brainData={brainData} />;
}

interface BrainSceneContentProps {
  brainData: BrainGeometryData;
}

function BrainSceneContent({ brainData }: BrainSceneContentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseSystem = usePulseSystem(brainData);
  const { triggerPulse, triggerPulseAt } = pulseSystem;
  const viewport = useThree((state) => state.viewport);
  const baseAngleX = 0;
  const baseAngleY = -Math.PI / 2;
  const frame = useMemo(() => {
    return computeBrainWorldFrame(brainData.positions, viewport.width, viewport.height, baseAngleX, baseAngleY);
  }, [brainData.positions, viewport.height, viewport.width]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = frame.angleY + Math.sin(state.clock.elapsedTime * 0.42) * 0.06;
      groupRef.current.rotation.x = frame.angleX + Math.sin(state.clock.elapsedTime * 0.48) * 0.035;
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
      <mesh
        position={[0, 0, -1]}
        onPointerDown={(event) => {
          event.stopPropagation();
          triggerPulse();
        }}
      >
        <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      
      <group
        ref={groupRef}
        scale={[frame.scale * frame.xStretch, frame.scale * frame.yStretch, frame.scale]}
        position={[frame.positionX, frame.positionY, frame.positionZ]}
      >
        <BrainParticles 
          brainData={brainData} 
          pulseSystem={pulseSystem}
          onPointerDown={handlePointerDown}
        />
        <BrainConnections 
          brainData={brainData} 
          pulseSystem={pulseSystem}
        />
      </group>
    </>
  );
}
