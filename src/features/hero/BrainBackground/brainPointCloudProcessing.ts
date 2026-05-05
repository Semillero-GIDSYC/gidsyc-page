export interface BrainConnectionData {
  edges: Uint16Array;
  edgeCount: number;
  adjacency: number[][];
}

interface Neighbor {
  index: number;
  distanceSq: number;
}

class SpatialHash {
  private readonly cells = new Map<string, number[]>();

  constructor(
    private readonly positions: Float32Array,
    private readonly cellSize: number,
  ) {}

  insert(index: number): void {
    const key = this.keyForPoint(index);
    const cell = this.cells.get(key);
    if (cell) {
      cell.push(index);
      return;
    }

    this.cells.set(key, [index]);
  }

  findNearby(index: number, radius: number): number[] {
    const x = this.positions[index * 3];
    const y = this.positions[index * 3 + 1];
    const z = this.positions[index * 3 + 2];
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    const result: number[] = [];

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const cell = this.cells.get(`${cx + dx},${cy + dy},${cz + dz}`);
          if (!cell) {
            continue;
          }

          for (let i = 0; i < cell.length; i++) {
            result.push(cell[i]);
          }
        }
      }
    }

    return result;
  }

  private keyForPoint(index: number): string {
    const offset = index * 3;
    return [
      Math.floor(this.positions[offset] / this.cellSize),
      Math.floor(this.positions[offset + 1] / this.cellSize),
      Math.floor(this.positions[offset + 2] / this.cellSize),
    ].join(',');
  }
}

function estimateCellSize(positions: Float32Array, count: number): number {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  return Math.max(extent / Math.sqrt(count), 0.018);
}

function buildSpatialHash(positions: Float32Array, count: number): SpatialHash {
  const grid = new SpatialHash(positions, estimateCellSize(positions, count));

  for (let i = 0; i < count; i++) {
    grid.insert(i);
  }

  return grid;
}

function findNearestNeighbors(
  positions: Float32Array,
  grid: SpatialHash,
  index: number,
  minimumCount: number,
): Neighbor[] {
  let radius = 1;
  let candidates: number[] = [];

  while (radius <= 6) {
    candidates = grid.findNearby(index, radius);
    if (candidates.length > minimumCount) {
      break;
    }
    radius++;
  }

  const origin = index * 3;
  const ox = positions[origin];
  const oy = positions[origin + 1];
  const oz = positions[origin + 2];
  const neighbors: Neighbor[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (candidate === index) {
      continue;
    }

    const offset = candidate * 3;
    const dx = positions[offset] - ox;
    const dy = positions[offset + 1] - oy;
    const dz = positions[offset + 2] - oz;
    neighbors.push({ index: candidate, distanceSq: dx * dx + dy * dy + dz * dz });
  }

  neighbors.sort((a, b) => a.distanceSq - b.distanceSq);
  return neighbors;
}

export function samplePointCloud(source: Float32Array, targetCount: number): Float32Array {
  const sourceCount = source.length / 3;
  const count = Math.min(targetCount, sourceCount);

  if (count === sourceCount) {
    return new Float32Array(source);
  }

  const positions = new Float32Array(count * 3);
  const step = sourceCount / count;

  for (let i = 0; i < count; i++) {
    const sourceIndex = Math.floor((i + 0.5) * step);
    positions[i * 3] = source[sourceIndex * 3];
    positions[i * 3 + 1] = source[sourceIndex * 3 + 1];
    positions[i * 3 + 2] = source[sourceIndex * 3 + 2];
  }

  return positions;
}

export function createPhases(positions: Float32Array, count: number): Float32Array {
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    phases[i] = (value - Math.floor(value)) * Math.PI * 2;
  }

  return phases;
}

function deterministicUnit(index: number): number {
  const value = Math.sin((index + 1) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function addInnerPointLayer(
  surfacePositions: Float32Array,
  surfaceNormals: Float32Array,
  ratio = 0.15,
): Float32Array {
  const surfaceCount = surfacePositions.length / 3;
  const innerCount = Math.floor(surfaceCount * ratio);
  const positions = new Float32Array((surfaceCount + innerCount) * 3);
  positions.set(surfacePositions);

  for (let i = 0; i < innerCount; i++) {
    const sourceIndex = Math.floor((i + 0.5) * surfaceCount / innerCount);
    const sourceOffset = sourceIndex * 3;
    const targetOffset = (surfaceCount + i) * 3;
    const depth = 0.04 + deterministicUnit(i) * 0.12;

    positions[targetOffset] = surfacePositions[sourceOffset] - surfaceNormals[sourceOffset] * depth;
    positions[targetOffset + 1] = surfacePositions[sourceOffset + 1] - surfaceNormals[sourceOffset + 1] * depth;
    positions[targetOffset + 2] = surfacePositions[sourceOffset + 2] - surfaceNormals[sourceOffset + 2] * depth;
  }

  return positions;
}

function smallestEigenVector(matrix: number[]): [number, number, number] {
  const a = matrix.slice();
  const vectors = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const pairs: Array<[number, number]> = [[0, 1], [0, 2], [1, 2]];

  for (let sweep = 0; sweep < 8; sweep++) {
    for (const [p, q] of pairs) {
      const apq = a[p * 3 + q];
      if (Math.abs(apq) < 1e-10) {
        continue;
      }

      const app = a[p * 3 + p];
      const aqq = a[q * 3 + q];
      const angle = 0.5 * Math.atan2(2 * apq, aqq - app);
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      for (let k = 0; k < 3; k++) {
        const akp = a[k * 3 + p];
        const akq = a[k * 3 + q];
        a[k * 3 + p] = c * akp - s * akq;
        a[k * 3 + q] = s * akp + c * akq;
      }

      for (let k = 0; k < 3; k++) {
        const apk = a[p * 3 + k];
        const aqk = a[q * 3 + k];
        a[p * 3 + k] = c * apk - s * aqk;
        a[q * 3 + k] = s * apk + c * aqk;
      }

      for (let k = 0; k < 3; k++) {
        const vkp = vectors[k * 3 + p];
        const vkq = vectors[k * 3 + q];
        vectors[k * 3 + p] = c * vkp - s * vkq;
        vectors[k * 3 + q] = s * vkp + c * vkq;
      }
    }
  }

  let eigenIndex = 0;
  if (a[4] < a[eigenIndex * 3 + eigenIndex]) {
    eigenIndex = 1;
  }
  if (a[8] < a[eigenIndex * 3 + eigenIndex]) {
    eigenIndex = 2;
  }

  let x = vectors[eigenIndex];
  let y = vectors[3 + eigenIndex];
  let z = vectors[6 + eigenIndex];
  const length = Math.hypot(x, y, z) || 1;
  x /= length;
  y /= length;
  z /= length;

  return [x, y, z];
}

function orientNormalsByPropagation(
  positions: Float32Array,
  normals: Float32Array,
  nearestByPoint: Neighbor[][],
  count: number,
): void {
  const visited = new Uint8Array(count);

  for (let seed = 0; seed < count; seed++) {
    if (visited[seed]) {
      continue;
    }

    const seedOffset = seed * 3;
    const outwardDot =
      normals[seedOffset] * positions[seedOffset] +
      normals[seedOffset + 1] * positions[seedOffset + 1] +
      normals[seedOffset + 2] * positions[seedOffset + 2];

    if (outwardDot < 0) {
      normals[seedOffset] *= -1;
      normals[seedOffset + 1] *= -1;
      normals[seedOffset + 2] *= -1;
    }

    const queue = [seed];
    visited[seed] = 1;

    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      const currentOffset = current * 3;
      const neighbors = nearestByPoint[current];

      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i].index;
        if (visited[neighbor]) {
          continue;
        }

        const neighborOffset = neighbor * 3;
        const dot =
          normals[currentOffset] * normals[neighborOffset] +
          normals[currentOffset + 1] * normals[neighborOffset + 1] +
          normals[currentOffset + 2] * normals[neighborOffset + 2];

        if (dot < 0) {
          normals[neighborOffset] *= -1;
          normals[neighborOffset + 1] *= -1;
          normals[neighborOffset + 2] *= -1;
        }

        visited[neighbor] = 1;
        queue.push(neighbor);
      }
    }
  }
}

export function computePointCloudNormals(
  positions: Float32Array,
  count: number,
  neighborCount = 16,
): Float32Array {
  const normals = new Float32Array(count * 3);
  const grid = buildSpatialHash(positions, count);
  const nearestByPoint: Neighbor[][] = new Array(count);

  for (let i = 0; i < count; i++) {
    const neighbors = findNearestNeighbors(positions, grid, i, neighborCount).slice(0, neighborCount);
    nearestByPoint[i] = neighbors;

    let mx = positions[i * 3];
    let my = positions[i * 3 + 1];
    let mz = positions[i * 3 + 2];

    for (let n = 0; n < neighbors.length; n++) {
      const offset = neighbors[n].index * 3;
      mx += positions[offset];
      my += positions[offset + 1];
      mz += positions[offset + 2];
    }

    const sampleCount = neighbors.length + 1;
    mx /= sampleCount;
    my /= sampleCount;
    mz /= sampleCount;

    let xx = 0;
    let xy = 0;
    let xz = 0;
    let yy = 0;
    let yz = 0;
    let zz = 0;

    for (let n = -1; n < neighbors.length; n++) {
      const pointIndex = n === -1 ? i : neighbors[n].index;
      const offset = pointIndex * 3;
      const dx = positions[offset] - mx;
      const dy = positions[offset + 1] - my;
      const dz = positions[offset + 2] - mz;
      xx += dx * dx;
      xy += dx * dy;
      xz += dx * dz;
      yy += dy * dy;
      yz += dy * dz;
      zz += dz * dz;
    }

    const [nx, ny, nz] = smallestEigenVector([xx, xy, xz, xy, yy, yz, xz, yz, zz]);
    normals[i * 3] = nx;
    normals[i * 3 + 1] = ny;
    normals[i * 3 + 2] = nz;
  }

  orientNormalsByPropagation(positions, normals, nearestByPoint, count);
  return normals;
}

export function computeBrainConnections(
  positions: Float32Array,
  count: number,
  guaranteedNearest = 3,
  maxDegree = 6,
): BrainConnectionData {
  const grid = buildSpatialHash(positions, count);
  const edgeSet = new Set<number>();
  const adjacency: number[][] = Array.from({ length: count }, () => []);
  const edges: number[] = [];
  const candidateCount = Math.max(guaranteedNearest + 9, 12);
  const nearestByPoint: Neighbor[][] = new Array(count);

  for (let i = 0; i < count; i++) {
    nearestByPoint[i] = findNearestNeighbors(positions, grid, i, candidateCount).slice(0, candidateCount);
  }

  const addEdge = (a: number, b: number, enforceDegreeCap = true): boolean => {
    if (
      a === b ||
      (enforceDegreeCap && (adjacency[a].length >= maxDegree || adjacency[b].length >= maxDegree))
    ) {
      return false;
    }

    const min = Math.min(a, b);
    const max = Math.max(a, b);
    const key = min * count + max;
    if (edgeSet.has(key)) {
      return false;
    }

    edgeSet.add(key);
    edges.push(min, max);
    adjacency[min].push(max);
    adjacency[max].push(min);
    return true;
  };

  for (let i = 0; i < count; i++) {
    const nearest = nearestByPoint[i];

    for (let n = 0; n < nearest.length && adjacency[i].length < guaranteedNearest; n++) {
      addEdge(i, nearest[n].index);
    }
  }

  for (let i = 0; i < count; i++) {
    if (adjacency[i].length >= guaranteedNearest) {
      continue;
    }

    const nearest = findNearestNeighbors(positions, grid, i, 32).slice(0, 32);
    for (let n = 0; n < nearest.length && adjacency[i].length < guaranteedNearest; n++) {
      addEdge(i, nearest[n].index, false);
    }
  }

  for (let i = 0; i < count; i++) {
    const nearest = nearestByPoint[i];

    if (adjacency[i].length >= maxDegree || nearest.length <= guaranteedNearest) {
      continue;
    }

    const sigmaSq = nearest[Math.min(nearest.length - 1, guaranteedNearest + 4)].distanceSq || 1;

    for (let n = guaranteedNearest; n < nearest.length && adjacency[i].length < maxDegree; n++) {
      const candidate = nearest[n];
      const probability = Math.exp(-candidate.distanceSq / sigmaSq);
      const random = Math.sin((i + 1) * 12.9898 + (candidate.index + 1) * 78.233) * 43758.5453;
      if (random - Math.floor(random) < probability * 0.45) {
        addEdge(i, candidate.index);
      }
    }
  }

  return {
    edges: Uint16Array.from(edges),
    edgeCount: edges.length / 2,
    adjacency,
  };
}
