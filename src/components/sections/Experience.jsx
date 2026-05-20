export default function Experience({ experiences = [] }) {
  return (
    <section id="experience" className="section">
      <div className="container">
        <div className="section-inner">
          <div className="section-bg-number" aria-hidden="true">02</div>

          <header className="section-header">
            <div className="section-label">Work History</div>
            <h2 className="section-title">EXPERIENCE</h2>
          </header>

          <div className="section-shell section-shell--timeline">
            <div className="timeline">
              {experiences.map(exp => (
                <div key={exp.id} className="timeline-item">
                  <div className="timeline-item__period">{exp.period}</div>
                  <h3 className="timeline-item__title">{exp.title}</h3>
                  {exp.description && (
                    <p className="timeline-item__desc">{exp.description}</p>
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
