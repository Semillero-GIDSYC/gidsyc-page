import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DOMParser } from '@xmldom/xmldom';
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

interface ExtractOptions {
  source: string;
  output: string;
  count: number;
  seed: number;
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const defaultOptions: ExtractOptions = {
  source: path.join(projectRoot, 'assets/human-brain/source/model/model.dae'),
  output: path.join(projectRoot, 'src/features/hero/BrainBackground/brainPointCloud.bin'),
  count: 8192,
  seed: 1337,
};

function parseArgs(): ExtractOptions {
  const options = { ...defaultOptions };

  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) {
      continue;
    }

    switch (key.slice(2)) {
      case 'source':
        options.source = path.resolve(value);
        break;
      case 'output':
        options.output = path.resolve(value);
        break;
      case 'count':
        options.count = Number(value);
        break;
      case 'seed':
        options.seed = Number(value);
        break;
    }
  }

  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error('--count must be a positive integer');
  }

  if (!Number.isFinite(options.seed)) {
    throw new Error('--seed must be a finite number');
  }

  return options;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function collectMeshGeometries(scene: THREE.Object3D): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];

  scene.updateMatrixWorld(true);
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry?.getAttribute('position')) {
      return;
    }

    const sourceGeometry = mesh.geometry as THREE.BufferGeometry;
    const geometry = sourceGeometry.index ? sourceGeometry.toNonIndexed() : sourceGeometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    geometry.deleteAttribute('normal');
    geometry.computeVertexNormals();
    geometries.push(geometry);
  });

  if (geometries.length === 0) {
    throw new Error('No mesh geometry was found in the Collada scene');
  }

  return geometries;
}

function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const vertexCount = geometries.reduce((total, geometry) => {
    return total + geometry.getAttribute('position').count;
  }, 0);

  const positions = new Float32Array(vertexCount * 3);
  let offset = 0;

  for (const geometry of geometries) {
    const source = geometry.getAttribute('position').array as Float32Array;
    positions.set(source, offset);
    offset += source.length;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.computeVertexNormals();

  return merged;
}

function normalizeGeometry(geometry: THREE.BufferGeometry): void {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  if (!bounds) {
    throw new Error('Unable to compute model bounds');
  }

  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const scale = 2 / Math.max(size.x, size.y, size.z);
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute;

  for (let i = 0; i < positions.count; i++) {
    positions.setXYZ(
      i,
      (positions.getX(i) - center.x) * scale,
      (positions.getY(i) - center.y) * scale,
      (positions.getZ(i) - center.z) * scale,
    );
  }

  positions.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeVertexNormals();
}

function sampleSurfacePoints(geometry: THREE.BufferGeometry, count: number, seed: number): Float32Array {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  const sampler = new MeshSurfaceSampler(mesh).setWeightAttribute(null);
  (sampler as MeshSurfaceSampler & { setRandomGenerator: (random: () => number) => MeshSurfaceSampler })
    .setRandomGenerator(createSeededRandom(seed));
  sampler.build();

  const positions = new Float32Array(count * 3);
  const point = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    sampler.sample(point);
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  }

  return positions;
}

async function main() {
  const options = parseArgs();
  const globals = globalThis as unknown as Record<string, unknown>;
  globals.DOMParser = DOMParser;

  const dae = await readFile(options.source, 'utf8');
  const loader = new ColladaLoader();
  const collada = loader.parse(dae, `${path.dirname(options.source)}/`);

  if (!collada) {
    throw new Error('ColladaLoader failed to parse the brain model');
  }

  const geometries = collectMeshGeometries(collada.scene);
  const merged = mergeGeometries(geometries);
  normalizeGeometry(merged);

  const pointCloud = sampleSurfacePoints(merged, options.count, options.seed);
  await mkdir(path.dirname(options.output), { recursive: true });
  await writeFile(options.output, Buffer.from(pointCloud.buffer));

  for (const geometry of geometries) {
    geometry.dispose();
  }
  merged.dispose();

  const bytes = pointCloud.byteLength;
  console.log(`Extracted ${options.count} points from ${geometries.length} meshes`);
  console.log(`Wrote ${path.relative(projectRoot, options.output)} (${bytes} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
