import { useEffect, useRef } from 'react';

function useReveal(rootMargin = '0px 0px -80px 0px') {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); } },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return ref;
}

export default function About({ data, personalInfo }) {
  const titleRef = useReveal();
  const textRef  = useReveal();
  const statsRef = useReveal();

  const { text1, text2 } = data || {};
  const { yearsExperience, projectsCompleted } = personalInfo || {};

  return (
    <section id="about" className="section">
      <div className="container">
        <h2 className="section-title reveal" ref={titleRef}>About Me</h2>
        <div className="about__grid">
          <div className="about__text card reveal reveal--left" ref={textRef}>
            {text1 && <p>{text1}</p>}
            {text2 && <p>{text2}</p>}
          </div>

          <div className="about__stats" ref={statsRef}>
            <div className="stat-card reveal is-visible">
              <div className="stat-card__icon">
                <i className="fas fa-calendar-alt" aria-hidden="true" />
              </div>
              <div>
                <div className="stat-card__value">{yearsExperience || '2+'}</div>
                <div className="stat-card__label">Years Experience</div>
              </div>
            </div>

            <div className="stat-card reveal is-visible" style={{ transitionDelay: '100ms' }}>
              <div className="stat-card__icon">
                <i className="fas fa-project-diagram" aria-hidden="true" />
              </div>
              <div>
                <div className="stat-card__value">{projectsCompleted || '10+'}</div>
                <div className="stat-card__label">Projects Completed</div>
              </div>
            </div>

            <div className="stat-card reveal is-visible" style={{ transitionDelay: '200ms' }}>
              <div className="stat-card__icon">
                <i className="fas fa-layer-group" aria-hidden="true" />
              </div>
              <div>
                <div className="stat-card__value">Web & Python</div>
                <div className="stat-card__label">Specialization</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
