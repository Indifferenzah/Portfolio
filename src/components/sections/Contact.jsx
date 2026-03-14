export default function Contact({ personalInfo }) {
  const { email, discord, github } = personalInfo || {};

  return (
    <section id="contact" className="section">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact__grid">
          {email && (
            <a href={`mailto:${email}`} className="contact-card">
              <div className="contact-card__icon">
                <i className="fas fa-envelope" aria-hidden="true" />
              </div>
              <h3 className="contact-card__title">Email</h3>
              <p className="contact-card__value">{email}</p>
            </a>
          )}

          {discord && (
            <div className="contact-card">
              <div className="contact-card__icon">
                <i className="fab fa-discord" aria-hidden="true" />
              </div>
              <h3 className="contact-card__title">Discord</h3>
              <p className="contact-card__value">{discord}</p>
            </div>
          )}

          {github && (
            <a
              href={`https://github.com/${github}`}
              className="contact-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="contact-card__icon">
                <i className="fab fa-github" aria-hidden="true" />
              </div>
              <h3 className="contact-card__title">GitHub</h3>
              <p className="contact-card__value">github.com/{github}</p>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
