# TQStarling Security & Information Security Awareness Training

Web app that walks a workforce member through eight security modules and a fifteen-question examination. Sign-in is via **Microsoft Entra ID** (tqstarling.com work accounts); every exam submission is recorded automatically in a **Postgres results database**, and a printable Record of Completion is generated on pass.

- **Training ID:** TQS-TRN-SAA-2026 · **Version:** see `src/App.jsx` (`TRAINING_VERSION`)
- **Deployment target:** Railway (project `TQStarling-InfoSec-Test`) — Node service + Postgres plugin
- **Development:** Vite + React + Tailwind frontend, Express backend, edited with Claude Code

## Getting started

```bash
# Prerequisites: Node 20+ (see .nvmrc)
npm install
cp .env.example .env        # then fill in values (or set AUTH_DISABLED=true)

# Terminal 1 — backend (auth + results API), http://localhost:8080
AUTH_DISABLED=true npm run dev:server

# Terminal 2 — frontend with HMR, http://localhost:5173 (proxies to :8080)
npm run dev
```

`AUTH_DISABLED=true` signs you in as a fixed dev user so you can work without an Entra app registration. It is ignored when `NODE_ENV=production`. Without a local `DATABASE_URL`, result writes fail gracefully (the UI shows a save-error note) — attach a local Postgres or test against the Railway database to exercise the write path.

## Editing with Claude Code

Claude Code auto-loads `CLAUDE.md` on session start — it has the project conventions, architecture, content structure, brand tokens, and gotchas. Read it first if you're new to the project.

## Architecture

```
Browser ──► Express (server/)
             ├─ /auth/login|callback|logout … Entra ID OIDC (single-tenant)
             ├─ /api/me ………………………………… session identity + prior result
             ├─ /api/results (POST) …………… record exam submission
             ├─ /healthz ……………………………… Railway healthcheck
             └─ static dist/ ………………………… built SPA
                          │
                          ▼
             Postgres: exam_results (one row per attempt, pass or fail)
                       + session store
```

Identity (name, email, Entra object ID) is stamped **server-side** from the signed-in session — the client never supplies it. Each `exam_results` row stores: user, email, Entra OID, score, total, pass/fail, training version, per-question exam answers (JSONB), knowledge-check results (JSONB), and a timestamp.

## Deploying to Railway

The service reads `railway.json` (build `npm ci && npm run build`, start `npm start`, healthcheck `/healthz`).

**One-time setup:**

1. Create the Railway project `TQStarling-InfoSec-Test` with a Node service from this repo (git-connected or `railway up`).
2. Add the **Postgres** plugin to the project.
3. On the app service, set variables:
   - `DATABASE_URL` → `${{Postgres.DATABASE_URL}}` (reference the plugin)
   - `SESSION_SECRET` → long random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `BASE_URL` → the service's public URL (e.g. `https://tqstarling-infosec-test.up.railway.app`)
   - `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET` → from the app registration below
   - `NODE_ENV` → `production`
4. Generate a public domain for the service and make sure it matches `BASE_URL`.

The schema (`exam_results` + indexes) is created automatically on first boot.

**Entra app registration (IT admin, one-time):**

1. Entra admin center → **App registrations → New registration**
   - Name: `TQStarling InfoSec Training`
   - Supported account types: **Accounts in this organizational directory only** (single tenant)
   - Redirect URI: **Web** → `https://<railway-domain>/auth/callback`
2. Note the **Application (client) ID** and **Directory (tenant) ID**.
3. **Certificates & secrets → New client secret** — note the secret **value** (visible once). Set a calendar reminder for its expiry.
4. No API permissions beyond the default **Microsoft Graph → User.Read** delegated permission are needed (only OIDC sign-in claims are used).
5. Put the three values in the Railway service variables.

## Rolling out

- **Onboarding** — URL goes in the 30-day new-hire checklist (already referenced in TQS-HRS-001 §5)
- **Annual refresh** — email URL to workforce at start of window; 90-day completion target
- **Tracking** — results are recorded automatically in the `exam_results` table (Railway Postgres) at the moment of submission; no manual log. Query it for completion status, e.g.:

  ```sql
  -- Who has passed the current edition
  SELECT DISTINCT ON (user_email) user_email, user_name, score, total, completed_at
  FROM exam_results
  WHERE passed AND training_version = '2.0.0'
  ORDER BY user_email, completed_at DESC;
  ```

  Records are retained 6 years per HIPAA — do not add TTL/cleanup jobs to this table.

## Structure

```
tqstarling-security-awareness-training/
├── CLAUDE.md                 ← project memory for Claude Code (read first)
├── CHANGELOG.md
├── README.md                 ← this file
├── .env.example              ← all required environment variables
├── railway.json              ← Railway build/deploy config
├── index.html                ← Vite entry
├── package.json
├── vite.config.js            ← dev proxy /api,/auth → :8080
├── tailwind.config.js
├── postcss.config.js
├── server/
│   ├── index.js              ← Express app: headers, sessions, API, static
│   ├── auth.js               ← Entra OIDC (MSAL Node) + dev bypass
│   └── db.js                 ← pg pool, schema, result queries
└── src/
    ├── App.jsx               ← content and behavior
    ├── main.jsx              ← React entry
    └── index.css             ← Tailwind directives
```

Not in the repo: `node_modules/` (run `npm install`), `dist/` (run `npm run build`), `.env` (copy from `.env.example`).

## License

Proprietary — TQStarling LLC internal use only. Not for distribution outside the Workforce.
