import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { hashPassword, generateSalt, measurePasswordStrength } from '../../utils/crypto';
import { useToast } from '../../context/AppContext';
import ParticlesCanvas from '../../components/ParticlesCanvas';

const STRENGTH_LABELS  = ['', 'Weak', 'Medium', 'Strong'];
const STRENGTH_CLASSES = ['', 'is-weak', 'is-medium', 'is-strong'];

export default function Setup() {
  const navigate     = useNavigate();
  const { addToast } = useToast();
  const [form, setForm]   = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    authApi.status().then(s => {
      if (s.configured) navigate('/admin/login');
    }).catch(() => {});
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'password') setStrength(measurePasswordStrength(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm)  { setError('Passwords do not match'); return; }
    if (form.password.length < 6)        { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const salt = generateSalt();
      const hash = await hashPassword(form.password, salt);
      await authApi.setup({ username: form.username, hash, salt });
      addToast('Admin account created!', 'success');
      navigate('/admin/login');
    } catch (err) {
      setError(err.message || 'Setup failed');
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
            <i className="fas fa-user-shield" />
          </div>
          <h1 className="auth-box__title">Admin Setup</h1>
          <p className="auth-box__subtitle">Create your admin account</p>
        </div>

        <div className="setup-info">
          <i className="fas fa-circle-info" style={{ marginRight: 'var(--s2)' }} />
          One-time setup. Your credentials will be used to manage the portfolio.
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
                name="username"
                type="text"
                className="form-input"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock input-wrapper__icon" />
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Choose a password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            {form.password && (
              <div className="password-strength">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`password-strength__bar${strength >= i ? ` ${STRENGTH_CLASSES[strength]}` : ''}`}
                  />
                ))}
                <span className="password-strength__label">{STRENGTH_LABELS[strength]}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock input-wrapper__icon" />
              <input
                id="confirm"
                name="confirm"
                type="password"
                className="form-input"
                placeholder="Confirm password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block btn--lg"
            disabled={loading}
            style={{ marginTop: 'var(--s2)' }}
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin" /> Creating…</>
              : <><i className="fas fa-user-plus" /> Create Account</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
