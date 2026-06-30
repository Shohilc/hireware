import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export function SparklesCore({
  id = 'sparkles',
  className,
  background = 'transparent',
  minSize = 0.4,
  maxSize = 1.4,
  particleDensity = 100,
  particleColor = '#4F6EF7',
  speed = 1,
}) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef(null);

  const resizeObserver = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const updateDimensions = () => {
      if (parent) {
        setDimensions({
          width: parent.offsetWidth,
          height: parent.offsetHeight,
        });
      }
    };

    updateDimensions();
    resizeObserver.current = new ResizeObserver(updateDimensions);
    resizeObserver.current.observe(parent);

    return () => {
      resizeObserver.current?.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const particles = [];
    for (let i = 0; i < particleDensity; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * speed * 0.3,
        speedY: (Math.random() - 0.5) * speed * 0.3,
        opacity: Math.random(),
        opacityDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      particles.forEach((p) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < 0) p.x = dimensions.width;
        if (p.x > dimensions.width) p.x = 0;
        if (p.y < 0) p.y = dimensions.height;
        if (p.y > dimensions.height) p.y = 0;

        // Pulse opacity
        p.opacity += p.opacityDirection * 0.008 * speed;
        if (p.opacity > 1) {
          p.opacity = 1;
          p.opacityDirection = -1;
        }
        if (p.opacity < 0) {
          p.opacity = 0;
          p.opacityDirection = 1;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [dimensions, particleDensity, minSize, maxSize, particleColor, speed]);

  useEffect(() => {
    initCanvas();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [initCanvas]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ background }}
    />
  );
}
