import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertex, particleFragment } from './shaders';
import type { BrainGeometryData } from './useBrainGeometry';
import type { BrainPulseSystem } from './usePulseSystem';

interface BrainParticlesProps {
  brainData: BrainGeometryData;
  pulseSystem: BrainPulseSystem;
  onPointerDown?: (e: any) => void;
}

export function BrainParticles({ brainData, pulseSystem, onPointerDown }: BrainParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lastPulseVersionRef = useRef(-1);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uBaseColor: { value: new THREE.Color('#334155') },
      uPulseColor: { value: new THREE.Color('#0f172a') },
      uBaseSize: { value: 5.2 },
      uMaxDepth: { value: 3.5 },
      uNormalAmplitude: { value: 0.006 },
      uPulseDuration: { value: 0.7 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (pointsRef.current && lastPulseVersionRef.current !== pulseSystem.versionRef.current) {
      const geometry = pointsRef.current.geometry;
      for (let i = 0; i < 3; i++) {
        const attr = geometry.attributes[`aPulseTime${i}`] as THREE.BufferAttribute;
        attr.needsUpdate = true;
      }
      lastPulseVersionRef.current = pulseSystem.versionRef.current;
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
          attach="attributes-aNormal"
          count={brainData.particleCount}
          array={brainData.normals}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPulseTime0"
          count={brainData.particleCount}
          array={pulseSystem.schedule.nodePulseTimes[0]}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPulseTime1"
          count={brainData.particleCount}
          array={pulseSystem.schedule.nodePulseTimes[1]}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPulseTime2"
          count={brainData.particleCount}
          array={pulseSystem.schedule.nodePulseTimes[2]}
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
