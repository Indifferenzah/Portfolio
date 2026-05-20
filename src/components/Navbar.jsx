import { useState, useEffect } from 'react';

const LINKS = [
  { id: 'home',       label: 'Home' },
  { id: 'about',      label: 'About' },
  { id: 'experience', label: 'Exp' },
  { id: 'skills',     label: 'Skills' },
  { id: 'projects',   label: 'Projects' },
  { id: 'education',  label: 'Edu' },
  { id: 'contact',    label: 'Contact' },
];

export default function Navbar({ name = 'Portfolio' }) {
  const [active,   setActive]   = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
      const ids = [...LINKS].map(l => l.id).reverse();
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActive(id);
          break;
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  }

  const first = name?.[0] ?? '';
  const rest  = name?.slice(1) ?? '';

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} aria-label="Main navigation">
      <div className="navbar__inner">
        <a
          href="#home"
          className="navbar__logo"
          onClick={e => { e.preventDefault(); scrollTo('home'); }}
        >
          {first}<span>{rest}</span>
        </a>

        <div className={`navbar__nav${open ? ' is-open' : ''}`}>
          {LINKS.map(l => (
            <button
              key={l.id}
              className={`navbar__link${active === l.id ? ' is-active' : ''}`}
              onClick={() => scrollTo(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          className="navbar__hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span style={{ transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: open ? 0 : 1 }} />
          <span style={{ transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>
    </nav>
  );
}
