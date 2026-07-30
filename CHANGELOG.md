# Changelog

All notable changes to the TQStarling Security & Information Security Awareness Training are recorded here. This file is separate from the version constant in `src/App.jsx` (`TRAINING_VERSION`) — bump both together on every substantive edit.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning is semver-adjacent:

- **Patch** (1.0.**x**) — typo, styling tweak, image swap, minor phrasing
- **Minor** (1.**y**.0) — content refresh, new question, updated example, new module
- **Major** (**z**.0.0) — structural change (module reorganization, exam length, scoring, certificate format)

Completion records store the `TRAINING_VERSION` in effect at the time — HR should be able to see, for any workforce member, which edition they passed.

---

## [1.0.0] — 2026-06-17

Initial edition.

- 8 content modules: Why this matters · Information classification · Authentication & access · Phishing & social engineering · Your devices · Email, files & sharing · AI & generative tools · Reporting incidents
- 15-question final examination, 80% pass threshold (12/15)
- Editorial layout — Fraunces serif display, Inter body, gold serif module numerals as signature element
- Progress persists in `localStorage` under `tqs-saa-2026-progress`
- Printable Record of Completion with workforce name, score, date, Training ID, version
