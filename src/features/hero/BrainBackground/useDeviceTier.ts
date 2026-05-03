import { useMemo } from 'react';

export interface DeviceTier {
  tier: 'high' | 'medium' | 'low';
  particleCount: number;
  edgeK: number;
  enableBloom: boolean;
  dpr: [number, number];
  supportsWebGL: boolean;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

function detectTier(): DeviceTier {
  const supportsWebGL = detectWebGL();

  if (!supportsWebGL) {
    return {
      tier: 'low',
      particleCount: 300,
      edgeK: 3,
      enableBloom: false,
      dpr: [1, 1],
      supportsWebGL: false,
    };
  }

  const cores = navigator.hardwareConcurrency || 2;
  const width = window.innerWidth;
  const isMobile = width < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isTablet = width >= 768 && width < 1024;

  // Attempt to read GPU info from WebGL
  let isLowEndGPU = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        isLowEndGPU = /intel|mesa|swiftshader|llvmpipe|softpipe/i.test(renderer);
      }
    }
  } catch {
    // Ignore
  }

  if (isMobile || cores <= 2 || (isLowEndGPU && cores <= 4)) {
    return {
      tier: 'low',
      particleCount: 500,
      edgeK: 3,
      enableBloom: false,
      dpr: [1, 1],
      supportsWebGL: true,
    };
  }

  if (isTablet || cores <= 4 || isLowEndGPU) {
    return {
      tier: 'medium',
      particleCount: 1000,
      edgeK: 4,
      enableBloom: false,
      dpr: [1, 1.5],
      supportsWebGL: true,
    };
  }

  return {
    tier: 'high',
    particleCount: 1600,
    edgeK: 5,
    enableBloom: true,
    dpr: [1, 2],
    supportsWebGL: true,
  };
}

export function useDeviceTier(): DeviceTier {
  return useMemo(() => detectTier(), []);
}
