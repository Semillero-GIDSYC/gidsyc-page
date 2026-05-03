import * as THREE from 'three';

/**
 * Procedurally generates a brain-like mesh geometry.
 *
 * The brain is built from two mirrored ellipsoidal hemispheres with:
 * - A central longitudinal fissure (medial gap)
 * - Simplex-noise-approximated surface deformation for organic sulci/gyri texture
 * - Frontal, parietal, temporal, and occipital lobe proportions
 *
 * Returns a merged BufferGeometry suitable for MeshSurfaceSampler.
 */

// Simple pseudo-noise function (avoids external dependency)
function hash(x: number, y: number, z: number): number {
  let h = x * 374761393 + y * 668265263 + z * 1274126177;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smoothNoise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  // Smoothstep interpolation
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const v000 = hash(ix, iy, iz);
  const v100 = hash(ix + 1, iy, iz);
  const v010 = hash(ix, iy + 1, iz);
  const v110 = hash(ix + 1, iy + 1, iz);
  const v001 = hash(ix, iy, iz + 1);
  const v101 = hash(ix + 1, iy, iz + 1);
  const v011 = hash(ix, iy + 1, iz + 1);
  const v111 = hash(ix + 1, iy + 1, iz + 1);

  const x00 = v000 + ux * (v100 - v000);
  const x10 = v010 + ux * (v110 - v010);
  const x01 = v001 + ux * (v101 - v001);
  const x11 = v011 + ux * (v111 - v011);

  const y0 = x00 + uy * (x10 - x00);
  const y1 = x01 + uy * (x11 - x01);

  return y0 + uz * (y1 - y0);
}

function fbmNoise(x: number, y: number, z: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value / maxValue;
}

export function generateBrainGeometry(): THREE.BufferGeometry {
  const segmentsU = 48;
  const segmentsV = 32;

  const leftVertices: number[] = [];
  const rightVertices: number[] = [];
  const leftIndices: number[] = [];
  const rightIndices: number[] = [];

  // Brain proportions (semi-axes of the ellipsoid)
  const scaleX = 1.0;   // lateral width (per hemisphere)
  const scaleY = 0.72;  // vertical height
  const scaleZ = 1.2;   // anterior-posterior length

  for (let j = 0; j <= segmentsV; j++) {
    const v = j / segmentsV;
    const phi = v * Math.PI; // 0 to PI (top to bottom)

    for (let i = 0; i <= segmentsU; i++) {
      const u = i / segmentsU;
      const theta = u * Math.PI; // 0 to PI (one hemisphere only)

      // Base ellipsoid position
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      let baseX = scaleX * sinPhi * sinTheta;
      let baseY = scaleY * cosPhi;
      let baseZ = scaleZ * sinPhi * cosTheta;

      // --- Anatomical deformations ---

      // Frontal lobe bulge (front of brain, Z > 0)
      const frontalBulge = Math.max(0, baseZ) * 0.15 * sinPhi;
      baseZ += frontalBulge;

      // Temporal lobe widening (lower sides)
      const temporalFactor = Math.max(0, -baseY - 0.1) * Math.max(0, sinPhi) * 0.3;
      baseX += baseX > 0 ? temporalFactor : -temporalFactor;

      // Occipital narrowing (back)
      const occipitalFactor = Math.max(0, -baseZ - 0.4) * 0.15;
      baseX *= (1 - occipitalFactor);

      // Central fissure: flatten the medial side
      const fissureDepth = 0.06;
      const medialFlatness = Math.exp(-baseX * baseX * 80) * fissureDepth;
      baseY -= medialFlatness * (1 - Math.abs(cosPhi) * 0.5);

      // --- Organic noise for sulci/gyri ---
      const noiseScale = 2.8;
      const noiseStrength = 0.08;
      const noise = fbmNoise(
        baseX * noiseScale + 10,
        baseY * noiseScale + 20,
        baseZ * noiseScale + 30,
        3
      );
      const noiseDisplacement = (noise - 0.5) * noiseStrength;

      // Apply noise along the surface normal direction (approximate)
      const nx = sinPhi * sinTheta;
      const ny = cosPhi;
      const nz = sinPhi * cosTheta;

      baseX += nx * noiseDisplacement;
      baseY += ny * noiseDisplacement;
      baseZ += nz * noiseDisplacement;

      // Left hemisphere (negative X side)
      leftVertices.push(-Math.abs(baseX) - 0.03, baseY, baseZ);

      // Right hemisphere (positive X side)
      rightVertices.push(Math.abs(baseX) + 0.03, baseY, baseZ);
    }
  }

  // Generate indices for triangle strips
  for (let j = 0; j < segmentsV; j++) {
    for (let i = 0; i < segmentsU; i++) {
      const a = j * (segmentsU + 1) + i;
      const b = a + 1;
      const c = a + (segmentsU + 1);
      const d = c + 1;

      leftIndices.push(a, c, b);
      leftIndices.push(b, c, d);
      rightIndices.push(a, c, b);
      rightIndices.push(b, c, d);
    }
  }

  // Merge both hemispheres into a single geometry
  const leftGeo = new THREE.BufferGeometry();
  leftGeo.setAttribute('position', new THREE.Float32BufferAttribute(leftVertices, 3));
  leftGeo.setIndex(leftIndices);
  leftGeo.computeVertexNormals();

  const rightGeo = new THREE.BufferGeometry();
  const rightOffset = leftVertices.length / 3;
  rightGeo.setAttribute('position', new THREE.Float32BufferAttribute(rightVertices, 3));
  rightGeo.setIndex(rightIndices.map(idx => idx + rightOffset));
  rightGeo.computeVertexNormals();

  // Merge into one
  const mergedPositions = new Float32Array(leftVertices.length + rightVertices.length);
  mergedPositions.set(leftVertices);
  mergedPositions.set(rightVertices, leftVertices.length);

  const mergedIndices = [
    ...leftIndices,
    ...rightIndices.map(idx => idx + rightOffset),
  ];

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(mergedPositions, 3));
  merged.setIndex(mergedIndices);
  merged.computeVertexNormals();

  return merged;
}
