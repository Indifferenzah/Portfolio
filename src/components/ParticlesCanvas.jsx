import { useEffect, useRef } from 'react';

/**
 * Full-viewport ambient layer: subtle grid + radial glow + gentle warp
 * driven by pointer position. pointer-events: none so UI stays usable.
 */
export default function ParticlesCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({
    tx: 0,
    ty: 0,
    lx: 0,
    ly: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const m = mouseRef.current;

    let animId;
    let t = 0;
    let reduceMotion = false;

    const GRID = 44;
    const DOT = 1.15;
    const COLOR = '196, 255, 71';

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion = mq.matches;
    const onMq = () => { reduceMotion = mq.matches; };
    mq.addEventListener('change', onMq);

    function placeCenter() {
      const cx = window.innerWidth * 0.5;
      const cy = window.innerHeight * 0.5;
      m.tx = m.lx = cx;
      m.ty = m.ly = cy;
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      placeCenter();
    }

    function onMove(e) {
      m.tx = e.clientX;
      m.ty = e.clientY;
    }

    function onTouch(e) {
      const touch = e.touches?.[0];
      if (!touch) return;
      m.tx = touch.clientX;
      m.ty = touch.clientY;
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const lerp = reduceMotion ? 1 : 0.1;
      m.lx += (m.tx - m.lx) * lerp;
      m.ly += (m.ty - m.ly) * lerp;
      const mx = m.lx;
      const my = m.ly;

      if (!reduceMotion) t += 0.0055;

      const glowR = Math.max(w, h) * 0.42;
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, glowR);
      g.addColorStop(0, `rgba(${COLOR}, 0.075)`);
      g.addColorStop(0.28, `rgba(${COLOR}, 0.028)`);
      g.addColorStop(0.55, `rgba(${COLOR}, 0.008)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const cols = Math.ceil(w / GRID) + 1;
      const rows = Math.ceil(h / GRID) + 1;
      const fallK = 1 / (220 * 220);

      for (let xi = 0; xi < cols; xi++) {
        for (let yi = 0; yi < rows; yi++) {
          const px = xi * GRID;
          const py = yi * GRID;
          const dx = px - mx;
          const dy = py - my;
          const distSq = dx * dx + dy * dy;
          const near = Math.exp(-distSq * fallK);

          const wave = reduceMotion
            ? 0.45
            : Math.sin(xi * 0.32 + t) * Math.cos(yi * 0.32 + t) * 0.5 + 0.5;
          const baseA = wave * 0.09;
          const alpha = Math.min(0.52, baseA + near * 0.26);

          const len = Math.sqrt(distSq + 64);
          const push = near * 18;
          const ox = px + (dx / len) * push;
          const oy = py + (dy / len) * push;
          const r = DOT + near * 1.1;

          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${COLOR}, ${alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      mq.removeEventListener('change', onMq);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.82,
      }}
    />
  );
}
