import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { connectionVertex, connectionFragment } from './shaders';
import type { BrainGeometryData } from './useBrainGeometry';
import type { BrainPulseSystem } from './usePulseSystem';

interface BrainConnectionsProps {
  brainData: BrainGeometryData;
  pulseSystem: BrainPulseSystem;
}

export function BrainConnections({ brainData, pulseSystem }: BrainConnectionsProps) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lastPulseVersionRef = useRef(-1);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#475569') },
      uPulseColor: { value: new THREE.Color('#0f172a') },
      uMaxDepth: { value: 3.5 },
      uNormalAmplitude: { value: 0.006 },
      uPulseTravelDuration: { value: 0.46 },
      uPulseWidth: { value: 0.13 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (linesRef.current && lastPulseVersionRef.current !== pulseSystem.versionRef.current) {
      const geometry = linesRef.current.geometry;
      for (let i = 0; i < 3; i++) {
        (geometry.attributes[`aPulseStart${i}`] as THREE.BufferAttribute).needsUpdate = true;
        (geometry.attributes[`aPulseDirection${i}`] as THREE.BufferAttribute).needsUpdate = true;
      }
      lastPulseVersionRef.current = pulseSystem.versionRef.current;
    }
  });

  const linePositions = useMemo(() => {
    const { positions, edges } = brainData;
    const numEdges = edges.length / 2;
    const arr = new Float32Array(numEdges * 2 * 3);
    
    for (let i = 0; i < numEdges; i++) {
      const p1 = edges[i * 2];
      const p2 = edges[i * 2 + 1];
      
      arr[i * 6] = positions[p1 * 3];
      arr[i * 6 + 1] = positions[p1 * 3 + 1];
      arr[i * 6 + 2] = positions[p1 * 3 + 2];
      
      arr[i * 6 + 3] = positions[p2 * 3];
      arr[i * 6 + 4] = positions[p2 * 3 + 1];
      arr[i * 6 + 5] = positions[p2 * 3 + 2];
    }
    return arr;
  }, [brainData]);

  const lineNormals = useMemo(() => {
    const { normals, edges } = brainData;
    const numEdges = edges.length / 2;
    const arr = new Float32Array(numEdges * 2 * 3);

    for (let i = 0; i < numEdges; i++) {
      const p1 = edges[i * 2];
      const p2 = edges[i * 2 + 1];

      arr[i * 6] = normals[p1 * 3];
      arr[i * 6 + 1] = normals[p1 * 3 + 1];
      arr[i * 6 + 2] = normals[p1 * 3 + 2];

      arr[i * 6 + 3] = normals[p2 * 3];
      arr[i * 6 + 4] = normals[p2 * 3 + 1];
      arr[i * 6 + 5] = normals[p2 * 3 + 2];
    }

    return arr;
  }, [brainData]);

  const linePhases = useMemo(() => {
    const { phases, edges } = brainData;
    const arr = new Float32Array(edges.length);

    for (let i = 0; i < edges.length; i++) {
      arr[i] = phases[edges[i]];
    }

    return arr;
  }, [brainData]);

  const lineEdgeCoords = useMemo(() => {
    const arr = new Float32Array(brainData.edges.length);

    for (let i = 0; i < arr.length; i += 2) {
      arr[i] = 0;
      arr[i + 1] = 1;
    }

    return arr;
  }, [brainData.edges.length]);

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={brainData.edges.length}
          array={linePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aEdgeCoord"
          count={brainData.edges.length}
          array={lineEdgeCoords}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aNormal"
          count={brainData.edges.length}
          array={lineNormals}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={brainData.edges.length}
          array={linePhases}
          itemSize={1}
        />
        {[0, 1, 2].map((slot) => (
          <bufferAttribute
            key={`start-${slot}`}
            attach={`attributes-aPulseStart${slot}`}
            count={brainData.edges.length}
            array={pulseSystem.schedule.edgePulseStarts[slot]}
            itemSize={1}
          />
        ))}
        {[0, 1, 2].map((slot) => (
          <bufferAttribute
            key={`direction-${slot}`}
            attach={`attributes-aPulseDirection${slot}`}
            count={brainData.edges.length}
            array={pulseSystem.schedule.edgePulseDirections[slot]}
            itemSize={1}
          />
        ))}
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={connectionVertex}
        fragmentShader={connectionFragment}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </lineSegments>
  );
}
