// =============================================================
// Microsoft Entra ID single sign-on — OpenID Connect auth-code flow
// via MSAL Node (confidential client).
//
// Single-tenant: only accounts in the TQStarling Entra tenant
// (tqstarling.com) can sign in. Required env:
//   ENTRA_TENANT_ID     — Directory (tenant) ID
//   ENTRA_CLIENT_ID     — Application (client) ID of the app registration
//   ENTRA_CLIENT_SECRET — Client secret value
//   BASE_URL            — Public origin of this deployment
//                         (e.g. https://tqstarling-infosec-test.up.railway.app)
//
// Dev bypass: AUTH_DISABLED=true (honored only when NODE_ENV !== 'production')
// signs every request in as a fixed test user so the app can be exercised
// without an Entra app registration.
// =============================================================

import * as msal from '@azure/msal-node';

const OIDC_SCOPES = ['openid', 'profile', 'email'];

export const authBypassed =
  process.env.AUTH_DISABLED === 'true' && process.env.NODE_ENV !== 'production';

const DEV_USER = {
  oid: 'dev-bypass',
  name: 'Dev Test User',
  email: 'dev@tqstarling.local',
};

let msalApp = null;

function getMsalApp() {
  if (!msalApp) {
    const { ENTRA_TENANT_ID, ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET } = process.env;
    if (!ENTRA_TENANT_ID || !ENTRA_CLIENT_ID || !ENTRA_CLIENT_SECRET) {
      throw new Error('Entra SSO is not configured — set ENTRA_TENANT_ID, ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET (or AUTH_DISABLED=true for local dev)');
    }
    msalApp = new msal.ConfidentialClientApplication({
      auth: {
        clientId: ENTRA_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${ENTRA_TENANT_ID}`,
        clientSecret: ENTRA_CLIENT_SECRET,
      },
    });
  }
  return msalApp;
}

function redirectUri() {
  const base = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`).replace(/\/$/, '');
  return `${base}/auth/callback`;
}

export function registerAuthRoutes(app) {
  app.get('/auth/login', async (req, res, next) => {
    if (authBypassed) {
      req.session.user = { ...DEV_USER };
      return res.redirect('/');
    }
    try {
      const url = await getMsalApp().getAuthCodeUrl({
        scopes: OIDC_SCOPES,
        redirectUri: redirectUri(),
        prompt: 'select_account',
      });
      res.redirect(url);
    } catch (err) { next(err); }
  });

  app.get('/auth/callback', async (req, res, next) => {
    try {
      if (req.query.error) {
        return res.status(401).send(`Sign-in failed: ${req.query.error_description || req.query.error}`);
      }
      const result = await getMsalApp().acquireTokenByCode({
        code: req.query.code,
        scopes: OIDC_SCOPES,
        redirectUri: redirectUri(),
      });
      const claims = result.idTokenClaims || {};
      // preferred_username is the UPN (user@tqstarling.com); email claim may
      // also be present. name is the display name from the directory.
      const email = claims.email || claims.preferred_username || '';
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = {
          oid: claims.oid || claims.sub,
          name: claims.name || email,
          email,
        };
        req.session.save((err2) => (err2 ? next(err2) : res.redirect('/')));
      });
    } catch (err) { next(err); }
  });

  app.get('/auth/logout', (req, res) => {
    const tenant = process.env.ENTRA_TENANT_ID;
    req.session.destroy(() => {
      if (authBypassed || !tenant) return res.redirect('/');
      const base = (process.env.BASE_URL || '').replace(/\/$/, '');
      const postLogout = base ? `?post_logout_redirect_uri=${encodeURIComponent(base + '/')}` : '';
      res.redirect(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/logout${postLogout}`);
    });
  });
}

// API guard — 401 JSON rather than a redirect, so the SPA can show
// its sign-in screen.
export function requireUser(req, res, next) {
  if (authBypassed && !req.session.user) {
    req.session.user = { ...DEV_USER };
  }
  if (!req.session.user) {
    return res.status(401).json({ error: 'not_authenticated' });
  }
  next();
}

// =============================================================
// Admin allowlist
//
// ADMIN_EMAILS: comma-separated work emails allowed to use the
// admin dashboard (view all results, export, reprint records).
// Checked against the VERIFIED email from the Entra session —
// never against anything the client sends.
// =============================================================

function adminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(user) {
  if (!user?.email) return false;
  if (authBypassed && user.oid === 'dev-bypass') return true; // dev convenience
  return adminEmails().includes(user.email.toLowerCase());
}

export function requireAdmin(req, res, next) {
  requireUser(req, res, () => {
    if (!isAdmin(req.session.user)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  });
}
