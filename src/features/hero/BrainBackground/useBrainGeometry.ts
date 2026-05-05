import { useEffect, useState } from 'react';

import highGeometryUrl from './generated/brain-high.bin?url';
import lowGeometryUrl from './generated/brain-low.bin?url';
import mediumGeometryUrl from './generated/brain-medium.bin?url';
import {
  createBrainGeometryData,
  parseBrainGeometryAsset,
  type BrainGeometryData,
} from './brainGeometryAsset';
import type { DeviceTier } from './useDeviceTier';

export type { BrainGeometryData } from './brainGeometryAsset';

const geometryUrls: Record<DeviceTier['tier'], string> = {
  high: highGeometryUrl,
  medium: mediumGeometryUrl,
  low: lowGeometryUrl,
};

const geometryPromises = new Map<DeviceTier['tier'], Promise<BrainGeometryData>>();

function loadPrecomputedBrainGeometry(tier: DeviceTier['tier']): Promise<BrainGeometryData> {
  const existing = geometryPromises.get(tier);
  if (existing) {
    return existing;
  }

  const promise = fetch(geometryUrls[tier])
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load ${tier} brain geometry: ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then(parseBrainGeometryAsset)
    .then(createBrainGeometryData);

  geometryPromises.set(tier, promise);
  return promise;
}

export function useBrainGeometry(tier: DeviceTier['tier']): BrainGeometryData | null {
  const [brainData, setBrainData] = useState<BrainGeometryData | null>(null);

  useEffect(() => {
    let mounted = true;
    setBrainData(null);

    loadPrecomputedBrainGeometry(tier)
      .then((geometry) => {
        if (mounted) {
          setBrainData(geometry);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      mounted = false;
    };
  }, [tier]);

  return brainData;
}
