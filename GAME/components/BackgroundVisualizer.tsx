import React, { useEffect, useRef } from 'react';

const BackgroundVisualizer: React.FC<{ intensity: number }> = ({ intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let bars: { x: number; height: number; speed: number }[] = [];
    const barCount = 40;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initBars();
    };

    const initBars = () => {
      bars = [];
      const barWidth = canvas.width / barCount;
      for (let i = 0; i < barCount; i++) {
        bars.push({
          x: i * barWidth,
          height: Math.random() * canvas.height * 0.2,
          speed: Math.random() * 2 + 1,
        });
      }
    };

    const draw = (time: number) => {
      ctx.fillStyle = '#0f172a'; // Background clear color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;

      bars.forEach((bar, i) => {
        // Update
        const noise = Math.sin(time * 0.002 + i) * 20;
        const multiplier = intensity > 1 ? intensity * 1.5 : 1;
        const targetHeight = (Math.sin(time * 0.005 + i * 0.5) + 1) * 100 * multiplier + noise;
        
        bar.height += (targetHeight - bar.height) * 0.1;

        // Draw
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - bar.height);
        gradient.addColorStop(0, '#a855f7'); // Purple
        gradient.addColorStop(0.5, '#ec4899'); // Pink
        gradient.addColorStop(1, '#06b6d4'); // Cyan

        ctx.fillStyle = gradient;
        
        // Mirror effect (top and bottom)
        const h = Math.max(0, bar.height);
        
        // Bottom bars
        ctx.fillRect(bar.x, canvas.height - h, barWidth - 2, h);
        
        // Top bars (fainter)
        ctx.globalAlpha = 0.3;
        ctx.fillRect(bar.x, 0, barWidth - 2, h * 0.5);
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default BackgroundVisualizer;