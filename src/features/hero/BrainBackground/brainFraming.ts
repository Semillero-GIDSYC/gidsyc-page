export interface BrainFrame {
  angleX: number;
  angleY: number;
  scale: number;
  xStretch: number;
  yStretch: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

interface Bounds2D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface CanvasBrainFrame {
  angle: number;
  centerX: number;
  centerY: number;
  scale: number;
  xStretch: number;
  yStretch: number;
  bounds: Bounds2D;
}

const TARGET_WIDTH = 1.16;
const TARGET_HEIGHT = 0.78;
const MAX_X_STRETCH = 1.32;
const CENTER_Y_RATIO = 0.49;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createEmptyBounds(): Bounds2D {
  return { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
}

function expandBounds(bounds: Bounds2D, x: number, y: number): void {
  bounds.minX = Math.min(bounds.minX, x);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxY = Math.max(bounds.maxY, y);
}

function rotateForWorld(x: number, y: number, z: number, angleX: number, angleY: number): [number, number] {
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const yawX = x * cosY + z * sinY;
  const yawZ = -x * sinY + z * cosY;
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  return [yawX, y * cosX - yawZ * sinX];
}

export function computeBrainWorldFrame(
  positions: Float32Array,
  viewportWidth: number,
  viewportHeight: number,
  angleX: number,
  angleY: number,
): BrainFrame {
  const bounds = createEmptyBounds();
  const count = positions.length / 3;

  for (let i = 0; i < count; i++) {
    const [x, y] = rotateForWorld(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2],
      angleX,
      angleY,
    );
    expandBounds(bounds, x, y);
  }

  const boundsWidth = Math.max(bounds.maxX - bounds.minX, 0.001);
  const boundsHeight = Math.max(bounds.maxY - bounds.minY, 0.001);
  const targetWidth = viewportWidth * TARGET_WIDTH;
  const targetHeight = viewportHeight * TARGET_HEIGHT;
  const widthScale = targetWidth / boundsWidth;
  const heightScale = targetHeight / boundsHeight;
  const baseScale = Math.min(widthScale, heightScale);
  const effectiveXStretch = clamp(widthScale / baseScale, 1, MAX_X_STRETCH);
  
  // Maintain the horizontal scaling it had before, but apply it uniformly
  // to avoid deforming the brain. This naturally fills vertical space.
  const scale = baseScale * effectiveXStretch;
  const xStretch = 1;
  const centerX = (bounds.minX + bounds.maxX) * 0.5;
  const centerY = (bounds.minY + bounds.maxY) * 0.5;
  const desiredY = viewportHeight * (0.5 - CENTER_Y_RATIO);

  return {
    angleX,
    angleY,
    scale,
    xStretch,
    yStretch: 1,
    positionX: -centerX * scale * xStretch,
    positionY: desiredY - centerY * scale,
    positionZ: 0,
  };
}

function projectCanvasPoint(x: number, y: number, z: number, angle: number): [number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rotatedX = x * cos - z * sin;
  const rotatedZ = x * sin + z * cos;
  return [rotatedZ * 0.72, -y * 0.64 + rotatedX * 0.08];
}

export function computeCanvasBrainFrame(
  positions: Float32Array,
  width: number,
  height: number,
  angle: number,
): CanvasBrainFrame {
  const bounds = createEmptyBounds();
  const count = positions.length / 3;

  for (let i = 0; i < count; i++) {
    const [x, y] = projectCanvasPoint(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2],
      angle,
    );
    expandBounds(bounds, x, y);
  }

  const boundsWidth = Math.max(bounds.maxX - bounds.minX, 0.001);
  const boundsHeight = Math.max(bounds.maxY - bounds.minY, 0.001);
  const widthScale = (width * TARGET_WIDTH) / boundsWidth;
  const heightScale = (height * TARGET_HEIGHT) / boundsHeight;
  const baseScale = Math.min(widthScale, heightScale);
  const effectiveXStretch = clamp(widthScale / baseScale, 1, MAX_X_STRETCH);
  
  const scale = baseScale * effectiveXStretch;
  const xStretch = 1;

  return {
    angle,
    centerX: width * 0.5,
    centerY: height * CENTER_Y_RATIO,
    scale,
    xStretch,
    yStretch: 1,
    bounds,
  };
}

export function projectCanvasBrainPoint(
  positions: Float32Array,
  index: number,
  frame: CanvasBrainFrame,
  target: Float32Array,
): void {
  const [x, y] = projectCanvasPoint(
    positions[index * 3],
    positions[index * 3 + 1],
    positions[index * 3 + 2],
    frame.angle,
  );
  const midX = (frame.bounds.minX + frame.bounds.maxX) * 0.5;
  const midY = (frame.bounds.minY + frame.bounds.maxY) * 0.5;
  target[index * 2] = frame.centerX + (x - midX) * frame.scale * frame.xStretch;
  target[index * 2 + 1] = frame.centerY + (y - midY) * frame.scale * frame.yStretch;
}

export function computeBoundaryFade(x: number, y: number, width: number, height: number): number {
  const margin = Math.min(width, height) * 0.1;
  const distance = Math.min(x, width - x, y, height - y);
  return clamp(distance / margin, 0, 1);
}
