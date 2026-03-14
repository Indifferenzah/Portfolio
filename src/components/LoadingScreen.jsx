import { useEffect, useState } from 'react';

export default function LoadingScreen({ name = 'Indifferenzah', onDone }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setHidden(true);
      setTimeout(onDone, 400);
    }, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`loading-screen${hidden ? ' is-hidden' : ''}`} role="status" aria-live="polite">
      <div className="loading-screen__logo">{name}</div>
      <div className="loading-screen__dots">
        <div className="loading-screen__dot" />
        <div className="loading-screen__dot" />
        <div className="loading-screen__dot" />
      </div>
    </div>
  );
}
