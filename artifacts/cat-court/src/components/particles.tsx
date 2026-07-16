import { useEffect, useRef } from 'react';

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; opacitySpeed: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const createParticles = () => {
      particles = [];
      const particleCount = Math.floor(window.innerWidth * window.innerHeight / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3 - 0.1, // slightly moving up
          opacity: Math.random(),
          opacitySpeed: (Math.random() - 0.5) * 0.02
        });
      }
    };
    createParticles();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacitySpeed;

        if (p.opacity <= 0) p.opacitySpeed = Math.abs(p.opacitySpeed);
        if (p.opacity >= 1) p.opacitySpeed = -Math.abs(p.opacitySpeed);

        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.opacity = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Purple-gold mix
        const r = 124 + Math.random() * 121; // 124 to 245
        const g = 58 + Math.random() * 100; // 58 to 158
        const b = 237 - Math.random() * 226; // 11 to 237
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.6})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 mix-blend-screen"
    />
  );
}
