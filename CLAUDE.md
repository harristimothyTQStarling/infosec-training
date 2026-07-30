# TQStarling Security Awareness Training

Interactive web app that walks a TQStarling workforce member through 8 security awareness modules + a 15-question final examination. Sign-in is via Microsoft Entra ID (tqstarling.com tenant); every exam submission is recorded automatically in Postgres. A printable Record of Completion is generated on pass.

- **Training ID:** TQS-TRN-SAA-2026 · **Current version:** 2.0.0 (set in `src/App.jsx`)
- **Required annually** per HR Security Policy TQS-HRS-001 §5; completion records retained 6 years (HIPAA 45 CFR §164.530(j))
- **Owner:** VP of People (day-to-day) · **Approver:** CEO for substantive content changes

## Stack

- **Frontend:** React 18 + Vite + Tailwind. Single-file architecture: nearly everything lives in `src/App.jsx`. Icons from `lucide-react`. Display serif (Fraunces) + body sans (Inter) from Google Fonts CDN with system fallbacks in CSS variables `--fnt-display` / `--fnt-body`.
- **Backend:** Express (`server/`) — serves the built SPA, handles Entra OIDC sign-in (`@azure/msal-node`, auth-code flow), stores sessions in Postgres (`connect-pg-simple`), records exam results. Security headers (CSP, HSTS, X-Frame-Options DENY, noindex) are set in `server/index.js`.
- **Database:** Postgres (Railway plugin). `exam_results` table — one row per exam submission (pass AND fail), schema in `server/db.js`. Identity columns are stamped server-side from the Entra session, never trusted from the client.
- **Deployment:** Railway, project **TQStarling-InfoSec-Test** — `railway.json` sets build (`npm ci && npm run build`), start (`npm start`), healthcheck `/healthz`. Env vars documented in `.env.example`.

## Auth flow

`/auth/login` → Entra (single-tenant) → `/auth/callback` sets the session → SPA reads `GET /api/me` (401 = show sign-in gate). `POST /api/results` requires the session. Local dev without an Entra registration: `AUTH_DISABLED=true` signs in a fixed dev user — hard-gated to `NODE_ENV !== 'production'` (the dev user is also treated as admin).

**Admin dashboard:** users whose verified session email is on the `ADMIN_EMAILS` allowlist (comma-separated service variable) get `isAdmin: true` from `/api/me`, an Admin button on the welcome screen, and access to `GET /api/admin/results` + `GET /api/admin/results.xlsx` (exceljs). The dashboard lists all submissions, exports to Excel, and reprints the Record of Completion for passing rows. Access is enforced server-side in `requireAdmin` — never rely on the UI flag.

## Editing content

Two arrays at the top of `src/App.jsx` hold all learning content:

- **`MODULES`** — 8 modules, each `{ id, number, eyebrow, title, minutes, icon, blocks, check }`
- **`EXAM`** — 15 questions, each `{ q, options, correct, topic }`; pass threshold 80% (12/15), constant is `PASS_THRESHOLD`

Available `block` types (rendered by `Block` in App.jsx): `lead`, `p`, `h3`, `list`, `numbered`, `definitions`, `callout` (tones: `gold` / `neutral` / `warn`), `classTable` (hardcoded, used only for the classification-levels table in Module 02). If a new block type is genuinely needed, add a case to the `Block` switch and use it consistently — don't inline new markup ad-hoc.

**Every substantive content edit must:**
1. Bump `TRAINING_VERSION` at the top of `src/App.jsx` AND `version` in `package.json` (semver — patch for typos, minor for content refresh, major for structural change)
2. Add a `CHANGELOG.md` entry
3. Deploy to Railway (push if git-connected, or `railway up`)
4. Notify VP People — result rows carry `training_version`, so reporting can distinguish editions

## Tone conventions

Written for adult professionals. No condescension, no exclamation points, no "great job!" congratulation copy. Reference real attacks (MFA fatigue, AiTM, quishing, BEC, deepfake vishing), real tools (Microsoft 365, Authenticator with number matching, Intune, Purview, FIDO2), and specific TQStarling procedures (1-hour incident reporting to security@tqstarling.com, quarterly access reviews, family-device prohibition).

## Gotchas

- **Unicode escape sequences render literally inside JSX text.** `·` and `’` work inside JS string literals but appear as the literal characters `·` when placed as JSX children. Use the actual characters (`·`, `'`, `—`, `"…"`), not the escape sequences. This bit us in the initial build.
- **Brand colors go through inline `style={{}}`** referencing the `BRAND` constant object, not Tailwind arbitrary values like `bg-[#052821]`. This is deliberate — safer across Tailwind config changes and easier to grep.
- **`ModuleView` must stay keyed by module id** (`key={MODULES[currentIdx].id}`) — without it, React reuses the instance and knowledge-check selections bleed across modules (fixed in 1.0.1).
- **Progress vs. results:** in-flight progress lives in `localStorage` under `tqs-saa-2026-progress:<email>` (per-user, for shared machines). The authoritative record is the `exam_results` table — NOT localStorage, and no longer an Excel log.
- **Identity is server-side.** The client never sends name/email; `POST /api/results` stamps identity from the session. Don't add client-supplied identity fields back.
- **No client-side routing.** Single page. Don't add react-router. The Express catch-all serves `index.html` for unknown paths.
- **CSP:** `form-action` allows `login.microsoftonline.com` for the OIDC redirect. If you add any external resource, update the CSP in `server/index.js`.

## Brand tokens

`BRAND` constant in `src/App.jsx`:

- dark green `#052821` · green `#004739` · gold `#B68834` · goldSoft `#D9B574`
- cream `#F6F3EC` · off-white `#F6F6F6` · paper `#FBFAF6`
- ink `#1A1A1A` · muted `#6B6B6B` · rule `#D9D6CD` · ruleSoft `#E8E5DE`
- success `#1F6F3E` on `#E8F3EC` · warn `#A33A2A` on `#F6E8E5`

## Commands

```bash
npm install                          # first time on a new machine
npm run dev                          # Vite HMR frontend :5173 (proxies /api,/auth to :8080)
npm run dev:server                   # Express backend :8080 (reads .env)
npm run build                        # produce dist/
npm start                            # serve dist/ + API (what Railway runs)

# Local full-stack dev without Entra:
AUTH_DISABLED=true npm run dev:server
```

## Out of scope — ask before adding

The following change the compliance posture of the tool and require discussion with VP People + CEO before implementation:

- Analytics or telemetry beyond the exam-result records
- Exposing result data through endpoints beyond the existing `ADMIN_EMAILS`-gated admin API; widening the allowlist is a VP People decision
- Collecting data beyond what the Entra session and exam answers already provide
- New third-party runtime dependencies

## Related documents (outside this repo)

- Source policy: `TQS-HRS-001` §5 — SharePoint `/HR/Documents/General/Policies/Security and Access/02_TQStarling_HR_Security_Policy.docx`
- Completion records: `exam_results` table, Railway Postgres (project TQStarling-InfoSec-Test)
- Periodic actions this deliverable participates in: `TQS-PAR-001` (annual training refresh, quarterly phishing simulations)
