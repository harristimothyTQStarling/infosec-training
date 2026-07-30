// =============================================================
// TQStarling Security Awareness Training — application server
//
// Serves the built SPA from dist/, handles Entra ID sign-in, and
// records exam results in Postgres. Deployed on Railway; the
// Postgres plugin supplies DATABASE_URL.
// =============================================================

import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { getPool, initDb, insertResult, latestResultFor } from './db.js';
import { registerAuthRoutes, requireUser, authBypassed } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 8080;
const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();
app.set('trust proxy', 1); // Railway terminates TLS at the edge proxy
app.use(express.json({ limit: '64kb' }));

// --- Security headers (ported from the old netlify.toml) -------
app.use((req, res, next) => {
  res.set({
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Robots-Tag': 'noindex, nofollow',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      // Entra sign-in navigates via top-level redirect to microsoftonline.com
      "form-action 'self' https://login.microsoftonline.com",
    ].join('; '),
  });
  next();
});

// --- Sessions --------------------------------------------------
// Stored in Postgres so sign-ins survive restarts and redeploys.
// Falls back to in-memory store only in dev bypass without a DB.
let sessionStore;
if (process.env.DATABASE_URL) {
  const PgStore = connectPgSimple(session);
  sessionStore = new PgStore({ pool: getPool(), createTableIfMissing: true });
} else if (!IS_PROD && authBypassed) {
  sessionStore = undefined; // MemoryStore — dev only
  console.warn('[dev] No DATABASE_URL — using in-memory sessions');
} else {
  throw new Error('DATABASE_URL is required in production');
}

app.use(session({
  store: sessionStore,
  name: 'tqs.sid',
  secret: process.env.SESSION_SECRET || (IS_PROD ? undefined : 'dev-only-secret'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',       // allows the redirect back from login.microsoftonline.com
    secure: IS_PROD,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
}));

// --- Auth ------------------------------------------------------
registerAuthRoutes(app);

// --- API -------------------------------------------------------
app.get('/healthz', (req, res) => res.json({ ok: true }));

app.get('/api/me', requireUser, async (req, res) => {
  const { name, email } = req.session.user;
  let priorResult = null;
  if (process.env.DATABASE_URL) {
    try { priorResult = await latestResultFor(email); }
    catch (err) { console.error('latestResultFor failed:', err.message); }
  }
  res.json({ name, email, priorResult });
});

app.post('/api/results', requireUser, async (req, res) => {
  const { score, total, passed, trainingVersion, examAnswers, kcResults } = req.body || {};
  if (!Number.isInteger(score) || !Number.isInteger(total) || total <= 0 || score < 0 || score > total || typeof passed !== 'boolean') {
    return res.status(400).json({ error: 'invalid_payload' });
  }
  try {
    const { oid, name, email } = req.session.user; // identity is server-side only
    const row = await insertResult({
      entraOid: oid,
      userName: name,
      userEmail: email,
      score, total, passed,
      trainingVersion: String(trainingVersion || 'unknown'),
      examAnswers, kcResults,
    });
    res.status(201).json({ id: row.id, completedAt: row.completed_at });
  } catch (err) {
    console.error('insertResult failed:', err.message);
    res.status(500).json({ error: 'db_write_failed' });
  }
});

// --- Static SPA ------------------------------------------------
app.use(express.static(DIST, {
  setHeaders(res, filePath) {
    // Vite emits hashed filenames under assets/ — cache forever.
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));
app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));

// --- Errors ----------------------------------------------------
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).send('Something went wrong. Contact security@tqstarling.com if this persists.');
});

// --- Start -----------------------------------------------------
(async () => {
  if (process.env.DATABASE_URL) {
    await initDb();
    console.log('Database schema ready');
  }
  app.listen(PORT, () => {
    console.log(`TQStarling InfoSec Training listening on :${PORT}${authBypassed ? ' (AUTH BYPASSED — dev mode)' : ''}`);
  });
})();
