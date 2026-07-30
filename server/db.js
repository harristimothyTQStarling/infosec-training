// =============================================================
// Database layer — Postgres via node-postgres
//
// DATABASE_URL is injected by Railway when the Postgres plugin is
// attached to the service (reference it as ${{Postgres.DATABASE_URL}}
// in the service variables). Locally, set it in .env.
// =============================================================

import pg from 'pg';

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set — attach the Railway Postgres plugin or set it in .env');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Railway public endpoints require TLS; the internal network does not.
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return pool;
}

// One row per exam submission — pass or fail — so HR has the full
// attempt history. Identity fields come from the verified Entra
// session, never from the client payload.
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS exam_results (
    id               BIGSERIAL PRIMARY KEY,
    entra_oid        TEXT,
    user_name        TEXT        NOT NULL,
    user_email       TEXT        NOT NULL,
    score            INTEGER     NOT NULL,
    total            INTEGER     NOT NULL,
    passed           BOOLEAN     NOT NULL,
    training_version TEXT        NOT NULL,
    exam_answers     JSONB,
    kc_results       JSONB,
    completed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_exam_results_email ON exam_results (user_email);
  CREATE INDEX IF NOT EXISTS idx_exam_results_completed_at ON exam_results (completed_at);
`;

export async function initDb() {
  await getPool().query(SCHEMA);
}

export async function insertResult({ entraOid, userName, userEmail, score, total, passed, trainingVersion, examAnswers, kcResults }) {
  const { rows } = await getPool().query(
    `INSERT INTO exam_results
       (entra_oid, user_name, user_email, score, total, passed, training_version, exam_answers, kc_results)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, completed_at`,
    [entraOid, userName, userEmail, score, total, passed, trainingVersion,
     JSON.stringify(examAnswers ?? null), JSON.stringify(kcResults ?? null)],
  );
  return rows[0];
}

// Every submission, newest first — powers the admin dashboard and
// the Excel export. Excludes the JSONB answer detail (fetch that
// per-row if ever needed); the summary columns are what HR reports on.
export async function listResults() {
  const { rows } = await getPool().query(
    `SELECT id, user_name, user_email, score, total, passed,
            training_version, completed_at
       FROM exam_results
      ORDER BY completed_at DESC
      LIMIT 5000`,
  );
  return rows;
}

// Most recent submissions for a user — used to tell a returning user
// they already have a passing record on file.
export async function latestResultFor(email) {
  const { rows } = await getPool().query(
    `SELECT id, score, total, passed, training_version, completed_at
       FROM exam_results
      WHERE user_email = $1
      ORDER BY completed_at DESC
      LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}
