/**
 * config.js — Application configuration constants
 * No secrets stored here.
 */

export const APP_CONFIG = {
  name: 'Portfolio Admin',
  version: '2.0.0',
};

export const STORAGE_KEYS = {
  portfolioData:  'portfolio_data_v2',
  authConfig:     'portfolio_auth_config',   // { username, hash, salt }
  session:        'portfolio_session',        // sessionStorage key
};

export const SESSION_DURATION_HOURS = 24;

export const TOAST_DURATION_MS = 3500;

export const PARTICLE_CONFIG = {
  count:          80,
  maxSpeed:       0.5,
  minRadius:      1,
  maxRadius:      2.5,
  connectionDist: 130,
  mouseRepelDist: 100,
  mouseForce:     0.04,
  color:          '34, 211, 238',      // RGB for rgba()
  altColor:       '139, 92, 246',
};

export const ANIMATION_CONFIG = {
  loadingMinDuration: 1400,  // ms
  skillAnimDelay:     100,   // ms per skill
};

export const API_BASE = '';  // relative URLs, works with any host

export const API_ENDPOINTS = {
  data:         '/api/data',
  authCheck:    '/api/auth/check',
  authSetup:    '/api/auth/setup',
  authLogin:    '/api/auth/login',
  authLogout:   '/api/auth/logout',
  authUsername: '/api/auth/username',
  authPassword: '/api/auth/password',
};
