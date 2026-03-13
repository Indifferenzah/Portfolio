/**
 * server.js — Pure Node.js HTTP server for Portfolio project.
 * No external dependencies — uses only built-in modules.
 *
 * Features:
 *  - Serves static files from the project root
 *  - SPA fallback: unmatched paths serve index.html
 *  - REST API for portfolio data and auth (Bearer token sessions)
 *  - Persists data/portfolio.json and data/auth.json to disk
 */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Constants ──────────────────────────────────────────────

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = path.resolve(__dirname);
const DATA_DIR  = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'portfolio.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory session store: token → { username, expires }
const sessions = new Map();

// ── Default Portfolio Data ─────────────────────────────────

const DEFAULT_DATA = {
  personalInfo: {
    name: 'Indifferenzah',
    title: 'Web Developer & Python Developer',
    description: 'Passionate developer crafting elegant solutions with HTML, CSS, JavaScript, and Python. Over 2 years of hands-on experience building web applications and automation tools.',
    email: 'contact@indifferenzah.dev',
    discord: 'indifferenzah',
    github: 'Indifferenzah',
    kofi: 'indifferenzah',
    yearsExperience: '2+',
    projectsCompleted: '10+',
  },
  about: {
    text1: "I'm a passionate web and Python developer with over 2 years of experience building interactive, visually appealing websites and automation tools. My journey started with a fascination for how the web works, which led me to dive deep into front-end technologies and back-end scripting with Python.",
    text2: "I believe in clean code, intuitive design, and continuous learning. Whether it's crafting pixel-perfect interfaces or building efficient backend scripts, I approach every project with attention to detail and a drive to deliver excellent results.",
  },
  experiences: [
    {
      id: 1,
      title: 'Freelance Web Developer',
      period: '2022 - Present',
      description: 'Developed responsive websites and web applications for various clients using HTML, CSS, and JavaScript. Integrated back-end functionalities with Python for dynamic content and automation.',
    },
    {
      id: 2,
      title: 'Python Automation Specialist',
      period: '2021 - 2022',
      description: 'Created automation scripts for data processing and web scraping. Improved efficiency by 50% in repetitive tasks through smart tooling.',
    },
    {
      id: 3,
      title: 'Open-Source Contributor',
      period: 'Ongoing',
      description: 'Contributed to various open-source projects on GitHub, focusing on front-end enhancements and bug fixes.',
    },
  ],
  skills: [
    { id: 1, name: 'HTML',       level: 100 },
    { id: 2, name: 'CSS',        level: 100 },
    { id: 3, name: 'JavaScript', level: 75  },
    { id: 4, name: 'Python',     level: 100 },
  ],
  projects: [
    {
      id: 1,
      title: 'Valiance Discord Bot',
      description: 'A feature-rich Discord bot built with JavaScript and Discord.js. Handles server management, automated tasks, and enhanced user interaction.',
      link: 'https://github.com/Indifferenzah/Valiancejs',
      image: '',
      technologies: ['JavaScript', 'Discord.js', 'Node.js'],
    },
    {
      id: 2,
      title: 'AI Detector',
      description: 'AI-powered content detection tool built with Python machine learning libraries.',
      link: 'https://github.com/Indifferenzah/AiDetector',
      image: '',
      technologies: ['Python', 'Machine Learning'],
    },
    {
      id: 3,
      title: 'Valiance Website',
      description: 'A modern website with a forum for the Valiance community. Clean UI with responsive design.',
      link: 'https://github.com/Indifferenzah/ValianceSite',
      image: '',
      technologies: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      id: 4,
      title: 'Portfolio Website',
      description: 'This portfolio — built from scratch with a glassmorphism design, admin dashboard, and secure authentication.',
      link: '',
      image: '',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Web Crypto API'],
    },
  ],
  education: [
    {
      id: 1,
      title: 'Self-Taught Developer',
      period: '2020 - Present',
      description: 'Continuous self-education through online courses, documentation, tutorials, and hands-on projects. Completed certifications in HTML, CSS, JavaScript, and Python.',
    },
    {
      id: 2,
      title: 'ITIS Informatico',
      period: '2022 - Present',
      description: 'High school focused on computer science and programming in Italy. Studying software development, algorithms, and IT systems.',
    },
  ],
};

// ── MIME Types ─────────────────────────────────────────────

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.txt':   'text/plain; charset=utf-8',
};

// ── Bootstrap ──────────────────────────────────────────────

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('[server] Created data/ directory');
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
    console.log('[server] Created data/portfolio.json with default data');
  }
}

// ── Session Helpers ────────────────────────────────────────

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSession(username) {
  const token = generateToken();
  sessions.set(token, { username, expires: Date.now() + SESSION_TTL_MS });
  return token;
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expires) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function deleteSession(token) {
  sessions.delete(token);
}

function extractBearerToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
}

// ── File Helpers ───────────────────────────────────────────

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ── Request Body Parser ────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

// ── Response Helpers ───────────────────────────────────────

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

// ── Static File Server ─────────────────────────────────────

function serveFile(res, filePath) {
  // Path traversal protection
  if (!filePath.startsWith(ROOT)) {
    sendError(res, 403, 'Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fall back to index.html for SPA routing
      const indexPath = path.join(ROOT, 'index.html');
      fs.readFile(indexPath, (err2, indexData) => {
        if (err2) {
          sendError(res, 404, 'Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexData);
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
    });
    res.end(data);
  });
}

// ── API Route Handlers ─────────────────────────────────────

// GET /api/data — public
function handleGetData(req, res) {
  let data = readJson(DATA_FILE);
  if (!data) {
    data = DEFAULT_DATA;
  }
  sendJson(res, 200, data);
}

// PUT /api/data — requires auth
async function handlePutData(req, res) {
  const token = extractBearerToken(req);
  const session = getSession(token);
  if (!session) {
    sendError(res, 401, 'Unauthorized');
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    sendError(res, 400, 'Invalid JSON body');
    return;
  }

  if (!body || typeof body !== 'object') {
    sendError(res, 400, 'Invalid data');
    return;
  }

  try {
    writeJson(DATA_FILE, body);
    sendJson(res, 200, { success: true, message: 'Data saved.' });
  } catch (e) {
    sendError(res, 500, 'Failed to write data file');
  }
}

// GET /api/auth/check — public
function handleAuthCheck(req, res) {
  const config = readJson(AUTH_FILE);
  if (!config) {
    sendJson(res, 200, { configured: false, salt: null });
  } else {
    sendJson(res, 200, { configured: true, salt: config.salt });
  }
}

// POST /api/auth/setup — only if not configured
async function handleAuthSetup(req, res) {
  if (fs.existsSync(AUTH_FILE)) {
    sendError(res, 409, 'Already configured');
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    sendError(res, 400, 'Invalid JSON body');
    return;
  }

  const { username, hash, salt } = body || {};
  if (!username || !hash || !salt) {
    sendError(res, 400, 'Missing username, hash or salt');
    return;
  }

  try {
    writeJson(AUTH_FILE, { username, hash, salt });
    sendJson(res, 200, { success: true, message: 'Admin account created.' });
  } catch {
    sendError(res, 500, 'Failed to write auth file');
  }
}

// POST /api/auth/login
async function handleAuthLogin(req, res) {
  const config = readJson(AUTH_FILE);
  if (!config) {
    sendError(res, 403, 'Not configured');
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    sendError(res, 400, 'Invalid JSON body');
    return;
  }

  const { username, hash } = body || {};
  if (!username || !hash) {
    sendError(res, 400, 'Missing username or hash');
    return;
  }

  if (username !== config.username || hash !== config.hash) {
    sendError(res, 401, 'Invalid username or password');
    return;
  }

  const token = createSession(username);
  sendJson(res, 200, { success: true, token, username });
}

// POST /api/auth/logout
async function handleAuthLogout(req, res) {
  const token = extractBearerToken(req);
  if (token) deleteSession(token);
  sendJson(res, 200, { success: true });
}

// PUT /api/auth/username
async function handleAuthChangeUsername(req, res) {
  const token = extractBearerToken(req);
  const session = getSession(token);
  if (!session) {
    sendError(res, 401, 'Unauthorized');
    return;
  }

  const config = readJson(AUTH_FILE);
  if (!config) {
    sendError(res, 404, 'Auth not configured');
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    sendError(res, 400, 'Invalid JSON body');
    return;
  }

  const { newUsername, currentHash } = body || {};
  if (!newUsername || !currentHash) {
    sendError(res, 400, 'Missing newUsername or currentHash');
    return;
  }

  if (currentHash !== config.hash) {
    sendError(res, 401, 'Current password is incorrect');
    return;
  }

  config.username = newUsername;
  // Update session username too
  session.username = newUsername;

  try {
    writeJson(AUTH_FILE, config);
    sendJson(res, 200, { success: true, message: 'Username changed successfully!' });
  } catch {
    sendError(res, 500, 'Failed to write auth file');
  }
}

// PUT /api/auth/password
async function handleAuthChangePassword(req, res) {
  const token = extractBearerToken(req);
  const session = getSession(token);
  if (!session) {
    sendError(res, 401, 'Unauthorized');
    return;
  }

  const config = readJson(AUTH_FILE);
  if (!config) {
    sendError(res, 404, 'Auth not configured');
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    sendError(res, 400, 'Invalid JSON body');
    return;
  }

  const { currentHash, newHash, newSalt } = body || {};
  if (!currentHash || !newHash || !newSalt) {
    sendError(res, 400, 'Missing currentHash, newHash or newSalt');
    return;
  }

  if (currentHash !== config.hash) {
    sendError(res, 401, 'Current password is incorrect');
    return;
  }

  config.hash = newHash;
  config.salt = newSalt;

  try {
    writeJson(AUTH_FILE, config);
    sendJson(res, 200, { success: true, message: 'Password changed successfully!' });
  } catch {
    sendError(res, 500, 'Failed to write auth file');
  }
}

// ── Router ─────────────────────────────────────────────────

async function router(req, res) {
  setCorsHeaders(res);

  const method   = req.method.toUpperCase();
  const url      = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API Routes ───────────────────────────────────────────

  if (pathname === '/api/data') {
    if (method === 'GET')  { handleGetData(req, res); return; }
    if (method === 'PUT')  { await handlePutData(req, res); return; }
    sendError(res, 405, 'Method Not Allowed');
    return;
  }

  if (pathname === '/api/auth/check') {
    if (method === 'GET') { handleAuthCheck(req, res); return; }
    sendError(res, 405, 'Method Not Allowed');
    return;
  }

  if (pathname === '/api/auth/setup') {
    if (method === 'POST') { await handleAuthSetup(req, res); return; }
    sendError(res, 405, 'Method Not Allowed');
    return;
  }

  if (pathname === '/api/auth/login') {
    if (method === 'POST') { await handleAuthLogin(req, res); return; }
    sendError(res, 405, 'Method Not Allowed');
    return;
  }

  if (pathname === '/api/auth/logout') {
    if (method === 'POST') { await handleAuthLogout(req, res); return; }
    sendError(res, 405, 'Method Not Allowed');
    return;
  }

  if (pathname === '/api/auth/username') {
    if (method === 'PUT') { await handleAuthChangeUsername(req, res); return; }
    sendError(res, 405, 'Method Not Allowed');
    return;
  }

  if (pathname === '/api/auth/password') {
    if (method === 'PUT') { await handleAuthChangePassword(req, res); return; }
    sendError(res, 405, 'Method Not Allowed');
    return;
  }

  // Unknown API route
  if (pathname.startsWith('/api/')) {
    sendError(res, 404, 'API endpoint not found');
    return;
  }

  // ── Static File Server ───────────────────────────────────

  let filePath = path.join(ROOT, pathname);

  // Resolve directory to index.html
  if (pathname.endsWith('/') || pathname === '') {
    filePath = path.join(filePath, 'index.html');
  }

  // Serve the file (falls back to index.html if not found)
  serveFile(res, filePath);
}

// ── Start Server ───────────────────────────────────────────

ensureDataDir();

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error('[server] Unhandled error:', err);
    if (!res.headersSent) {
      sendError(res, 500, 'Internal Server Error');
    }
  }
});

server.listen(PORT, () => {
  console.log(`[server] Portfolio running at http://localhost:${PORT}`);
  console.log(`[server] Data directory: ${DATA_DIR}`);
  console.log(`[server] Press Ctrl+C to stop.`);
});
