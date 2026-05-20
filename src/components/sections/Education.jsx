export default function Education({ education = [] }) {
  return (
    <section id="education" className="section">
      <div className="container">
        <div className="section-inner">
          <div className="section-bg-number" aria-hidden="true">05</div>

          <header className="section-header">
            <div className="section-label">Academic Background</div>
            <h2 className="section-title">EDUCATION</h2>
          </header>

          <div className="section-shell section-shell--timeline">
            <div className="timeline">
              {education.map(edu => (
                <div key={edu.id} className="timeline-item">
                  <div className="timeline-item__period">{edu.period}</div>
                  <h3 className="timeline-item__title">{edu.title}</h3>
                  {edu.description && (
                    <p className="timeline-item__desc">{edu.description}</p>
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
