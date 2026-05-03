import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import type { BrainGeometryData } from './useBrainGeometry';

interface PulseState {
  activations: Float32Array;
  lastPulseTime: number;
  nextPulseDelay: number;
  needsUpdate: boolean;
}

interface ActivePulse {
  origin: number;
  startTime: number;
  maxDepth: number;
  propagationSpeed: number;
  depths: {idx: number, depth: number}[];
}

export function usePulseSystem(brainData: BrainGeometryData) {
  const stateRef = useRef<PulseState>({
    activations: new Float32Array(brainData.particleCount),
    lastPulseTime: 0,
    nextPulseDelay: Math.random() * 4000 + 4000,
    needsUpdate: false,
  });

  const activePulsesRef = useRef<ActivePulse[]>([]);
  const cacheRef = useRef<Map<number, {idx: number, depth: number}[]>>(new Map());

  const getPulseDepths = useCallback((origin: number) => {
    if (cacheRef.current.has(origin)) return cacheRef.current.get(origin)!;

    const { adjacency, particleCount } = brainData;
    const depths = new Int8Array(particleCount).fill(-1);
    const queue: [number, number][] = [[origin, 0]];
    depths[origin] = 0;

    const maxDepth = 8;
    const result: {idx: number, depth: number}[] = [];

    while (queue.length > 0) {
      const [idx, d] = queue.shift()!;
      result.push({idx, depth: d});

      if (d < maxDepth) {
        const neighbors = adjacency[idx];
        for (let i = 0; i < neighbors.length; i++) {
          const n = neighbors[i];
          if (depths[n] === -1) {
            depths[n] = d + 1;
            queue.push([n, d + 1]);
          }
        }
      }
    }
    
    // Cap cache size
    if (cacheRef.current.size > 100) cacheRef.current.clear();
    cacheRef.current.set(origin, result);
    return result;
  }, [brainData]);

  const triggerPulse = useCallback((originIndex?: number) => {
    const origin = originIndex ?? Math.floor(Math.random() * brainData.particleCount);
    
    activePulsesRef.current.push({
      origin,
      startTime: performance.now(),
      maxDepth: 8,
      propagationSpeed: 16.0, // Slower, softer propagation (was 45)
      depths: getPulseDepths(origin),
    });
    
    stateRef.current.needsUpdate = true;
  }, [brainData.particleCount, getPulseDepths]);

  const triggerPulseAt = useCallback((index: number) => {
    triggerPulse(index);
  }, [triggerPulse]);

  useFrame((_, delta) => {
    const state = stateRef.current;
    state.needsUpdate = false;
    const now = performance.now();

    if (now - state.lastPulseTime > state.nextPulseDelay) {
      triggerPulse();
      state.lastPulseTime = now;
      state.nextPulseDelay = Math.random() * 2000 + 1500; // Faster frequency (1.5s - 3.5s)
    }

    const { activations } = state;
    const pulses = activePulsesRef.current;

    if (pulses.length > 0) {
      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const p = pulses[pIdx];
        const elapsed = (now - p.startTime) / 1000;
        const currentReach = elapsed * p.propagationSpeed;

        let pulseFinished = true;
        for (let i = 0; i < p.depths.length; i++) {
          const {idx, depth} = p.depths[i];
          if (depth <= currentReach) {
            const strength = 1.0 - (depth / p.maxDepth);
            if (activations[idx] < strength) {
              activations[idx] = strength;
              state.needsUpdate = true;
            }
          } else {
            pulseFinished = false;
          }
        }

        if (pulseFinished || elapsed > 3.0) {
          pulses.splice(pIdx, 1);
        }
      }
    }

    const decay = Math.pow(0.965, delta * 60); // Slower decay (was 0.94) to let pulse linger
    let activeAny = false;

    for (let i = 0; i < activations.length; i++) {
      if (activations[i] > 0.01) {
        activations[i] *= decay;
        activeAny = true;
      } else if (activations[i] > 0) {
        activations[i] = 0;
        state.needsUpdate = true;
      }
    }

    if (activeAny) {
      state.needsUpdate = true;
    }
  });

  return {
    activations: stateRef.current.activations,
    stateRef,
    triggerPulse,
    triggerPulseAt,
  };
}
