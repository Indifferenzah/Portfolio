import { useEffect, useRef } from 'react';

function RevealItem({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); } },
      { rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="reveal" ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const EXP_ICONS = ['fa-briefcase', 'fa-laptop-code', 'fa-code-branch', 'fa-terminal'];

export default function Experience({ experiences = [] }) {
  return (
    <section id="experience" className="section">
      <div className="container">
        <h2 className="section-title">Experience</h2>
        <div className="timeline">
          {experiences.map((exp, i) => (
            <RevealItem key={exp.id} delay={i * 100}>
              <div className="timeline-item">
                <div className="timeline-item__dot">
                  <i className={`fas ${EXP_ICONS[i % EXP_ICONS.length]}`} aria-hidden="true" />
                </div>
                <div className="timeline-item__content">
                  <h3 className="timeline-item__title">{exp.title}</h3>
                  <p className="timeline-item__period">{exp.period}</p>
                  <p className="timeline-item__description">{exp.description}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  );
}
