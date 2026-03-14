/** Centralized API client */

function getToken() {
  return sessionStorage.getItem('portfolio_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ── Portfolio ───────────────────────────────────────────────

export const portfolioApi = {
  get:    ()     => request('GET',  '/api/portfolio'),
  update: (data) => request('PUT',  '/api/portfolio', data),
};

// ── Auth ────────────────────────────────────────────────────

export const authApi = {
  status:         ()     => request('GET',  '/api/auth/status'),
  setup:          (body) => request('POST', '/api/auth/setup',    body),
  login:          (body) => request('POST', '/api/auth/login',    body),
  logout:         ()     => request('POST', '/api/auth/logout'),
  changeUsername: (body) => request('PUT',  '/api/auth/username', body),
  changePassword: (body) => request('PUT',  '/api/auth/password', body),
};

// ── Session helpers ──────────────────────────────────────────

export function saveSession(token, username) {
  sessionStorage.setItem('portfolio_token', token);
  sessionStorage.setItem('portfolio_user',  username);
}

export function clearSession() {
  sessionStorage.removeItem('portfolio_token');
  sessionStorage.removeItem('portfolio_user');
}

export function getUsername() {
  return sessionStorage.getItem('portfolio_user');
}

export function isAuthenticated() {
  return !!getToken();
}
