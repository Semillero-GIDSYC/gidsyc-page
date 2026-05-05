import { useEffect, useMemo, useState } from 'react';

import { loadBrainPointCloud } from './brainPointCloudLoader';
import {
  addInnerPointLayer,
  computeBrainConnections,
  computePointCloudNormals,
  createPhases,
  samplePointCloud,
} from './brainPointCloudProcessing';
import { buildEdgeIndexMap } from './brainPulseScheduler';

export interface BrainGeometryData {
  positions: Float32Array;
  phases: Float32Array;
  normals: Float32Array;
  edges: Uint16Array;
  edgeCount: number;
  particleCount: number;
  adjacency: number[][];
  edgeIndexByPair: Map<number, number>;
}

export function useBrainGeometry(particleCount: number, edgeK: number): BrainGeometryData | null {
  const [sourcePointCloud, setSourcePointCloud] = useState<Float32Array | null>(null);

  useEffect(() => {
    let mounted = true;

    loadBrainPointCloud()
      .then((pointCloud) => {
        if (mounted) {
          setSourcePointCloud(pointCloud);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => {
    if (!sourcePointCloud) {
      return null;
    }

    const surfacePositions = samplePointCloud(sourcePointCloud, particleCount);
    const surfaceCount = surfacePositions.length / 3;
    const surfaceNormals = computePointCloudNormals(surfacePositions, surfaceCount, 16);
    const positions = addInnerPointLayer(surfacePositions, surfaceNormals, 0.15);
    const count = positions.length / 3;
    const phases = createPhases(positions, count);
    const normals = computePointCloudNormals(positions, count, 16);
    const { edges, edgeCount, adjacency } = computeBrainConnections(positions, count, edgeK, 6);
    const edgeIndexByPair = buildEdgeIndexMap(edges, count);

    return { positions, phases, normals, edges, edgeCount, particleCount: count, adjacency, edgeIndexByPair };
  }, [sourcePointCloud, particleCount, edgeK]);
}
