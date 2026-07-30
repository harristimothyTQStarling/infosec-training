# TQStarling Security Awareness Training

Interactive web app that walks a TQStarling workforce member through 8 security awareness modules + a 15-question final examination, producing a printable Record of Completion.

- **Training ID:** TQS-TRN-SAA-2026 · **Current version:** 1.0 (set in `src/App.jsx`)
- **Required annually** per HR Security Policy TQS-HRS-001 §5; completion records retained 6 years (HIPAA 45 CFR §164.530(j))
- **Owner:** VP of People (day-to-day) · **Approver:** CEO for substantive content changes

## Stack

React 18 + Vite + Tailwind. Single-file architecture: nearly everything lives in `src/App.jsx` (~1,400 lines). Icons from `lucide-react`. Display serif (Fraunces) + body sans (Inter) load from Google Fonts CDN with system fallbacks in CSS variables `--fnt-display` / `--fnt-body`.

Deploys as a static site to Netlify. `netlify.toml` sets security headers (strict CSP, `X-Frame-Options: DENY`, HSTS, `noindex`) and immutable caching on hashed assets.

## Editing content

Two arrays at the top of `src/App.jsx` hold all learning content:

- **`MODULES`** — 8 modules, each `{ id, number, eyebrow, title, minutes, icon, blocks, check }`
- **`EXAM`** — 15 questions, each `{ q, options, correct, topic }`; pass threshold 80% (12/15), constant is `PASS_THRESHOLD`

Available `block` types (rendered by `Block` in App.jsx): `lead`, `p`, `h3`, `list`, `numbered`, `definitions`, `callout` (tones: `gold` / `neutral` / `warn`), `classTable` (hardcoded, used only for the classification-levels table in Module 02). If a new block type is genuinely needed, add a case to the `Block` switch and use it consistently — don't inline new markup ad-hoc.

**Every substantive content edit must:**
1. Bump `TRAINING_VERSION` at the top of `src/App.jsx` (semver — patch for typos, minor for content refresh, major for structural change)
2. Add a `CHANGELOG.md` entry
3. Rebuild (`npm run build`) and redeploy
4. Notify VP People so the Training Completion Log tracks the new version

## Tone conventions

Written for adult professionals. No condescension, no exclamation points, no "great job!" congratulation copy. Reference real attacks (MFA fatigue, AiTM, quishing, BEC, deepfake vishing), real tools (Microsoft 365, Authenticator with number matching, Intune, Purview, FIDO2), and specific TQStarling procedures (1-hour incident reporting to security@tqstarling.com, quarterly access reviews, family-device prohibition).

## Gotchas

- **Unicode escape sequences render literally inside JSX text.** `\u00B7` and `\u2019` work inside JS string literals but appear as the literal characters `\u00B7` when placed as JSX children. Use the actual characters (`·`, `'`, `—`, `"…"`), not the escape sequences. This bit us in the initial build.
- **Brand colors go through inline `style={{}}`** referencing the `BRAND` constant object, not Tailwind arbitrary values like `bg-[#052821]`. This is deliberate — safer across Tailwind config changes and easier to grep.
- **State lives in `localStorage`** under key `tqs-saa-2026-progress`. Do not introduce `sessionStorage`, `indexedDB`, cookies, third-party analytics, or any server-side telemetry. The authoritative record of completion is `TQStarling_Training_Log.xlsx` maintained by HR, not the browser.
- **No client-side routing.** Single page. Don't add react-router. If you split into routes, also update the SPA redirect in `netlify.toml`.

## Brand tokens

`BRAND` constant in `src/App.jsx`:

- dark green `#052821` · green `#004739` · gold `#B68834` · goldSoft `#D9B574`
- cream `#F6F3EC` · off-white `#F6F6F6` · paper `#FBFAF6`
- ink `#1A1A1A` · muted `#6B6B6B` · rule `#D9D6CD` · ruleSoft `#E8E5DE`
- success `#1F6F3E` on `#E8F3EC` · warn `#A33A2A` on `#F6E8E5`

## Commands

```bash
npm install           # first time on a new machine
npm run dev           # local preview http://localhost:5173 with HMR
npm run build         # produce dist/
npm run preview       # serve the built dist/ locally

netlify deploy --prod --dir=dist   # deploy after building (Netlify CLI)
```

## Out of scope — ask before adding

The following change the compliance posture of the tool and require discussion with VP People + CEO before implementation:

- Analytics or telemetry of any kind
- Server-side rendering or a backend
- Auth / SSO (currently intentionally an open URL protected by CSP + noindex)
- Data collection beyond the name/email captured on the welcome screen
- New third-party runtime dependencies beyond React + lucide-react + Google Fonts

## Related documents (outside this repo)

- Source policy: `TQS-HRS-001` §5 — SharePoint `/HR/Documents/General/Policies/Security and Access/02_TQStarling_HR_Security_Policy.docx`
- Completion log: `TQStarling_Training_Log.xlsx` — SharePoint `/HR/Documents/`
- Periodic actions this deliverable participates in: `TQS-PAR-001` (annual training refresh, quarterly phishing simulations)
