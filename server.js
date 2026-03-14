/**
 * server.js — Express API server for Portfolio (React edition).
 * Serves the built React app in production, proxied by Vite in dev.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT      = parseInt(process.env.PORT, 10) || 3000;
const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'portfolio.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const DIST_DIR  = path.join(__dirname, 'dist');

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
const sessions = new Map();

// ── Default Data ────────────────────────────────────────────

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
    text1: "I'm a passionate web and Python developer with over 2 years of experience building interactive, visually appealing websites and automation tools.",
    text2: "I believe in clean code, intuitive design, and continuous learning. Whether it's crafting pixel-perfect interfaces or building efficient backend scripts, I approach every project with attention to detail.",
  },
  experiences: [
    { id: 1, title: 'Freelance Web Developer',     period: '2022 - Present', description: 'Developed responsive websites and web applications for various clients using HTML, CSS, and JavaScript.' },
    { id: 2, title: 'Python Automation Specialist', period: '2021 - 2022',   description: 'Created automation scripts for data processing and web scraping. Improved efficiency by 50% in repetitive tasks.' },
    { id: 3, title: 'Open-Source Contributor',      period: 'Ongoing',       description: 'Contributed to various open-source projects on GitHub, focusing on front-end enhancements and bug fixes.' },
  ],
  skills: [
    { id: 1, name: 'HTML',       level: 100 },
    { id: 2, name: 'CSS',        level: 100 },
    { id: 3, name: 'JavaScript', level: 75  },
    { id: 4, name: 'Python',     level: 100 },
  ],
  projects: [
    { id: 1, title: 'Valiance Discord Bot', description: 'A feature-rich Discord bot built with JavaScript and Discord.js.', link: 'https://github.com/Indifferenzah/Valiancejs', image: '', technologies: ['JavaScript', 'Discord.js', 'Node.js'] },
    { id: 2, title: 'AI Detector',          description: 'AI-powered content detection tool built with Python machine learning libraries.', link: 'https://github.com/Indifferenzah/AiDetector', image: '', technologies: ['Python', 'Machine Learning'] },
    { id: 3, title: 'Valiance Website',     description: 'A modern website with a forum for the Valiance community.', link: 'https://github.com/Indifferenzah/ValianceSite', image: '', technologies: ['HTML', 'CSS', 'JavaScript'] },
    { id: 4, title: 'Portfolio Website',    description: 'This portfolio — built from scratch with a glassmorphism design, admin dashboard, and secure authentication.', link: '', image: '', technologies: ['React', 'CSS', 'Node.js'] },
  ],
  education: [
    { id: 1, title: 'Self-Taught Developer', period: '2020 - Present', description: 'Continuous self-education through online courses, documentation, tutorials, and hands-on projects.' },
    { id: 2, title: 'ITIS Informatico',      period: '2022 - Present', description: 'High school focused on computer science and programming in Italy.' },
  ],
};

// ── Bootstrap ───────────────────────────────────────────────

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
    console.log('[server] Created data/portfolio.json');
  }
}

// ── Session Helpers ─────────────────────────────────────────

function generateToken() { return crypto.randomBytes(32).toString('hex'); }

function createSession(username) {
  const token = generateToken();
  sessions.set(token, { username, expires: Date.now() + SESSION_TTL_MS });
  return token;
}

function getSession(token) {
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() > s.expires) { sessions.delete(token); return null; }
  return s;
}

function bearerToken(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
}

function requireAuth(req, res, next) {
  const session = getSession(bearerToken(req));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.session = session;
  next();
}

// ── File Helpers ────────────────────────────────────────────

function readJson(f) {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; }
}

function writeJson(f, d) { fs.writeFileSync(f, JSON.stringify(d, null, 2), 'utf8'); }

// ── App ─────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// CORS
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});
app.options('*', (_, res) => res.sendStatus(204));

// ── Portfolio API ────────────────────────────────────────────

app.get('/api/portfolio', (_, res) => {
  const data = readJson(DATA_FILE) || DEFAULT_DATA;
  res.json(data);
});

app.put('/api/portfolio', requireAuth, (req, res) => {
  if (!req.body || typeof req.body !== 'object')
    return res.status(400).json({ error: 'Invalid data' });
  try {
    writeJson(DATA_FILE, req.body);
    res.json({ success: true, message: 'Data saved.' });
  } catch {
    res.status(500).json({ error: 'Failed to write data' });
  }
});

// ── Auth API ─────────────────────────────────────────────────

app.get('/api/auth/status', (_, res) => {
  const config = readJson(AUTH_FILE);
  res.json({ configured: !!config, salt: config?.salt ?? null });
});

app.post('/api/auth/setup', (req, res) => {
  if (fs.existsSync(AUTH_FILE))
    return res.status(409).json({ error: 'Already configured' });
  const { username, hash, salt } = req.body || {};
  if (!username || !hash || !salt)
    return res.status(400).json({ error: 'Missing username, hash or salt' });
  try {
    writeJson(AUTH_FILE, { username, hash, salt });
    res.json({ success: true, message: 'Admin account created.' });
  } catch {
    res.status(500).json({ error: 'Failed to write auth file' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const config = readJson(AUTH_FILE);
  if (!config) return res.status(403).json({ error: 'Not configured' });
  const { username, hash } = req.body || {};
  if (!username || !hash)
    return res.status(400).json({ error: 'Missing username or hash' });
  if (username !== config.username || hash !== config.hash)
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = createSession(username);
  res.json({ success: true, token, username });
});

app.post('/api/auth/logout', (req, res) => {
  const t = bearerToken(req);
  if (t) sessions.delete(t);
  res.json({ success: true });
});

app.put('/api/auth/username', requireAuth, (req, res) => {
  const config = readJson(AUTH_FILE);
  if (!config) return res.status(404).json({ error: 'Not configured' });
  const { newUsername, currentHash } = req.body || {};
  if (!newUsername || !currentHash)
    return res.status(400).json({ error: 'Missing fields' });
  if (currentHash !== config.hash)
    return res.status(401).json({ error: 'Current password incorrect' });
  config.username = newUsername;
  req.session.username = newUsername;
  try {
    writeJson(AUTH_FILE, config);
    res.json({ success: true, message: 'Username changed.' });
  } catch {
    res.status(500).json({ error: 'Failed to write auth file' });
  }
});

app.put('/api/auth/password', requireAuth, (req, res) => {
  const config = readJson(AUTH_FILE);
  if (!config) return res.status(404).json({ error: 'Not configured' });
  const { currentHash, newHash, newSalt } = req.body || {};
  if (!currentHash || !newHash || !newSalt)
    return res.status(400).json({ error: 'Missing fields' });
  if (currentHash !== config.hash)
    return res.status(401).json({ error: 'Current password incorrect' });
  config.hash = newHash;
  config.salt = newSalt;
  try {
    writeJson(AUTH_FILE, config);
    res.json({ success: true, message: 'Password changed.' });
  } catch {
    res.status(500).json({ error: 'Failed to write auth file' });
  }
});

// ── Static (production) ──────────────────────────────────────

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (_, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
} else {
  app.get('/', (_, res) => res.json({ message: 'Run `npm run build` or use `npm run dev`.' }));
}

// ── Start ────────────────────────────────────────────────────

ensureDataDir();
app.listen(PORT, () => {
  console.log(`[server] API running at http://localhost:${PORT}`);
  console.log(`[server] Data: ${DATA_DIR}`);
});
