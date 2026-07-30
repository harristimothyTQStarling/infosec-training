# TQStarling Security & Information Security Awareness Training

Interactive web app that walks a workforce member through eight security modules and a fifteen-question examination, then generates a printable Record of Completion.

- **Training ID:** TQS-TRN-SAA-2026 · **Version:** see `src/App.jsx` (`TRAINING_VERSION`)
- **Deployment target:** Netlify (static site)
- **Development:** Vite + React + Tailwind, edited with Claude Code

## Getting started

```bash
# Prerequisites: Node 20+ (see .nvmrc)
npm install
npm run dev
```

Open http://localhost:5173. Edits to `src/App.jsx` hot-reload.

## Editing with Claude Code

```bash
cd tqstarling-security-awareness-training
claude
```

Claude Code auto-loads `CLAUDE.md` on session start — it has the project conventions, content structure, brand tokens, and the gotchas we learned building v1.0. Read it first if you're new to the project.

Common asks:

- "Add a new module about X after Module 06" — Claude Code knows the module block types and where the array lives.
- "Add three new questions to the exam covering privacy" — same.
- "Bump to version 1.1.0 and update the changelog" — TRAINING_VERSION at the top of App.jsx, entry in CHANGELOG.md.

## Deploying

Three paths, in order of speed:

### Drag and drop

```bash
npm run build
```

Then drag the resulting `dist/` folder onto Netlify's manual deploy dropzone at [app.netlify.com](https://app.netlify.com) → **Sites → Add new site → Deploy manually**. Rename the site to something like `tqstarling-training` after the first deploy.

### Netlify CLI

```bash
npm install -g netlify-cli
netlify login              # once
netlify deploy --prod --dir=dist
```

The first deploy prompts to link the folder to a Netlify site.

### Git-connected continuous deploy

Push this repo to a private GitHub / GitLab / Bitbucket, then in Netlify: **Add new site → Import an existing project** → point at the repo. Netlify reads `netlify.toml` and knows to run `npm run build` and publish `dist/` on every push.

## Rolling out

- **Onboarding** — URL goes in the 30-day new-hire checklist (already referenced in TQS-HRS-001 §5)
- **Annual refresh** — email URL to workforce at start of window; 90-day completion target
- **Tracking** — workforce members screenshot or print the Record of Completion and send it to VP People, who logs it in `TQStarling_Training_Log.xlsx` (retained 6 years per HIPAA)

## Structure

```
tqstarling-security-awareness-training/
├── CLAUDE.md                 ← project memory for Claude Code (read first)
├── CHANGELOG.md
├── README.md                 ← this file
├── .editorconfig
├── .nvmrc
├── .gitignore
├── index.html                ← Vite entry
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml              ← build config + security headers
└── src/
    ├── App.jsx               ← content and behavior
    ├── main.jsx              ← React entry
    └── index.css             ← Tailwind directives
```

Not in the repo: `node_modules/` (run `npm install`) and `dist/` (run `npm run build`).

## License

Proprietary — TQStarling LLC internal use only. Not for distribution outside the Workforce.
