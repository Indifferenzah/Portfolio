/**
 * crypto.js — SHA-256 hashing via Web Crypto API, salt generation.
 * No secrets are stored here. All crypto operations are client-side only.
 */

/**
 * Hash a string with SHA-256 using the Web Crypto API.
 * @param {string} message
 * @returns {Promise<string>} hex string
 */
export async function sha256(message) {
  const encoded = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a cryptographically secure random salt (32 bytes = 64 hex chars).
 * @returns {string} hex string
 */
export function generateSalt() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with a given salt.
 * Format: SHA-256(salt + ':' + password)
 * @param {string} password
 * @param {string} salt
 * @returns {Promise<string>} hex hash
 */
export async function hashPassword(password, salt) {
  return sha256(`${salt}:${password}`);
}

/**
 * Generate a cryptographically secure random session token.
 * @returns {string} 64-char hex string
 */
export function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Measure password strength (0–3).
 * 0 = very weak, 1 = weak, 2 = medium, 3 = strong
 * @param {string} password
 * @returns {{ score: number, label: string }}
 */
export function measurePasswordStrength(password) {
  if (!password) return { score: 0, label: '' };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Normalize to 0–3
  const normalized = score <= 1 ? 1 : score <= 3 ? 2 : 3;
  const labels = { 1: 'Weak', 2: 'Medium', 3: 'Strong' };

  return { score: normalized, label: labels[normalized] ?? '' };
}
