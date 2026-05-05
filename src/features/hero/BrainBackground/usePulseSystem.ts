import { useCallback, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { BrainGeometryData } from './useBrainGeometry';
import {
  PULSE_SLOT_COUNT,
  createPulseScheduleData,
  schedulePulse,
  type PulseScheduleData,
} from './brainPulseScheduler';

interface PulseSystemState {
  nextSlot: number;
  lastPulseTime: number;
  nextPulseDelay: number;
  version: number;
}

export interface BrainPulseSystem {
  schedule: PulseScheduleData;
  versionRef: MutableRefObject<number>;
  triggerPulse: (originIndex?: number) => void;
  triggerPulseAt: (index: number) => void;
}

export function usePulseSystem(brainData: BrainGeometryData): BrainPulseSystem {
  const schedule = useMemo(() => {
    return createPulseScheduleData(brainData.particleCount, brainData.edges.length);
  }, [brainData.edges.length, brainData.particleCount]);

  const stateRef = useRef<PulseSystemState>({
    nextSlot: 0,
    lastPulseTime: 0,
    nextPulseDelay: Math.random() * 2 + 2.5,
    version: 0,
  });
  const versionRef = useRef(0);
  const currentTimeRef = useRef(0);

  const triggerPulse = useCallback((originIndex?: number) => {
    const state = stateRef.current;
    const origin = originIndex ?? Math.floor(Math.random() * brainData.particleCount);
    const slot = state.nextSlot;

    schedulePulse({
      adjacency: brainData.adjacency,
      edges: brainData.edges,
      edgeIndexByPair: brainData.edgeIndexByPair,
      particleCount: brainData.particleCount,
      origin,
      slot,
      startTime: currentTimeRef.current,
    }, schedule);

    state.nextSlot = (slot + 1) % PULSE_SLOT_COUNT;
    state.version++;
    versionRef.current = state.version;
  }, [brainData, schedule]);

  const triggerPulseAt = useCallback((index: number) => {
    triggerPulse(index);
  }, [triggerPulse]);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    const pulseState = stateRef.current;
    currentTimeRef.current = now;

    if (now - pulseState.lastPulseTime > pulseState.nextPulseDelay) {
      triggerPulse();
      pulseState.lastPulseTime = now;
      pulseState.nextPulseDelay = Math.random() * 2 + 2.5;
    }
  });

  return {
    schedule,
    versionRef,
    triggerPulse,
    triggerPulseAt,
  };
}
