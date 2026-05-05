import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

import {
  computeBoundaryFade,
  computeCanvasBrainFrame,
  projectCanvasBrainPoint,
} from './brainFraming';
import { loadBrainPointCloud } from './brainPointCloudLoader';
import {
  addInnerPointLayer,
  computeBrainConnections,
  computePointCloudNormals,
  samplePointCloud,
} from './brainPointCloudProcessing';
import {
  buildEdgeIndexMap,
  createPulseScheduleData,
  schedulePulse,
  type PulseScheduleData,
} from './brainPulseScheduler';

interface BrainPointCloudCanvasProps {
  pointCount?: number;
}

export function BrainPointCloudCanvas({ pointCount = 2400 }: BrainPointCloudCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionsRef = useRef<Float32Array | null>(null);
  const projectedRef = useRef<Float32Array | null>(null);
  const edgesRef = useRef<Uint16Array | null>(null);
  const adjacencyRef = useRef<number[][] | null>(null);
  const edgeIndexByPairRef = useRef<Map<number, number> | null>(null);
  const scheduleRef = useRef<PulseScheduleData | null>(null);
  const nextSlotRef = useRef(0);
  const lastAutoPulseRef = useRef(0);
  const nextAutoPulseDelayRef = useRef(2.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      return;
    }

    let animationFrame = 0;
    let mounted = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const scheduleCanvasPulse = (origin: number, startTime: number) => {
      const positions = positionsRef.current;
      const edges = edgesRef.current;
      const adjacency = adjacencyRef.current;
      const edgeIndexByPair = edgeIndexByPairRef.current;
      const schedule = scheduleRef.current;
      if (!positions || !edges || !adjacency || !edgeIndexByPair || !schedule) {
        return;
      }

      const slot = nextSlotRef.current;
      schedulePulse({
        adjacency,
        edges,
        edgeIndexByPair,
        particleCount: positions.length / 3,
        origin,
        slot,
        startTime,
      }, schedule);
      nextSlotRef.current = (slot + 1) % 3;
    };

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const time = performance.now() * 0.001;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      const positions = positionsRef.current;
      const edges = edgesRef.current;
      const schedule = scheduleRef.current;

      if (positions && edges && schedule) {
        const count = positions.length / 3;
        const angle = -0.18 + Math.sin(time * 0.22) * 0.05;
        const frame = computeCanvasBrainFrame(positions, width, height, angle);
        const projected = projectedRef.current?.length === count * 2
          ? projectedRef.current
          : new Float32Array(count * 2);
        projectedRef.current = projected;

        for (let i = 0; i < count; i++) {
          projectCanvasBrainPoint(positions, i, frame, projected);
        }

        if (time - lastAutoPulseRef.current > nextAutoPulseDelayRef.current) {
          scheduleCanvasPulse(Math.floor(Math.random() * count), time);
          lastAutoPulseRef.current = time;
          nextAutoPulseDelayRef.current = Math.random() * 2 + 2.5;
        }

        ctx.lineWidth = 0.65;
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.15)';
        ctx.beginPath();
        for (let i = 0; i < edges.length; i += 2) {
          const a = edges[i] * 2;
          const b = edges[i + 1] * 2;
          const fade = Math.min(
            computeBoundaryFade(projected[a], projected[a + 1], width, height),
            computeBoundaryFade(projected[b], projected[b + 1], width, height),
          );
          if (fade <= 0) {
            continue;
          }

          ctx.moveTo(projected[a], projected[a + 1]);
          ctx.lineTo(projected[b], projected[b + 1]);
        }
        ctx.stroke();

        ctx.lineWidth = 1.7;
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.52)';
        drawCanvasPulseEdges(ctx, projected, edges, schedule, width, height, time);

        for (let i = 0; i < count; i++) {
          const x = projected[i * 2];
          const y = projected[i * 2 + 1];
          const fade = computeBoundaryFade(x, y, width, height);
          const pulse = Math.max(
            fallbackNodePulse(schedule.nodePulseTimes[0][i], time),
            fallbackNodePulse(schedule.nodePulseTimes[1][i], time),
            fallbackNodePulse(schedule.nodePulseTimes[2][i], time),
          );
          const breath = 0.65 + Math.sin(time * 1.3 + i * 0.37) * 0.2;
          ctx.fillStyle = `rgba(15, 23, 42, ${(0.24 * breath + pulse * 0.42) * fade})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.2 + pulse * 1.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();

    loadBrainPointCloud()
      .then((pointCloud) => {
        if (!mounted) {
          return;
        }

        const surfacePositions = samplePointCloud(pointCloud, pointCount);
        const surfaceNormals = computePointCloudNormals(surfacePositions, surfacePositions.length / 3, 16);
        const positions = addInnerPointLayer(surfacePositions, surfaceNormals, 0.15);
        const connections = computeBrainConnections(positions, positions.length / 3, 3, 5);
        positionsRef.current = positions;
        edgesRef.current = connections.edges;
        adjacencyRef.current = connections.adjacency;
        edgeIndexByPairRef.current = buildEdgeIndexMap(connections.edges, positions.length / 3);
        scheduleRef.current = createPulseScheduleData(positions.length / 3, connections.edges.length);
      })
      .catch((error) => {
        console.error(error);
      });

    draw();

    return () => {
      mounted = false;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [pointCount]);

  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const projected = projectedRef.current;
    const positions = positionsRef.current;
    const edges = edgesRef.current;
    const adjacency = adjacencyRef.current;
    const edgeIndexByPair = edgeIndexByPairRef.current;
    const schedule = scheduleRef.current;
    if (!projected || !positions || !edges || !adjacency || !edgeIndexByPair || !schedule) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let nearest = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < projected.length; i += 2) {
      const dx = projected[i] - x;
      const dy = projected[i + 1] - y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i / 2;
      }
    }

    const slot = nextSlotRef.current;
    schedulePulse({
      adjacency,
      edges,
      edgeIndexByPair,
      particleCount: positions.length / 3,
      origin: nearest,
      slot,
      startTime: performance.now() * 0.001,
    }, schedule);
    nextSlotRef.current = (slot + 1) % 3;
  };

  return <canvas ref={canvasRef} onClick={handleClick} className="absolute inset-0 h-full w-full bg-slate-50" />;
}

function fallbackNodePulse(pulseTime: number, time: number): number {
  const elapsed = time - pulseTime;
  if (elapsed < 0 || elapsed > 0.7) {
    return 0;
  }

  const attack = Math.min(elapsed / 0.08, 1);
  const release = 1 - Math.min(Math.max((elapsed - 0.12) / 0.58, 0), 1);
  return attack * release;
}

function drawCanvasPulseEdges(
  ctx: CanvasRenderingContext2D,
  projected: Float32Array,
  edges: Uint16Array,
  schedule: PulseScheduleData,
  width: number,
  height: number,
  time: number,
): void {
  for (let edgeOffset = 0; edgeOffset < edges.length; edgeOffset += 2) {
    const a = edges[edgeOffset] * 2;
    const b = edges[edgeOffset + 1] * 2;
    const fade = Math.min(
      computeBoundaryFade(projected[a], projected[a + 1], width, height),
      computeBoundaryFade(projected[b], projected[b + 1], width, height),
    );
    if (fade <= 0) {
      continue;
    }

    for (let slot = 0; slot < 3; slot++) {
      const start = schedule.edgePulseStarts[slot][edgeOffset];
      const progress = (time - start) / 0.46;
      if (progress < 0 || progress > 1.12) {
        continue;
      }

      const direction = schedule.edgePulseDirections[slot][edgeOffset];
      const center = direction > 0 ? progress : 1 - progress;
      const startT = Math.max(0, center - 0.12);
      const endT = Math.min(1, center + 0.12);
      const attack = Math.min(Math.max(progress / 0.08, 0), 1);
      const release = 1 - Math.min(Math.max((progress - 0.92) / 0.2, 0), 1);

      ctx.globalAlpha = fade * attack * release;
      ctx.beginPath();
      ctx.moveTo(
        projected[a] + (projected[b] - projected[a]) * startT,
        projected[a + 1] + (projected[b + 1] - projected[a + 1]) * startT,
      );
      ctx.lineTo(
        projected[a] + (projected[b] - projected[a]) * endT,
        projected[a + 1] + (projected[b + 1] - projected[a + 1]) * endT,
      );
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}
