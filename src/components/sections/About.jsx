export default function About({ data, personalInfo }) {
  const { text1, text2 }                         = data || {};
  const { yearsExperience, projectsCompleted }   = personalInfo || {};

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-inner">
          <div className="section-bg-number" aria-hidden="true">01</div>

          <header className="section-header">
            <div className="section-label">About Me</div>
            <h2 className="section-title">WHO I AM</h2>
          </header>

          <div className="section-shell section-shell--flush">
          <div className="about__grid">
            <div className="about__text">
              {text1 && <p>{text1}</p>}
              {text2 && <p>{text2}</p>}
            </div>

            <div className="about__stats">
              {yearsExperience && (
                <div className="about-stat">
                  <div className="about-stat__value">{yearsExperience}</div>
                  <div className="about-stat__label">Years Experience</div>
                </div>
              )}
              {projectsCompleted && (
                <div className="about-stat">
                  <div className="about-stat__value">{projectsCompleted}</div>
                  <div className="about-stat__label">Projects Done</div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
