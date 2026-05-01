import { useEffect, useRef, MouseEvent } from 'react';

export const NeuralNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const pulseRef = useRef({ x: -1000, y: -1000, radius: 0, active: false });

  const initParticles = (width: number, height: number) => {
    // Restored density for better visual richness while keeping other optimizations
    const particleCount = Math.floor((width * height) / 6500);
    return Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1,
      opacityOffset: Math.random() * Math.PI * 2,
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let particles = initParticles(window.innerWidth, window.innerHeight);
    let lastPulseTime = Date.now();
    let nextPulseDelay = Math.random() * 4000 + 4000;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = initParticles(canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const time = Date.now();
      
      // Slate background for the neural network
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
        pulseRef.current.radius += 10;
        if (pulseRef.current.radius > 1000) pulseRef.current.active = false;
      }

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const pulseX = pulseRef.current.x;
      const pulseY = pulseRef.current.y;
      const pulseRadius = pulseRef.current.radius;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distSq = dx * dx + dy * dy;

        const pdx = pulseX - p.x;
        const pdy = pulseY - p.y;
        const pDistSq = pdx * pdx + pdy * pdy;
        const pulseDiff = Math.sqrt(pDistSq) - pulseRadius;
        const onPulse = Math.abs(pulseDiff) < 40;

        // Connections logic
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const distSq2 = dx2 * dx2 + dy2 * dy2;

          // Increased connection threshold to 180px for better density
          if (distSq2 < 32400) { 
            const d2 = Math.sqrt(distSq2);
            const alpha = (1 - d2 / 180) * 0.25;
            
            if (onPulse) {
              ctx.strokeStyle = `rgba(108, 117, 125, 0.4)`;
              ctx.lineWidth = 1.5;
            } else if (distSq < 32400) {
              ctx.strokeStyle = `rgba(108, 117, 125, ${alpha * 1.5})`;
              ctx.lineWidth = 0.8;
            } else {
              ctx.strokeStyle = `rgba(108, 117, 125, ${alpha * 0.5})`;
              ctx.lineWidth = 0.4;
            }
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Particle drawing
        const baseOpacity = 0.2 + (Math.sin(time * 0.002 + p.opacityOffset) * 0.1);
        if (onPulse || distSq < 32400) {
          ctx.fillStyle = onPulse ? '#6c757d' : '#495057';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
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
