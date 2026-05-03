import { useEffect, useRef, MouseEvent } from 'react';

// Brain silhouette path (SVG path data scaled and translated)
// Approximates a side view of a human brain
function drawBrainPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  
  ctx.beginPath();
  ctx.moveTo(-100, 20);
  ctx.bezierCurveTo(-110, -50, -40, -100, 0, -110);
  ctx.bezierCurveTo(50, -120, 100, -80, 110, -30);
  ctx.bezierCurveTo(120, 20, 100, 70, 70, 90);
  ctx.bezierCurveTo(40, 110, -10, 100, -30, 80);
  ctx.bezierCurveTo(-50, 60, -70, 70, -90, 50);
  ctx.closePath();
  
  ctx.restore();
}

/**
 * Spatial Grid for fast neighbor lookups in 2D
 */
class Grid2D {
  cells = new Map<string, number[]>();
  size: number;
  
  constructor(size: number) {
    this.size = size;
  }
  
  clear() {
    this.cells.clear();
  }
  
  key(x: number, y: number) {
    return `${Math.floor(x / this.size)},${Math.floor(y / this.size)}`;
  }
  
  insert(id: number, x: number, y: number) {
    const k = this.key(x, y);
    if (!this.cells.has(k)) this.cells.set(k, []);
    this.cells.get(k)!.push(id);
  }
  
  getNearby(x: number, y: number) {
    const cx = Math.floor(x / this.size);
    const cy = Math.floor(y / this.size);
    const result: number[] = [];
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const k = `${cx + dx},${cy + dy}`;
        const cell = this.cells.get(k);
        if (cell) {
          for (let i = 0; i < cell.length; i++) result.push(cell[i]);
        }
      }
    }
    return result;
  }
}

export const NeuralNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const pulseRef = useRef({ x: -1000, y: -1000, radius: 0, active: false });

  const initParticles = (width: number, height: number, maskCtx: CanvasRenderingContext2D) => {
    // Determine brain boundary center and scale
    const isMobile = width < 768;
    const scale = isMobile ? (width * 0.4) / 100 : Math.min(width, height) * 0.25 / 100;
    const cx = width / 2;
    const cy = height / 2 - (isMobile ? 0 : 50);

    // Draw mask once
    maskCtx.clearRect(0, 0, width, height);
    maskCtx.fillStyle = '#000';
    drawBrainPath(maskCtx, cx, cy, scale);
    maskCtx.fill();

    // Max bounds for particle random generation
    const bounds = {
      minX: cx - 120 * scale,
      maxX: cx + 120 * scale,
      minY: cy - 120 * scale,
      maxY: cy + 120 * scale,
    };

    const particleCount = isMobile ? 300 : 800;
    const particles = [];

    // Rejection sample points to ensure they stay inside the brain path
    for (let i = 0; i < particleCount; i++) {
      let x = 0, y = 0, attempts = 0;
      do {
        x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
        y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
        attempts++;
      } while (!maskCtx.isPointInPath(x, y) && attempts < 100);

      if (attempts < 100) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 1,
          opacityOffset: Math.random() * Math.PI * 2,
        });
      }
    }
    
    return particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Use an offscreen canvas to test whether a point is inside the brain path
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!maskCtx) return;

    let animationFrameId: number;
    let particles: ReturnType<typeof initParticles> = [];
    let lastPulseTime = Date.now();
    let nextPulseDelay = Math.random() * 4000 + 4000;
    const connectionDist = 120;
    const connectionDistSq = connectionDist * connectionDist;
    const grid = new Grid2D(connectionDist);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      particles = initParticles(canvas.width, canvas.height, maskCtx);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const time = Date.now();
      
      // Slate background
      ctx.fillStyle = '#f8fafc'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!pulseRef.current.active && time - lastPulseTime > nextPulseDelay) {
        if (particles.length > 0) {
          const rp = particles[Math.floor(Math.random() * particles.length)];
          pulseRef.current = { x: rp.x, y: rp.y, radius: 0, active: true };
        }
        lastPulseTime = time;
        nextPulseDelay = Math.random() * 4000 + 4000;
      }

      if (pulseRef.current.active) {
        pulseRef.current.radius += 8;
        if (pulseRef.current.radius > 800) pulseRef.current.active = false;
      }

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const pulseX = pulseRef.current.x;
      const pulseY = pulseRef.current.y;
      const pulseRadius = pulseRef.current.radius;
      
      // Brain path boundaries to bounce against
      const cx = canvas.width / 2;
      const isMobile = canvas.width < 768;
      const cy = canvas.height / 2 - (isMobile ? 0 : 50);
      const scale = isMobile ? (canvas.width * 0.4) / 100 : Math.min(canvas.width, canvas.height) * 0.25 / 100;
      
      drawBrainPath(maskCtx, cx, cy, scale); // recreate path for hit testing

      grid.clear();
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off mask borders instead of canvas borders
        if (!maskCtx.isPointInPath(p.x + p.vx * 10, p.y + p.vy * 10)) {
          // Simple bounce approximation
          if (!maskCtx.isPointInPath(p.x + p.vx * 10, p.y)) p.vx *= -1;
          if (!maskCtx.isPointInPath(p.x, p.y + p.vy * 10)) p.vy *= -1;
        }

        grid.insert(i, p.x, p.y);
      });

      // Draw Edges
      particles.forEach((p, i) => {
        const pdx = pulseX - p.x;
        const pdy = pulseY - p.y;
        const pulseDiff = Math.sqrt(pdx*pdx + pdy*pdy) - pulseRadius;
        const onPulse = Math.abs(pulseDiff) < 30;

        const mdx = mouseX - p.x;
        const mdy = mouseY - p.y;
        const mouseProx = mdx*mdx + mdy*mdy < 20000;

        const neighbors = grid.getNearby(p.x, p.y);
        
        ctx.beginPath();
        for (const j of neighbors) {
          if (j <= i) continue; // prevent double drawing
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const distSq2 = dx2 * dx2 + dy2 * dy2;

          if (distSq2 < connectionDistSq) { 
            const alpha = (1 - Math.sqrt(distSq2) / connectionDist) * 0.15;
            
            if (onPulse) {
              ctx.strokeStyle = `rgba(108, 117, 125, 0.4)`;
              ctx.lineWidth = 1.2;
            } else if (mouseProx) {
              ctx.strokeStyle = `rgba(108, 117, 125, ${alpha * 2})`;
              ctx.lineWidth = 0.8;
            } else {
              ctx.strokeStyle = `rgba(108, 117, 125, ${alpha})`;
              ctx.lineWidth = 0.4;
            }
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
        ctx.stroke();

        // Draw node
        const baseOpacity = 0.2 + (Math.sin(time * 0.002 + p.opacityOffset) * 0.1);
        if (onPulse || mouseProx) {
          ctx.fillStyle = onPulse ? '#6c757d' : '#8b949e';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(108, 117, 125, ${baseOpacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: MouseEvent) => {
    pulseRef.current = {
      x: e.clientX,
      y: e.clientY,
      radius: 0,
      active: true
    };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="absolute inset-0 z-0 bg-slate-50 cursor-pointer"
    />
  );
};
