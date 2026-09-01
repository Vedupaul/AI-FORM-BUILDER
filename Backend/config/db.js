import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL && (env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1'))
        ? false
        : (env.DATABASE_URL ? { rejectUnauthorized: false } : false)
});

export async function query(text, params) {
    return pool.query(text, params);
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

async function migrate() {
    await query(`
    CREATE TABLE IF NOT EXISTS users (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email         varchar(255)               UNIQUE NOT NULL,
      password_hash varchar(255)               NOT NULL,
      name          varchar(255)               NOT NULL,
      avatar_color  varchar(50)                DEFAULT '#6366f1',
      created_at    timestamptz                NOT NULL DEFAULT now(),
      updated_at    timestamptz                NOT NULL DEFAULT now()
    );
  `);

    await query(`
    CREATE TABLE IF NOT EXISTS forms (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner           uuid                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title           varchar(255)        NOT NULL,
      description     text                NOT NULL DEFAULT '',
      slug            varchar(100)        UNIQUE NOT NULL,
      status          varchar(20)         NOT NULL DEFAULT 'draft',
      theme           varchar(50)         NOT NULL DEFAULT 'default',
      questions       jsonb               NOT NULL DEFAULT '[]'::jsonb,
      settings        jsonb               NOT NULL DEFAULT '{}'::jsonb,
      views_count     integer             NOT NULL DEFAULT 0,
      responses_count integer             NOT NULL DEFAULT 0,
      is_favorite     boolean             NOT NULL DEFAULT false,
      is_archived     boolean             NOT NULL DEFAULT false,
      published_at    timestamptz,
      created_at      timestamptz         NOT NULL DEFAULT now(),
      updated_at      timestamptz         NOT NULL DEFAULT now()
    );
  `);

    await query(`
    CREATE TABLE IF NOT EXISTS responses (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      form            uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      answers jsonb           NOT NULL DEFAULT '[]'::jsonb,
      completion_time integer NOT NULL DEFAULT 0,
      meta jsonb          NOT NULL DEFAULT '{}'::jsonb,
      submitted_at timestamptz NOT NULL DEFAULT now()
    );
  `);

    await query('CREATE INDEX IF NOT EXISTS idx_forms_owner ON forms(owner, is_archived, updated_at DESC);');
    await query('CREATE INDEX IF NOT EXISTS idx_responses_form ON responses(form, submitted_at DESC);');
}

export async function connectDB() {
    try {
        const { rows } = await query("SELECT current_database() AS db");
        console.log(`Postgres connected: ${rows[0].db}`);
        await migrate();
        console.log("Schema ready");
    } catch (error) {
        console.error("Postgres connection error:", error.message);
        process.exit(1);
    }
}