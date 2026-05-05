import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  addInnerPointLayer,
  computeBrainConnections,
  computePointCloudNormals,
  createPhases,
  samplePointCloud,
} from '../src/features/hero/BrainBackground/brainPointCloudProcessing';
import { serializeBrainGeometry } from '../src/features/hero/BrainBackground/brainGeometryAsset';

interface BrainTierConfig {
  name: string;
  particleCount: number;
  edgeK: number;
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.join(projectRoot, 'src/features/hero/BrainBackground/brainPointCloud.bin');
const outputDir = path.join(projectRoot, 'src/features/hero/BrainBackground/generated');

const tiers: BrainTierConfig[] = [
  { name: 'low', particleCount: 2000, edgeK: 3 },
  { name: 'medium', particleCount: 4000, edgeK: 4 },
  { name: 'high', particleCount: 7000, edgeK: 3 },
];

async function loadSourcePointCloud(): Promise<Float32Array> {
  const buffer = await readFile(inputPath);
  if (buffer.byteLength % Float32Array.BYTES_PER_ELEMENT !== 0) {
    throw new Error('Source brain point cloud binary has an invalid byte length');
  }

  return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Float32Array.BYTES_PER_ELEMENT);
}

function buildTierGeometry(sourcePointCloud: Float32Array, config: BrainTierConfig): ArrayBuffer {
  const surfacePositions = samplePointCloud(sourcePointCloud, config.particleCount);
  const surfaceCount = surfacePositions.length / 3;
  const surfaceNormals = computePointCloudNormals(surfacePositions, surfaceCount, 16);
  const positions = addInnerPointLayer(surfacePositions, surfaceNormals, 0.15);
  const count = positions.length / 3;
  const phases = createPhases(positions, count);
  const normals = computePointCloudNormals(positions, count, 16);
  const { edges, adjacency } = computeBrainConnections(positions, count, config.edgeK, 6);

  return serializeBrainGeometry({ positions, normals, phases, edges, adjacency });
}

async function main() {
  const sourcePointCloud = await loadSourcePointCloud();
  await mkdir(outputDir, { recursive: true });

  for (const tier of tiers) {
    const started = performance.now();
    const geometry = buildTierGeometry(sourcePointCloud, tier);
    const outputPath = path.join(outputDir, `brain-${tier.name}.bin`);
    await writeFile(outputPath, Buffer.from(geometry));
    const duration = Math.round(performance.now() - started);
    const kilobytes = Math.round(geometry.byteLength / 1024);
    console.log(`Wrote ${path.relative(projectRoot, outputPath)} (${kilobytes} KiB, ${duration} ms)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
