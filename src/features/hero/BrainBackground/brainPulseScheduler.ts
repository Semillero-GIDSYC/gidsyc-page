export const PULSE_SLOT_COUNT = 3;

export interface PulseScheduleData {
  nodePulseTimes: [Float32Array, Float32Array, Float32Array];
  edgePulseStarts: [Float32Array, Float32Array, Float32Array];
  edgePulseDirections: [Float32Array, Float32Array, Float32Array];
}

export interface PulseScheduleOptions {
  adjacency: number[][];
  edges: Uint16Array;
  edgeIndexByPair: Map<number, number>;
  particleCount: number;
  origin: number;
  slot: number;
  startTime: number;
  nodeDelay?: number;
  maxDepth?: number;
}

const DEFAULT_TIME = -1000;

export function createPulseScheduleData(particleCount: number, edgeVertexCount: number): PulseScheduleData {
  const createNodeTimes = () => new Float32Array(particleCount).fill(DEFAULT_TIME);
  const createEdgeStarts = () => new Float32Array(edgeVertexCount).fill(DEFAULT_TIME);
  const createDirections = () => new Float32Array(edgeVertexCount).fill(1);

  return {
    nodePulseTimes: [createNodeTimes(), createNodeTimes(), createNodeTimes()],
    edgePulseStarts: [createEdgeStarts(), createEdgeStarts(), createEdgeStarts()],
    edgePulseDirections: [createDirections(), createDirections(), createDirections()],
  };
}

export function buildEdgeIndexMap(edges: Uint16Array, particleCount: number): Map<number, number> {
  const map = new Map<number, number>();

  for (let i = 0; i < edges.length; i += 2) {
    const a = edges[i];
    const b = edges[i + 1];
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    map.set(min * particleCount + max, i / 2);
  }

  return map;
}

export function schedulePulse({
  adjacency,
  edges,
  edgeIndexByPair,
  particleCount,
  origin,
  slot,
  startTime,
  nodeDelay = 0.085,
  maxDepth = 9,
}: PulseScheduleOptions, schedule: PulseScheduleData): void {
  const nodePulseTimes = schedule.nodePulseTimes[slot];
  const edgePulseStarts = schedule.edgePulseStarts[slot];
  const edgePulseDirections = schedule.edgePulseDirections[slot];
  nodePulseTimes.fill(DEFAULT_TIME);
  edgePulseStarts.fill(DEFAULT_TIME);
  edgePulseDirections.fill(1);

  const depths = new Int16Array(particleCount).fill(-1);
  const queue = new Int32Array(particleCount);
  let head = 0;
  let tail = 0;

  queue[tail++] = origin;
  depths[origin] = 0;
  nodePulseTimes[origin] = startTime;

  while (head < tail) {
    const current = queue[head++];
    const currentDepth = depths[current];
    if (currentDepth >= maxDepth) {
      continue;
    }

    const neighbors = adjacency[current];
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      if (depths[neighbor] !== -1) {
        continue;
      }

      const nextDepth = currentDepth + 1;
      const min = Math.min(current, neighbor);
      const max = Math.max(current, neighbor);
      const edgeIndex = edgeIndexByPair.get(min * particleCount + max);

      depths[neighbor] = nextDepth;
      nodePulseTimes[neighbor] = startTime + nextDepth * nodeDelay;
      queue[tail++] = neighbor;

      if (edgeIndex !== undefined) {
        const edgeOffset = edgeIndex * 2;
        const direction = edges[edgeOffset] === current ? 1 : -1;
        const edgeStart = startTime + currentDepth * nodeDelay;
        edgePulseStarts[edgeOffset] = edgeStart;
        edgePulseStarts[edgeOffset + 1] = edgeStart;
        edgePulseDirections[edgeOffset] = direction;
        edgePulseDirections[edgeOffset + 1] = direction;
      }
    }
  }
}
