// GLSL shaders for the brain connectome visualization

// --- Particle Shaders ---

export const particleVertex = /* glsl */ `
  attribute float aActivation;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uBaseSize;

  varying float vActivation;
  varying float vBrightness;
  varying float vDepth;

  void main() {
    float breath = 0.2 + sin(uTime * 1.5 + aPhase) * 0.15;
    float pulse = smoothstep(0.0, 1.0, aActivation);

    vActivation = pulse;
    vBrightness = breath + pulse * 1.0;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mvPosition.z;
    float sizeFalloff = clamp(11.0 / vDepth, 0.6, 2.5);
    gl_PointSize = uBaseSize * uPixelRatio * sizeFalloff * mix(1.0, 1.8, pulse);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragment = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uPulseColor;
  uniform float uMaxDepth;

  varying float vActivation;
  varying float vBrightness;
  varying float vDepth;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float softEdge = 1.0 - smoothstep(0.2, 0.5, dist);
    vec3 color = mix(uBaseColor, uPulseColor, vActivation);
    
    // Depth fade: slightly more forgiving floor (0.1) so back nodes aren't totally lost
    float depthFade = clamp(1.0 - (vDepth / uMaxDepth) * 0.5, 0.15, 1.0);
    float alpha = softEdge * vBrightness * depthFade;

    gl_FragColor = vec4(color, alpha);
  }
`;

// --- Connection Shaders ---

export const connectionVertex = /* glsl */ `
  attribute float aVertexActivation;

  varying float vActivation;
  varying float vDepth;

  void main() {
    vActivation = aVertexActivation;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const connectionFragment = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uPulseColor;
  uniform float uMaxDepth;

  varying float vActivation;
  varying float vDepth;

  void main() {
    // Aggressive but slightly visible depth fade for links
    float depthFade = clamp(1.0 - (vDepth / uMaxDepth) * 0.6, 0.08, 1.0);
    vec3 color = mix(uBaseColor, uPulseColor, vActivation);
    
    float intensity = smoothstep(0.0, 1.0, vActivation);
    // Higher base alpha (0.12 instead of 0.04) so static connections are visible
    float alpha = mix(0.12, 0.7, intensity) * depthFade;

    gl_FragColor = vec4(color, alpha);
  }
`;
