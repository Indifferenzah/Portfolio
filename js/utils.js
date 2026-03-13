/**
 * utils.js — DOM helpers, debounce, throttle, formatters
 */

// ── DOM Helpers ──────────────────────────────────────────

/** Query one element */
export const $ = (selector, context = document) =>
  context.querySelector(selector);

/** Query all elements as Array */
export const $$ = (selector, context = document) =>
  Array.from(context.querySelectorAll(selector));

/** Create element with optional attributes and children */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'class') {
      el.className = val;
    } else if (key === 'html') {
      el.innerHTML = val;
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else {
      el.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (child == null) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

/** Set text content safely */
export function setText(selector, text, context = document) {
  const el = $(selector, context);
  if (el) el.textContent = text ?? '';
}

/** Set href safely */
export function setHref(selector, href, context = document) {
  const el = $(selector, context);
  if (el) el.href = href ?? '#';
}

/** Toggle class */
export function toggleClass(el, className, force) {
  if (!el) return;
  if (force !== undefined) el.classList.toggle(className, force);
  else el.classList.toggle(className);
}

/** Add class */
export function addClass(el, ...cls) {
  if (el) el.classList.add(...cls);
}

/** Remove class */
export function removeClass(el, ...cls) {
  if (el) el.classList.remove(...cls);
}

/** Check if element has class */
export function hasClass(el, cls) {
  return el ? el.classList.contains(cls) : false;
}

// ── Event Helpers ────────────────────────────────────────

/**
 * Debounce: delays fn execution until after `wait` ms of inactivity.
 */
export function debounce(fn, wait = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle: limits fn execution to once per `limit` ms.
 */
export function throttle(fn, limit = 100) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// ── Formatters ───────────────────────────────────────────

/** Escape HTML special chars to prevent XSS */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Format a date to locale string */
export function formatDate(date, locale = 'en-US') {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/** Generate a random ID */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Get next integer ID from an array of objects with `id` property */
export function nextId(arr) {
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(item => item.id ?? 0)) + 1;
}

/** Deep clone an object via JSON */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Clamp a number between min and max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Sleep for ms milliseconds */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Get initials from a name */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// ── Intersection Observer helper ─────────────────────────

/**
 * Observe elements and call callback when they enter the viewport.
 * @param {string|NodeList|Element[]} target - selector or elements
 * @param {Function} onEnter - called with (entry, observer)
 * @param {IntersectionObserverInit} options
 */
export function observe(target, onEnter, options = {}) {
  const defaultOpts = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onEnter(entry, observer);
      }
    });
  }, defaultOpts);

  const elements = typeof target === 'string'
    ? $$(target)
    : (target instanceof NodeList ? Array.from(target) : [target].flat());

  elements.forEach(el => el && observer.observe(el));
  return observer;
}

/** Download a string as a file */
export function downloadFile(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Read a text file from an input[type=file] */
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
