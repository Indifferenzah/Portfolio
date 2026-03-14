/** Web Crypto API utilities — same logic as the old crypto.js */

export async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSalt(bytes = 16) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password, salt) {
  return sha256(`${salt}:${password}`);
}

export function measurePasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 3);
}
