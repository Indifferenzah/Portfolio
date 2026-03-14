export default function Hero({ data }) {
  const { name, title, description, email, discord, github } = data || {};

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  const [role1, role2] = (title || '').split('&').map(s => s.trim());

  return (
    <section id="home" className="hero" aria-label="Hero section">
      <div className="glow-orb glow-orb--cyan hero__bg-orb-1" aria-hidden="true" />
      <div className="glow-orb glow-orb--purple hero__bg-orb-2" aria-hidden="true" />

      <div className="hero__content">
        <div className="hero__text">
          <div className="hero__eyebrow">
            <i className="fas fa-circle" aria-hidden="true" />
            Available for projects
          </div>

          <h1 className="hero__title text-gradient">{name}</h1>

          <p className="hero__subtitle">
            <span>{role1}</span>{role2 ? ` & ${role2}` : ''}
          </p>

          <p className="hero__description">{description}</p>

          <div className="hero__cta">
            <button className="btn btn--primary btn--lg" onClick={() => scrollTo('projects')}>
              <i className="fas fa-folder-open" aria-hidden="true" />
              View Projects
            </button>
            <button className="btn btn--outline btn--lg" onClick={() => scrollTo('contact')}>
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
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__code-card">
            <div className="hero__code-card-dots">
              <span /><span /><span />
            </div>
            <div className="hero__code-card-icon">
              <i className="fas fa-code" />
            </div>
            <p className="hero__code-card-label">{title}</p>
          </div>
        </div>
      </div>

      <button className="scroll-indicator" onClick={() => scrollTo('about')} aria-label="Scroll to About">
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--letter-spacing-wider)' }}>
          SCROLL
        </span>
        <i className="fas fa-chevron-down scroll-indicator__arrow" aria-hidden="true" />
      </button>
    </section>
  );
}
