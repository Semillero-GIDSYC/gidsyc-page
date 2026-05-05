// GLSL shaders for the brain connectome visualization

// --- Particle Shaders ---

export const particleVertex = /* glsl */ `
  attribute float aPhase;
  attribute vec3 aNormal;
  attribute float aPulseTime0;
  attribute float aPulseTime1;
  attribute float aPulseTime2;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uBaseSize;
  uniform float uNormalAmplitude;
  uniform float uPulseDuration;

  varying float vPulse;
  varying float vBrightness;
  varying float vDepth;
  varying float vBoundaryFade;

  float pulseAt(float pulseTime) {
    float t = uTime - pulseTime;
    float attack = smoothstep(0.0, 0.08, t);
    float release = 1.0 - smoothstep(0.12, uPulseDuration, t);
    return max(0.0, attack * release);
  }

  void main() {
    float breath = 0.55 + sin(uTime * 1.5 + aPhase) * 0.12;
    float pulse = max(pulseAt(aPulseTime0), max(pulseAt(aPulseTime1), pulseAt(aPulseTime2)));

    vPulse = pulse;
    vBrightness = breath + pulse * 1.0;

    vec3 animatedPosition = position + aNormal * sin(uTime + aPhase) * uNormalAmplitude;
    vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    vDepth = -mvPosition.z;
    float sizeFalloff = clamp(11.0 / vDepth, 0.6, 2.5);
    gl_PointSize = uBaseSize * uPixelRatio * sizeFalloff * mix(1.0, 1.8, pulse);
    gl_Position = projectionMatrix * mvPosition;
    vec2 ndc = gl_Position.xy / gl_Position.w;
    float edgeDistance = min(1.0 - abs(ndc.x), 1.0 - abs(ndc.y));
    vBoundaryFade = smoothstep(0.0, 0.18, edgeDistance);
  }
`;

export const particleFragment = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uPulseColor;
  uniform float uMaxDepth;
  uniform float uIntroOpacity;

  varying float vPulse;
  varying float vBrightness;
  varying float vDepth;
  varying float vBoundaryFade;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float softEdge = 1.0 - smoothstep(0.2, 0.5, dist);
    vec3 color = mix(uBaseColor, uPulseColor, vPulse);
    
    float depthFade = clamp(1.0 - (vDepth / uMaxDepth) * 0.35, 0.35, 1.0);
    float alpha = softEdge * vBrightness * depthFade * vBoundaryFade * 0.9 * uIntroOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`;

// --- Connection Shaders ---

export const connectionVertex = /* glsl */ `
  attribute float aPhase;
  attribute vec3 aNormal;
  attribute float aEdgeCoord;
  attribute float aPulseStart0;
  attribute float aPulseStart1;
  attribute float aPulseStart2;
  attribute float aPulseDirection0;
  attribute float aPulseDirection1;
  attribute float aPulseDirection2;

  uniform float uTime;
  uniform float uNormalAmplitude;
  uniform float uPulseTravelDuration;
  uniform float uPulseWidth;

  varying float vPulse;
  varying float vDepth;
  varying float vBoundaryFade;

  float edgePulse(float pulseStart, float direction) {
    float t = (uTime - pulseStart) / uPulseTravelDuration;
    float pulseActivity = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.92, 1.15, t));
    float center = direction > 0.0 ? t : 1.0 - t;
    float distanceToWave = abs(aEdgeCoord - center);
    return exp(-pow(distanceToWave / uPulseWidth, 2.0)) * pulseActivity;
  }

  void main() {
    vPulse = max(
      edgePulse(aPulseStart0, aPulseDirection0),
      max(edgePulse(aPulseStart1, aPulseDirection1), edgePulse(aPulseStart2, aPulseDirection2))
    );

    vec3 animatedPosition = position + aNormal * sin(uTime + aPhase) * uNormalAmplitude;
    vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    vec2 ndc = gl_Position.xy / gl_Position.w;
    float edgeDistance = min(1.0 - abs(ndc.x), 1.0 - abs(ndc.y));
    vBoundaryFade = smoothstep(0.0, 0.18, edgeDistance);
  }
`;

export const connectionFragment = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uPulseColor;
  uniform float uMaxDepth;
  uniform float uIntroOpacity;

  varying float vPulse;
  varying float vDepth;
  varying float vBoundaryFade;

  void main() {
    float depthFade = clamp(1.0 - (vDepth / uMaxDepth) * 0.45, 0.2, 1.0);
    vec3 color = mix(uBaseColor, uPulseColor, vPulse);
    
    float intensity = smoothstep(0.0, 1.0, vPulse);
    float alpha = mix(0.18, 0.86, intensity) * depthFade * vBoundaryFade * uIntroOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`;
