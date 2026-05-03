import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertex, particleFragment } from './shaders';
import type { BrainGeometryData } from './useBrainGeometry';

interface BrainParticlesProps {
  brainData: BrainGeometryData;
  activations: Float32Array;
  needsUpdate: { current: boolean };
  onPointerDown?: (e: any) => void;
}

export function BrainParticles({ brainData, activations, needsUpdate, onPointerDown }: BrainParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uBaseColor: { value: new THREE.Color('#94a3b8') }, // Slate 400
      uPulseColor: { value: new THREE.Color('#1e293b') }, // Navy / Dark Slate
      uBaseSize: { value: 3.8 }, // Increased from 2.8 for better morphology definition
      uMaxDepth: { value: 3.5 }
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (needsUpdate.current && pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      const attr = geometry.attributes.aActivation as THREE.BufferAttribute;
      attr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} onPointerDown={onPointerDown}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={brainData.particleCount}
          array={brainData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={brainData.particleCount}
          array={brainData.phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aActivation"
          count={brainData.particleCount}
          array={activations}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
