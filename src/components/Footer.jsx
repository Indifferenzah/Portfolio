export default function Footer({ name = 'Portfolio', kofi = '' }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} <span>{name}</span>. Built from scratch.
        </p>
        <div className="footer__links">
          <a
            href={`https://github.com/${name}`}
            className="footer__link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <i className="fab fa-github" />
          </a>
          {kofi && (
            <a
              href={`https://ko-fi.com/${kofi}`}
              className="footer__link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ko-fi"
            >
              <i className="fas fa-mug-hot" />
            </a>
          )}
          <a href="/admin/login" className="footer__link" aria-label="Admin">
            <i className="fas fa-lock" />
          </a>
        </div>
      </div>
    </footer>
  );
}
