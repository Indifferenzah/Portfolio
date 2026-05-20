import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, saveSession, isAuthenticated } from '../../api';
import { hashPassword } from '../../utils/crypto';
import { useToast } from '../../context/AppContext';
import ParticlesCanvas from '../../components/ParticlesCanvas';

export default function Login() {
  const navigate      = useNavigate();
  const { addToast }  = useToast();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  useEffect(() => {
    if (isAuthenticated()) { navigate('/admin/dashboard'); return; }
    authApi.status().then(s => {
      if (!s.configured) navigate('/admin/setup');
    }).catch(() => {});
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { salt } = await authApi.status();
      const hash     = await hashPassword(form.password, salt);
      const res      = await authApi.login({ username: form.username, hash });
      saveSession(res.token, res.username);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
      addToast('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <ParticlesCanvas />

      <div className="auth-box">
        <div className="auth-box__header">
          <div className="auth-box__icon">
            <i className="fas fa-shield-halved" />
          </div>
          <h1 className="auth-box__title">Admin Login</h1>
          <p className="auth-box__subtitle">Sign in to manage your portfolio</p>
        </div>

        {error && (
          <div className="auth-error">
            <i className="fas fa-circle-xmark" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-wrapper">
              <i className="fas fa-user input-wrapper__icon" />
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <i className="fas fa-lock input-wrapper__icon" />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                aria-label="Toggle password visibility"
                style={{
                  position: 'absolute',
                  right: 'var(--s4)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block btn--lg"
            disabled={loading}
            style={{ marginTop: 'var(--s2)' }}
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin" /> Signing in…</>
              : <><i className="fas fa-right-to-bracket" /> Sign In</>
            }
          </button>
        </form>

        <a href="/" className="auth-box__back">
          <i className="fas fa-arrow-left" />
          Back to Portfolio
        </a>
      </div>
    </div>
  );
}
