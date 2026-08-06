import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$@#%&*<>/\\|~`^+=';

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 16;
    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -60));
    }

    let rafId = 0;
    function tick() {
      ctx.fillStyle = 'rgba(10, 15, 12, 0.12)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < columns; i++) {
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? 'A';
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const isHead = Math.random() > 0.975;
        ctx.fillStyle = isHead ? '#d7fbe4' : 'rgba(0, 230, 118, 0.85)';
        ctx.fillText(char, x, y);
        if (y > height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
      rafId = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <Box
      ref={canvasRef}
      component="canvas"
      aria-hidden="true"
      sx={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}
    />
  );
}
