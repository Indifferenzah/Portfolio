import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: '#home',       label: 'Home' },
  { href: '#about',      label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills',     label: 'Skills' },
  { href: '#projects',   label: 'Projects' },
  { href: '#education',  label: 'Education' },
  { href: '#contact',    label: 'Contact' },
];

export default function Navbar({ name = 'Indifferenzah' }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activeSection, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      // Active section tracking
      const sections = NAV_LINKS.map(l => l.href.slice(1));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLink(e, href) {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <nav className={`navbar${scrolled ? ' is-scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar__container">
        <a href="#home" className="navbar__brand" onClick={e => handleLink(e, '#home')}>
          <i className="fas fa-code" aria-hidden="true" />
          <span>{name}</span>
        </a>

        <button
          className={`navbar__toggle${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>

        <ul className={`navbar__menu${menuOpen ? ' is-open' : ''}`} role="menubar">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href} role="none">
              <a
                href={href}
                role="menuitem"
                className={`navbar__link${activeSection === href.slice(1) ? ' is-active' : ''}`}
                onClick={e => handleLink(e, href)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
