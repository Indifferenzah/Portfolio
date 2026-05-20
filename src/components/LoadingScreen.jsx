import { useEffect, useState } from 'react';

export default function LoadingScreen({ name = 'Portfolio', onDone }) {
  const [pct,  setPct]  = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start    = performance.now();
    const duration = 1800;

    function tick(now) {
      const p = Math.min(Math.floor(((now - start) / duration) * 100), 100);
      setPct(p);
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setDone(true);
          setTimeout(onDone, 520);
        }, 80);
      }
    }

    requestAnimationFrame(tick);
  }, [onDone]);

  return (
    <div className={`loading-screen${done ? ' is-done' : ''}`} role="status" aria-live="polite">
      <div className="loading-screen__name">{name}</div>
      <div className="loading-screen__bar-wrap">
        <div className="loading-screen__bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="loading-screen__pct">{String(pct).padStart(3, '0')}%</div>
    </div>
  );
}
