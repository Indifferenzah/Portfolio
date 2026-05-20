export default function Projects({ projects = [] }) {
  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="section-inner">
          <div className="section-bg-number" aria-hidden="true">04</div>

          <header className="section-header">
            <div className="section-label">Selected Work</div>
            <h2 className="section-title">PROJECTS</h2>
          </header>

          <div className="section-shell section-shell--flush">
          <div className="projects__grid">
            {projects.map(p => (
              <div key={p.id} className="project-card">
                <div className="project-card__header">
                  <div className="project-card__icon">
                    <i className="fas fa-folder-open" aria-hidden="true" />
                  </div>
                  {p.link && (
                    <a
                      href={p.link}
                      className="project-card__link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${p.title} on GitHub`}
                    >
                      <i className="fab fa-github" aria-hidden="true" />
                    </a>
                  )}
                </div>

                <h3 className="project-card__title">{p.title}</h3>
                <p className="project-card__desc">{p.description}</p>

                {p.technologies?.length > 0 && (
                  <div className="project-card__tags">
                    {p.technologies.map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
