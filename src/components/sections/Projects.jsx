import { useEffect, useRef } from 'react';

function ProjectCard({ project, delay }) {
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
    <div className="project-card reveal" ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      <div className="project-card__icon">
        <i className="fas fa-code" aria-hidden="true" />
      </div>
      <h3 className="project-card__title">{project.title}</h3>
      <p className="project-card__description">{project.description}</p>
      {project.technologies?.length > 0 && (
        <div className="project-card__tags">
          {project.technologies.map(t => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
        </div>
      )}
      {project.link && (
        <div className="project-card__footer">
          <a
            href={project.link}
            className="project-card__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-github" aria-hidden="true" />
            View on GitHub
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

export default function Projects({ projects = [] }) {
  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className="projects__grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
