import { useNavigate } from 'react-router-dom';

export default function Footer({ name = 'Indifferenzah', kofi = '' }) {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__copy">
          &copy; {year} <span>{name}</span>. All rights reserved.
        </p>
        <button
          className="footer__admin-link"
          onClick={() => navigate('/admin/login')}
          title="Admin Dashboard"
          aria-label="Admin login"
        >
          <i className="fas fa-lock" aria-hidden="true" />
        </button>
      </div>
      {kofi && (
        <div className="footer__kofi" style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <a
            href={`https://ko-fi.com/${kofi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline btn--sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <i className="fas fa-mug-hot" />
            Support me on Ko-fi
          </a>
        </div>
      )}
    </footer>
  );
}
