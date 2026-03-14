import { useEffect, useRef } from 'react';

function EducationCard({ edu, delay }) {
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
    <div className="education-card reveal" ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      <div className="education-card__icon">
        <i className="fas fa-graduation-cap" aria-hidden="true" />
      </div>
      <h3 className="education-card__title">{edu.title}</h3>
      <p className="education-card__period">{edu.period}</p>
      <p className="education-card__description">{edu.description}</p>
    </div>
  );
}

export default function Education({ education = [] }) {
  return (
    <section id="education" className="section">
      <div className="container">
        <h2 className="section-title">Education</h2>
        <div className="education__grid">
          {education.map((edu, i) => (
            <EducationCard key={edu.id} edu={edu} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
