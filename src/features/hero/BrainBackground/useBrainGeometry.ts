import { useMemo } from 'react';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { generateBrainGeometry } from './brainGeometryGenerator';

export interface BrainGeometryData {
  positions: Float32Array;
  phases: Float32Array;
  normals: Float32Array;
  edges: Uint16Array;
  edgeCount: number;
  particleCount: number;
  adjacency: number[][];
}

/**
 * Spatial hash grid for O(n) nearest-neighbor lookups.
 */
class SpatialHash {
  private cells: Map<string, number[]> = new Map();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private key(x: number, y: number, z: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return `${cx},${cy},${cz}`;
  }

  insert(index: number, x: number, y: number, z: number) {
    const k = this.key(x, y, z);
    if (!this.cells.has(k)) this.cells.set(k, []);
    this.cells.get(k)!.push(index);
  }

  getNeighborCells(x: number, y: number, z: number): number[] {
    const result: number[] = [];
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const k = `${cx + dx},${cy + dy},${cz + dz}`;
          const cell = this.cells.get(k);
          if (cell) {
            for (let i = 0; i < cell.length; i++) {
              result.push(cell[i]);
            }
          }
        }
      }
    }
    return result;
  }
}

function samplePointsOnSurface(
  geometry: THREE.BufferGeometry,
  count: number
): { positions: Float32Array; normals: Float32Array } {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  const sampler = new MeshSurfaceSampler(mesh).setWeightAttribute(null).build();

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const tempPosition = new THREE.Vector3();
  const tempNormal = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    sampler.sample(tempPosition, tempNormal);
    positions[i * 3] = tempPosition.x;
    positions[i * 3 + 1] = tempPosition.y;
    positions[i * 3 + 2] = tempPosition.z;
    normals[i * 3] = tempNormal.x;
    normals[i * 3 + 1] = tempNormal.y;
    normals[i * 3 + 2] = tempNormal.z;
  }

  return { positions, normals };
}

function computeKNNEdges(
  positions: Float32Array,
  count: number,
  k: number
): { edges: Uint16Array; edgeCount: number; adjacency: number[][] } {
  // Determine a good cell size from the bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let i = 0; i < count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }

  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  // Cell size such that each cell has ~5-10 particles on average
  const cellSize = extent / Math.cbrt(count / 8);

  const grid = new SpatialHash(cellSize);
  for (let i = 0; i < count; i++) {
    grid.insert(i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
  }

  const edgeSet = new Set<string>();
  const adjacency: number[][] = Array.from({ length: count }, () => []);

  // Max edges we might store
  const maxEdges = count * k;
  const edgesArr = new Uint16Array(maxEdges * 2);
  let edgeCount = 0;

  for (let i = 0; i < count; i++) {
    const ix = positions[i * 3];
    const iy = positions[i * 3 + 1];
    const iz = positions[i * 3 + 2];

    const neighbors = grid.getNeighborCells(ix, iy, iz);

    // Sort neighbors by distance, pick top K
    const dists: { idx: number; dist: number }[] = [];
    for (const j of neighbors) {
      if (j === i) continue;
      const dx = positions[j * 3] - ix;
      const dy = positions[j * 3 + 1] - iy;
      const dz = positions[j * 3 + 2] - iz;
      dists.push({ idx: j, dist: dx * dx + dy * dy + dz * dz });
    }

    dists.sort((a, b) => a.dist - b.dist);

    const limit = Math.min(k, dists.length);
    for (let n = 0; n < limit; n++) {
      const j = dists[n].idx;
      const edgeKey = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);

      edgesArr[edgeCount * 2] = i;
      edgesArr[edgeCount * 2 + 1] = j;
      adjacency[i].push(j);
      adjacency[j].push(i);
      edgeCount++;
    }
  }

  return {
    edges: edgesArr.slice(0, edgeCount * 2),
    edgeCount,
    adjacency,
  };
}

export function useBrainGeometry(particleCount: number, edgeK: number): BrainGeometryData {
  return useMemo(() => {
    const geometry = generateBrainGeometry();
    const { positions, normals } = samplePointsOnSurface(geometry, particleCount);
    const phases = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      phases[i] = Math.random() * Math.PI * 2;
    }
    const { edges, edgeCount, adjacency } = computeKNNEdges(positions, particleCount, edgeK);

    geometry.dispose();

    return { positions, phases, normals, edges, edgeCount, particleCount, adjacency };
  }, [particleCount, edgeK]);
}
