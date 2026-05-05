import { buildEdgeIndexMap } from './brainPulseScheduler';

const MAGIC = 0x4e524247; // GBRN, little-endian
const VERSION = 1;
const HEADER_WORDS = 8;
const HEADER_BYTES = HEADER_WORDS * Uint32Array.BYTES_PER_ELEMENT;

export interface SerializedBrainGeometry {
  positions: Float32Array;
  normals: Float32Array;
  phases: Float32Array;
  edges: Uint16Array;
  adjacencyOffsets: Uint32Array;
  adjacencyIndices: Uint16Array;
}

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

export function createBrainGeometryData(serialized: SerializedBrainGeometry): BrainGeometryData {
  const particleCount = serialized.positions.length / 3;
  const adjacency: number[][] = Array.from({ length: particleCount }, (_, index) => {
    const start = serialized.adjacencyOffsets[index];
    const end = serialized.adjacencyOffsets[index + 1];
    return Array.from(serialized.adjacencyIndices.subarray(start, end));
  });

  return {
    positions: serialized.positions,
    phases: serialized.phases,
    normals: serialized.normals,
    edges: serialized.edges,
    edgeCount: serialized.edges.length / 2,
    particleCount,
    adjacency,
    edgeIndexByPair: buildEdgeIndexMap(serialized.edges, particleCount),
  };
}

export function serializeBrainGeometry(data: {
  positions: Float32Array;
  normals: Float32Array;
  phases: Float32Array;
  edges: Uint16Array;
  adjacency: number[][];
}): ArrayBuffer {
  const particleCount = data.positions.length / 3;
  const adjacencyOffsets = new Uint32Array(particleCount + 1);
  let adjacencyValueCount = 0;

  for (let i = 0; i < particleCount; i++) {
    adjacencyOffsets[i] = adjacencyValueCount;
    adjacencyValueCount += data.adjacency[i]?.length ?? 0;
  }
  adjacencyOffsets[particleCount] = adjacencyValueCount;

  const adjacencyIndices = new Uint16Array(adjacencyValueCount);
  for (let i = 0; i < particleCount; i++) {
    const neighbors = data.adjacency[i] ?? [];
    adjacencyIndices.set(neighbors, adjacencyOffsets[i]);
  }

  const positionsBytes = data.positions.byteLength;
  const normalsBytes = data.normals.byteLength;
  const phasesBytes = data.phases.byteLength;
  const edgesBytes = data.edges.byteLength;
  const adjacencyOffsetsBytes = adjacencyOffsets.byteLength;
  const adjacencyIndicesBytes = adjacencyIndices.byteLength;
  const totalBytes =
    HEADER_BYTES +
    positionsBytes +
    normalsBytes +
    phasesBytes +
    edgesBytes +
    adjacencyOffsetsBytes +
    adjacencyIndicesBytes;

  const buffer = new ArrayBuffer(totalBytes);
  const header = new Uint32Array(buffer, 0, HEADER_WORDS);
  header[0] = MAGIC;
  header[1] = VERSION;
  header[2] = particleCount;
  header[3] = data.edges.length;
  header[4] = adjacencyValueCount;
  header[5] = positionsBytes;
  header[6] = normalsBytes;
  header[7] = phasesBytes;

  let offset = HEADER_BYTES;
  new Uint8Array(buffer, offset, positionsBytes).set(new Uint8Array(data.positions.buffer, data.positions.byteOffset, positionsBytes));
  offset += positionsBytes;
  new Uint8Array(buffer, offset, normalsBytes).set(new Uint8Array(data.normals.buffer, data.normals.byteOffset, normalsBytes));
  offset += normalsBytes;
  new Uint8Array(buffer, offset, phasesBytes).set(new Uint8Array(data.phases.buffer, data.phases.byteOffset, phasesBytes));
  offset += phasesBytes;
  new Uint8Array(buffer, offset, edgesBytes).set(new Uint8Array(data.edges.buffer, data.edges.byteOffset, edgesBytes));
  offset += edgesBytes;
  new Uint8Array(buffer, offset, adjacencyOffsetsBytes).set(
    new Uint8Array(adjacencyOffsets.buffer, adjacencyOffsets.byteOffset, adjacencyOffsetsBytes),
  );
  offset += adjacencyOffsetsBytes;
  new Uint8Array(buffer, offset, adjacencyIndicesBytes).set(
    new Uint8Array(adjacencyIndices.buffer, adjacencyIndices.byteOffset, adjacencyIndicesBytes),
  );

  return buffer;
}

export function parseBrainGeometryAsset(buffer: ArrayBuffer): SerializedBrainGeometry {
  if (buffer.byteLength < HEADER_BYTES) {
    throw new Error('Brain geometry asset is too small');
  }

  const header = new Uint32Array(buffer, 0, HEADER_WORDS);
  if (header[0] !== MAGIC || header[1] !== VERSION) {
    throw new Error('Brain geometry asset has an unsupported format');
  }

  const particleCount = header[2];
  const edgeVertexCount = header[3];
  const adjacencyValueCount = header[4];
  const positionsBytes = header[5];
  const normalsBytes = header[6];
  const phasesBytes = header[7];
  const expectedPositionsBytes = particleCount * 3 * Float32Array.BYTES_PER_ELEMENT;
  const expectedNormalsBytes = particleCount * 3 * Float32Array.BYTES_PER_ELEMENT;
  const expectedPhasesBytes = particleCount * Float32Array.BYTES_PER_ELEMENT;
  const edgesBytes = edgeVertexCount * Uint16Array.BYTES_PER_ELEMENT;
  const adjacencyOffsetsBytes = (particleCount + 1) * Uint32Array.BYTES_PER_ELEMENT;
  const adjacencyIndicesBytes = adjacencyValueCount * Uint16Array.BYTES_PER_ELEMENT;

  if (
    positionsBytes !== expectedPositionsBytes ||
    normalsBytes !== expectedNormalsBytes ||
    phasesBytes !== expectedPhasesBytes
  ) {
    throw new Error('Brain geometry asset header does not match its typed array sizes');
  }

  const totalBytes =
    HEADER_BYTES +
    positionsBytes +
    normalsBytes +
    phasesBytes +
    edgesBytes +
    adjacencyOffsetsBytes +
    adjacencyIndicesBytes;

  if (buffer.byteLength !== totalBytes) {
    throw new Error('Brain geometry asset byte length does not match its header');
  }

  let offset = HEADER_BYTES;
  const positions = new Float32Array(buffer.slice(offset, offset + positionsBytes));
  offset += positionsBytes;
  const normals = new Float32Array(buffer.slice(offset, offset + normalsBytes));
  offset += normalsBytes;
  const phases = new Float32Array(buffer.slice(offset, offset + phasesBytes));
  offset += phasesBytes;
  const edges = new Uint16Array(buffer.slice(offset, offset + edgesBytes));
  offset += edgesBytes;
  const adjacencyOffsets = new Uint32Array(buffer.slice(offset, offset + adjacencyOffsetsBytes));
  offset += adjacencyOffsetsBytes;
  const adjacencyIndices = new Uint16Array(buffer.slice(offset, offset + adjacencyIndicesBytes));

  return { positions, normals, phases, edges, adjacencyOffsets, adjacencyIndices };
}
