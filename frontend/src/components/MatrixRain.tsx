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

    function resize(c: HTMLCanvasElement, context: CanvasRenderingContext2D) {
      const parent = c.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      width = parent.clientWidth;
      height = parent.clientHeight;
      c.width = Math.floor(width * dpr);
      c.height = Math.floor(height * dpr);
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -60));
    }

    let rafId = 0;
    function tick(c: HTMLCanvasElement, context: CanvasRenderingContext2D) {
      context.fillStyle = 'rgba(10, 15, 12, 0.12)';
      context.fillRect(0, 0, width, height);
      context.font = `${fontSize}px monospace`;
      for (let i = 0; i < columns; i++) {
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? 'A';
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const isHead = Math.random() > 0.975;
        context.fillStyle = isHead ? '#d7fbe4' : 'rgba(0, 230, 118, 0.85)';
        context.fillText(char, x, y);
        if (y > height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
      rafId = requestAnimationFrame(() => tick(c, context));
    }

    resize(canvas, ctx);
    tick(canvas, ctx);
    const handleResize = () => resize(canvas, ctx);
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
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
