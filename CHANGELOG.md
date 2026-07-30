# Changelog

All notable changes to the TQStarling Security & Information Security Awareness Training are recorded here. This file is separate from the version constant in `src/App.jsx` (`TRAINING_VERSION`) — bump both together on every substantive edit.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning is semver-adjacent:

- **Patch** (1.0.**x**) — typo, styling tweak, image swap, minor phrasing
- **Minor** (1.**y**.0) — content refresh, new question, updated example, new module
- **Major** (**z**.0.0) — structural change (module reorganization, exam length, scoring, certificate format)

Completion records store the `TRAINING_VERSION` in effect at the time — HR should be able to see, for any workforce member, which edition they passed.

---

## [2.1.1] — 2026-07-30

Bug fix.

- The Admin entry was only on the welcome screen, which users with training in progress never see again — admins mid-training had no way to reach the dashboard. Added an **Admin dashboard** button to the sidebar footer (desktop and mobile drawer) and to the certificate screen's action row.

## [2.1.0] — 2026-07-30

Admin dashboard.

- New **Admin** button on the welcome screen, visible only to users on the `ADMIN_EMAILS` allowlist (a Railway service variable; initially tim@, manasi@, liz@, joe@ tqstarling.com). Access is enforced server-side against the verified Entra session — the button is only UI.
- Admin dashboard lists every examination submission (name, email, score, pass/fail, version, date) with name/email filtering.
- **Export to Excel** — downloads all results as a real `.xlsx` (`/api/admin/results.xlsx`, generated server-side with exceljs).
- **Reprint record** — regenerates the standard Record of Completion for any passing submission from the stored result, for print / save-as-PDF.
- Training content unchanged.

## [2.0.0] — 2026-07-30

Platform re-architecture: Railway + Entra SSO + database-backed results. Training content unchanged.

- **Single sign-on** — Microsoft Entra ID (tqstarling.com tenant, single-tenant OIDC via MSAL). The welcome screen's manual name/email fields are gone; identity comes from the verified directory account and results are filed under it.
- **Results database** — new Express backend records every exam submission (pass and fail) in Postgres `exam_results`: user, email, Entra object ID, timestamp, score, pass/fail, training version, per-question exam answers and knowledge-check results (JSONB). Identity is stamped server-side from the session.
- **Manual tracking retired** — the `TQStarling_Training_Log.xlsx` screenshot/email flow is removed; the database is the authoritative Training Completion Log per TQS-HRS-001 §5. Certificate and exam copy updated accordingly.
- **Deployment moved Netlify → Railway** (project `TQStarling-InfoSec-Test`): `railway.json`, `/healthz`, security headers now served by Express; `netlify.toml` removed.
- Local progress is now stored per-user (`tqs-saa-2026-progress:<email>`) so shared machines don't leak progress between accounts.
- Structural change to sign-in flow and record handling → major version bump. Exam content, module content, pass threshold, and certificate format are unchanged.

## [1.0.1] — 2026-07-30

Bug fix.

- Fixed knowledge-check answers carrying over between modules: selecting an option in one module's knowledge check no longer appears pre-selected on the next module. `ModuleView` is now keyed by module id so its local state resets on navigation. Previously-submitted answers still restore correctly when revisiting a module.

## [1.0.0] — 2026-06-17

Initial edition.

- 8 content modules: Why this matters · Information classification · Authentication & access · Phishing & social engineering · Your devices · Email, files & sharing · AI & generative tools · Reporting incidents
- 15-question final examination, 80% pass threshold (12/15)
- Editorial layout — Fraunces serif display, Inter body, gold serif module numerals as signature element
- Progress persists in `localStorage` under `tqs-saa-2026-progress`
- Printable Record of Completion with workforce name, score, date, Training ID, version
