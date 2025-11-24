import { Pool } from "pg";

type RawCompanyRow = {
  id: number | string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

export type CompanyRecord = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const connectionString =
    process.env.ACCOUNTS_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Accounts DB: ACCOUNTS_DATABASE_URL or DATABASE_URL env var is not set."
    );
  }

  const globalAny = global as any;
  if (!globalAny.__gaiaAccountsPool) {
    globalAny.__gaiaAccountsPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }

  pool = globalAny.__gaiaAccountsPool as Pool;
  return pool;
}

/**
 * Expose the shared Accounts pool so other modules (imports, etc.)
 * can talk to the same database.
 */
export function getAccountsPool(): Pool {
  return getPool();
}

export async function getCompanies(): Promise<CompanyRecord[]> {
  const client = getPool();
  const result = await client.query<RawCompanyRow>(
    `SELECT id, name, slug, is_active, created_at
     FROM companies
     ORDER BY name ASC`
  );

  return result.rows.map((row) => ({
    id: typeof row.id === "string" ? parseInt(row.id, 10) : (row.id as number),
    name: row.name,
    slug: row.slug,
    is_active: row.is_active,
    created_at: row.created_at,
  }));
}

function slugifyName(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const trimmed = base.replace(/^-+|-+$/g, "");
  return trimmed || "company";
}

export async function createCompany(name: string): Promise<CompanyRecord> {
  const client = getPool();
  const baseSlug = slugifyName(name);
  let slug = baseSlug;
  let attempt = 1;

  // Ensure slug is unique
  while (true) {
    const check = await client.query(
      "SELECT 1 FROM companies WHERE slug = $1 LIMIT 1",
      [slug]
    );
    if (check.rowCount === 0) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const result = await client.query<RawCompanyRow>(
    `INSERT INTO companies (name, slug)
     VALUES ($1, $2)
     RETURNING id, name, slug, is_active, created_at`,
    [name, slug]
  );

  const row = result.rows[0];

  return {
    id: typeof row.id === "string" ? parseInt(row.id, 10) : (row.id as number),
    name: row.name,
    slug: row.slug,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

/**
 * Simple import job logging so that even before we parse Excel/CSV,
 * we at least record that a file was uploaded for a given company + target.
 *
 * This creates an `import_jobs` table on first use if it doesn't exist.
 */
export async function logImportJob(params: {
  companyId: number;
  target: string;
  originalFilename: string;
}): Promise<{ id: number }> {
  const client = getPool();

  // Create table lazily if needed
  await client.query(`
    CREATE TABLE IF NOT EXISTS import_jobs (
      id                BIGSERIAL PRIMARY KEY,
      company_id        BIGINT NOT NULL,
      target            TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'UPLOADED',
      rows_imported     INTEGER,
      error_message     TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at       TIMESTAMPTZ
    );
  `);

  const result = await client.query<{ id: number }>(
    `INSERT INTO import_jobs (company_id, target, original_filename)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [params.companyId, params.target, params.originalFilename]
  );

  return { id: result.rows[0].id };
}
