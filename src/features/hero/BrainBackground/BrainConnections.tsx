import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { connectionVertex, connectionFragment } from './shaders';
import type { BrainGeometryData } from './useBrainGeometry';

interface BrainConnectionsProps {
  brainData: BrainGeometryData;
  activations: Float32Array;
  needsUpdate: { current: boolean };
}

export function BrainConnections({ brainData, activations, needsUpdate }: BrainConnectionsProps) {
  const linesRef = useRef<THREE.LineSegments>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#94a3b8') }, // Slate 400 instead of cbd5e1 for better contrast
      uPulseColor: { value: new THREE.Color('#334155') }, // Dark Slate 700
      uMaxDepth: { value: 3.5 },
    }),
    []
  );

  useFrame(() => {
    if (needsUpdate.current && linesRef.current) {
      const geometry = linesRef.current.geometry;
      const attr = geometry.attributes.aVertexActivation as THREE.BufferAttribute;
      
      const { edges } = brainData;
      const numEdges = edges.length / 2;
      const lineAttrArray = attr.array as Float32Array;

      // Direct mapping from node activations to line vertex activations
      // This is much faster than the previous O(E) loop with Math.max
      for (let i = 0; i < numEdges; i++) {
        const u = edges[i * 2];
        const v = edges[i * 2 + 1];
        
        lineAttrArray[i * 2] = activations[u];
        lineAttrArray[i * 2 + 1] = activations[v];
      }
      
      attr.needsUpdate = true;
      // We don't reset needsUpdate here, as BrainParticles might still need it.
      // usePulseSystem or BrainScene should handle the reset if shared.
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

  const initialVertexActivations = useMemo(() => {
    return new Float32Array(brainData.edges.length);
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
          attach="attributes-aVertexActivation"
          count={brainData.edges.length}
          array={initialVertexActivations}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
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
