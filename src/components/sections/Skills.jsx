import { useEffect, useRef, useState } from 'react';

export default function Skills({ skills = [] }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="section-inner" ref={ref}>
          <div className="section-bg-number" aria-hidden="true">03</div>

          <header className="section-header">
            <div className="section-label">Technical Skills</div>
            <h2 className="section-title">SKILLS</h2>
          </header>

          <div className="section-shell section-shell--flush">
          <div className="skills__grid">
            {skills.map(skill => (
              <div key={skill.id} className="skill-item">
                <div className="skill-item__header">
                  <span className="skill-item__name">{skill.name}</span>
                  <span className="skill-item__level">{skill.level}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{ width: visible ? `${skill.level}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
