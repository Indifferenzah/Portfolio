export default function Hero({ data }) {
  const { name, title, description, email, discord, github } = data || {};

  const [role1, role2] = (title || '').split('&').map(s => s.trim());

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section id="home" className="hero" aria-label="Introduction">
      <div className="hero__bg-grid" aria-hidden="true" />
      <div className="hero__frame" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__grid">
          <div className="hero__main">
            <div className="hero__eyebrow" aria-label="Status">
              Available for projects
            </div>
            <h1 className="hero__title">{name}</h1>
            <p className="hero__subtitle">
              <span>{role1}</span>
              {role2 ? <> &amp; {role2}</> : ''}
            </p>
          </div>

          <aside className="hero__aside" aria-label="Summary and actions">
            <p className="hero__description">{description}</p>
            <div className="hero__cta">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={() => scrollTo('projects')}
              >
                <i className="fas fa-folder-open" aria-hidden="true" />
                View Projects
              </button>
              <button
                type="button"
                className="btn btn--outline btn--lg"
                onClick={() => scrollTo('contact')}
              >
                <i className="fas fa-envelope" aria-hidden="true" />
                Contact Me
              </button>
            </div>
            <div className="hero__social">
              {github && (
                <a
                  href={`https://github.com/${github}`}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                >
                  <i className="fab fa-github" aria-hidden="true" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="social-link" aria-label="Send email">
                  <i className="fas fa-envelope" aria-hidden="true" />
                </a>
              )}
              {discord && (
                <div className="social-link" title={`Discord: ${discord}`} aria-label="Discord">
                  <i className="fab fa-discord" aria-hidden="true" />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <button
        type="button"
        className="scroll-indicator"
        onClick={() => scrollTo('about')}
        aria-label="Scroll to about section"
      >
        SCROLL
      </button>
    </section>
  );
}
