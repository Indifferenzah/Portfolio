import { useState } from 'react';

export default function Contact({ personalInfo = {} }) {
  const { email, discord, github, kofi } = personalInfo;
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (email) {
      window.location.href = `mailto:${email}?subject=Contact from ${form.name}&body=${encodeURIComponent(form.message)}`;
    }
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  const contacts = [
    email   && { iconClass: 'fas fa-envelope',  label: 'Email',   value: email,                 href: `mailto:${email}` },
    discord && { iconClass: 'fab fa-discord',   label: 'Discord', value: discord,                href: null },
    github  && { iconClass: 'fab fa-github',    label: 'GitHub',  value: `github.com/${github}`, href: `https://github.com/${github}`, external: true },
    kofi    && { iconClass: 'fas fa-mug-hot',   label: 'Ko-fi',   value: `ko-fi.com/${kofi}`,    href: `https://ko-fi.com/${kofi}`, external: true },
  ].filter(Boolean);

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="section-inner">
          <div className="section-bg-number" aria-hidden="true">06</div>

          <header className="section-header">
            <div className="section-label">Get In Touch</div>
            <h2 className="section-title">CONTACT</h2>
          </header>

          <div className="section-shell section-shell--flush">
          <div className="contact__grid">
            <div className="contact__links">
              {contacts.map(c =>
                c.href ? (
                  <a
                    key={c.label}
                    href={c.href}
                    className="contact-link"
                    target={c.external ? '_blank' : undefined}
                    rel={c.external ? 'noopener noreferrer' : undefined}
                  >
                    <div className="contact-link__icon">
                      <i className={c.iconClass} aria-hidden="true" />
                    </div>
                    <div>
                      <div className="contact-link__label">{c.label}</div>
                      <div className="contact-link__value">{c.value}</div>
                    </div>
                  </a>
                ) : (
                  <div key={c.label} className="contact-link">
                    <div className="contact-link__icon">
                      <i className={c.iconClass} aria-hidden="true" />
                    </div>
                    <div>
                      <div className="contact-link__label">{c.label}</div>
                      <div className="contact-link__value">{c.value}</div>
                    </div>
                  </div>
                )
              )}
            </div>

            <form className="contact__form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="c-name">Your Name</label>
                <input
                  id="c-name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="c-email">Your Email</label>
                <input
                  id="c-email"
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="c-message">Message</label>
                <textarea
                  id="c-message"
                  className="form-textarea"
                  rows={5}
                  placeholder="Tell me about your project..."
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary contact__submit">
                {sent
                  ? <><i className="fas fa-check" aria-hidden="true" /> Sent!</>
                  : <><i className="fas fa-paper-plane" aria-hidden="true" /> Send Message</>
                }
              </button>
            </form>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
