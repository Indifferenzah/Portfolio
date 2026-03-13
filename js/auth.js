/**
 * auth.js — Authentication module.
 * Uses Web Crypto API (SHA-256 + salt) via crypto.js.
 * Session stored in sessionStorage (expires on tab close or after 24h).
 * Credentials stored as { username, hash, salt } in localStorage.
 */

import { STORAGE_KEYS, SESSION_DURATION_HOURS } from './config.js';
import { hashPassword, generateSalt, generateToken } from './crypto.js';

// ── Auth Manager ─────────────────────────────────────────

class AuthManager {
  constructor() {
    this._configKey  = STORAGE_KEYS.authConfig;
    this._sessionKey = STORAGE_KEYS.session;   // sessionStorage
  }

  // ── Configuration ──────────────────────────────────────

  /**
   * Check whether credentials have been configured.
   * @returns {boolean}
   */
  hasCredentials() {
    return !!localStorage.getItem(this._configKey);
  }

  /**
   * Get stored auth config (username, hash, salt).
   * @returns {{ username: string, hash: string, salt: string } | null}
   */
  getConfig() {
    try {
      const raw = localStorage.getItem(this._configKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Store new credentials. Called by setup.html.
   * @param {string} username
   * @param {string} hash      - SHA-256(salt + ':' + password)
   * @param {string} salt
   */
  saveCredentials(username, hash, salt) {
    localStorage.setItem(this._configKey, JSON.stringify({ username, hash, salt }));
  }

  // ── Login ──────────────────────────────────────────────

  /**
   * Attempt login. Async because of crypto operations.
   * @param {string} username
   * @param {string} password  - plaintext (hashed here)
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async login(username, password) {
    const config = this.getConfig();
    if (!config) {
      return { success: false, message: 'No credentials configured. Please run setup.' };
    }

    const hash = await hashPassword(password, config.salt);

    if (username !== config.username || hash !== config.hash) {
      return { success: false, message: 'Invalid username or password.' };
    }

    // Create session
    const session = {
      username,
      token:     generateToken(),
      loginTime: Date.now(),
    };
    sessionStorage.setItem(this._sessionKey, JSON.stringify(session));

    return { success: true, message: 'Login successful!' };
  }

  // ── Session ────────────────────────────────────────────

  /**
   * Check whether the current session is valid.
   * @returns {boolean}
   */
  isAuthenticated() {
    try {
      const raw = sessionStorage.getItem(this._sessionKey);
      if (!raw) return false;
      const session = JSON.parse(raw);
      const elapsed = (Date.now() - session.loginTime) / (1000 * 60 * 60);
      return elapsed < SESSION_DURATION_HOURS;
    } catch {
      return false;
    }
  }

  /**
   * Get the current logged-in username.
   * @returns {string | null}
   */
  getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(this._sessionKey);
      if (!raw) return null;
      return JSON.parse(raw).username ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Log out and redirect.
   * @param {string} redirectTo
   */
  logout(redirectTo = '../index.html') {
    sessionStorage.removeItem(this._sessionKey);
    window.location.href = redirectTo;
  }

  // ── Change Credentials ─────────────────────────────────

  /**
   * Change username. Requires current password for confirmation.
   * @param {string} newUsername
   * @param {string} currentPassword
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async changeUsername(newUsername, currentPassword) {
    const config = this.getConfig();
    if (!config) return { success: false, message: 'No credentials configured.' };

    const hash = await hashPassword(currentPassword, config.salt);
    if (hash !== config.hash) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    this.saveCredentials(newUsername, config.hash, config.salt);

    // Update session username
    try {
      const raw = sessionStorage.getItem(this._sessionKey);
      if (raw) {
        const session = JSON.parse(raw);
        session.username = newUsername;
        sessionStorage.setItem(this._sessionKey, JSON.stringify(session));
      }
    } catch { /* ignore */ }

    return { success: true, message: 'Username changed successfully!' };
  }

  /**
   * Change password. Requires current password for confirmation.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async changePassword(currentPassword, newPassword) {
    const config = this.getConfig();
    if (!config) return { success: false, message: 'No credentials configured.' };

    const currentHash = await hashPassword(currentPassword, config.salt);
    if (currentHash !== config.hash) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    // Generate new salt and hash for new password
    const newSalt = generateSalt();
    const newHash = await hashPassword(newPassword, newSalt);
    this.saveCredentials(config.username, newHash, newSalt);

    return { success: true, message: 'Password changed successfully!' };
  }

  // ── Guards ─────────────────────────────────────────────

  /**
   * Guard for dashboard: redirect to login or setup if not authenticated.
   */
  requireAuth() {
    if (!this.hasCredentials()) {
      window.location.href = 'setup.html';
      return false;
    }
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  /**
   * Guard for login page: redirect if already authenticated or no creds exist.
   */
  guardLogin() {
    if (!this.hasCredentials()) {
      window.location.href = 'setup.html';
      return false;
    }
    if (this.isAuthenticated()) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }

  /**
   * Guard for setup page: redirect if credentials already exist.
   */
  guardSetup() {
    if (this.hasCredentials()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
}

export const auth = new AuthManager();
