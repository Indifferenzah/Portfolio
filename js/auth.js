/**
 * auth.js — API-backed authentication module.
 * Credentials stored server-side in data/auth.json.
 * Session token stored in sessionStorage (expires after 24h or tab close).
 */

import { STORAGE_KEYS, SESSION_DURATION_HOURS, API_ENDPOINTS } from './config.js';
import { hashPassword, generateSalt } from './crypto.js';

// ── Auth Manager ─────────────────────────────────────────

class AuthManager {
  constructor() {
    this._sessionKey = STORAGE_KEYS.session;
  }

  // ── Internal Helpers ────────────────────────────────────

  _getToken() {
    try {
      const raw = sessionStorage.getItem(this._sessionKey);
      if (!raw) return null;
      return JSON.parse(raw).token ?? null;
    } catch {
      return null;
    }
  }

  _authHeaders() {
    const token = this._getToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  // ── Configuration ──────────────────────────────────────

  /**
   * Check whether credentials have been configured on the server.
   * @returns {Promise<boolean>}
   */
  async hasCredentials() {
    try {
      const res = await fetch(API_ENDPOINTS.authCheck);
      if (!res.ok) return false;
      const data = await res.json();
      return data.configured === true;
    } catch {
      return false;
    }
  }

  /**
   * Get auth config from server (configured flag + salt for hashing).
   * @returns {Promise<{ configured: boolean, salt: string|null }>}
   */
  async getConfig() {
    try {
      const res = await fetch(API_ENDPOINTS.authCheck);
      if (!res.ok) return { configured: false, salt: null };
      return await res.json();
    } catch {
      return { configured: false, salt: null };
    }
  }

  /**
   * Save new credentials to the server. Called by setup page.
   * @param {string} username
   * @param {string} hash   - SHA-256(salt + ':' + password)
   * @param {string} salt
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async saveCredentials(username, hash, salt) {
    try {
      const res = await fetch(API_ENDPOINTS.authSetup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, hash, salt }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || 'Setup failed.' };
      return { success: true, message: data.message || 'Admin account created.' };
    } catch (e) {
      return { success: false, message: `Network error: ${e.message}` };
    }
  }

  // ── Login ──────────────────────────────────────────────

  /**
   * Attempt login.
   * 1. Fetch salt from server.
   * 2. Hash password client-side with salt.
   * 3. POST credentials, receive token on success.
   * @param {string} username
   * @param {string} password  - plaintext
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async login(username, password) {
    // Step 1: Get salt
    const config = await this.getConfig();
    if (!config.configured) {
      return { success: false, message: 'No credentials configured. Please run setup.' };
    }

    // Step 2: Hash password
    const hash = await hashPassword(password, config.salt);

    // Step 3: Send to server
    try {
      const res = await fetch(API_ENDPOINTS.authLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, hash }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Invalid username or password.' };
      }

      // Store session in sessionStorage
      const session = {
        token:     data.token,
        username:  data.username ?? username,
        loginTime: Date.now(),
      };
      sessionStorage.setItem(this._sessionKey, JSON.stringify(session));

      return { success: true, message: 'Login successful!' };
    } catch (e) {
      return { success: false, message: `Network error: ${e.message}` };
    }
  }

  // ── Session ────────────────────────────────────────────

  /**
   * Check whether the current session is valid (sync — reads sessionStorage).
   * @returns {boolean}
   */
  isAuthenticated() {
    try {
      const raw = sessionStorage.getItem(this._sessionKey);
      if (!raw) return false;
      const session = JSON.parse(raw);
      if (!session.token) return false;
      const elapsed = (Date.now() - session.loginTime) / (1000 * 60 * 60);
      return elapsed < SESSION_DURATION_HOURS;
    } catch {
      return false;
    }
  }

  /**
   * Get the current logged-in username (sync).
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
   * Log out: invalidate server session, clear sessionStorage, redirect.
   * @param {string} redirectTo
   */
  async logout(redirectTo = '../index.html') {
    const token = this._getToken();
    if (token) {
      try {
        await fetch(API_ENDPOINTS.authLogout, {
          method: 'POST',
          headers: this._authHeaders(),
        });
      } catch { /* ignore network errors on logout */ }
    }
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
    const config = await this.getConfig();
    if (!config.configured) {
      return { success: false, message: 'No credentials configured.' };
    }

    const currentHash = await hashPassword(currentPassword, config.salt);

    try {
      const res = await fetch(API_ENDPOINTS.authUsername, {
        method: 'PUT',
        headers: this._authHeaders(),
        body: JSON.stringify({ newUsername, currentHash }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || 'Failed to change username.' };

      // Update session username
      try {
        const raw = sessionStorage.getItem(this._sessionKey);
        if (raw) {
          const session = JSON.parse(raw);
          session.username = newUsername;
          sessionStorage.setItem(this._sessionKey, JSON.stringify(session));
        }
      } catch { /* ignore */ }

      return { success: true, message: data.message || 'Username changed successfully!' };
    } catch (e) {
      return { success: false, message: `Network error: ${e.message}` };
    }
  }

  /**
   * Change password. Requires current password for confirmation.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async changePassword(currentPassword, newPassword) {
    const config = await this.getConfig();
    if (!config.configured) {
      return { success: false, message: 'No credentials configured.' };
    }

    const currentHash = await hashPassword(currentPassword, config.salt);
    const newSalt     = generateSalt();
    const newHash     = await hashPassword(newPassword, newSalt);

    try {
      const res = await fetch(API_ENDPOINTS.authPassword, {
        method: 'PUT',
        headers: this._authHeaders(),
        body: JSON.stringify({ currentHash, newHash, newSalt }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || 'Failed to change password.' };
      return { success: true, message: data.message || 'Password changed successfully!' };
    } catch (e) {
      return { success: false, message: `Network error: ${e.message}` };
    }
  }

  // ── Guards ─────────────────────────────────────────────

  /**
   * Guard for dashboard: redirect to login or setup if not authenticated.
   * @returns {Promise<boolean>} — false means a redirect was triggered
   */
  async requireAuth() {
    const configured = await this.hasCredentials();
    if (!configured) {
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
   * Guard for login page: redirect if no creds or already authenticated.
   * @returns {Promise<boolean>}
   */
  async guardLogin() {
    const configured = await this.hasCredentials();
    if (!configured) {
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
   * @returns {Promise<boolean>}
   */
  async guardSetup() {
    const configured = await this.hasCredentials();
    if (configured) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
}

export const auth = new AuthManager();
