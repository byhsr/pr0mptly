import Database from "@tauri-apps/plugin-sql";


let db: Database;
export type DB = typeof db
// ── Migrations ────────────────────────────────────────────────────────────────
// Add new migrations to the END of this array only. Never edit existing ones.
const MIGRATIONS: { id: number; sql: string }[] = [
  {
    id: 1,
    sql: `
    -- ── Library ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS library_assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('persona', 'context', 'file')),
  content TEXT,
  file_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset_chunks (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES library_assets(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding BLOB
);

CREATE INDEX IF NOT EXISTS idx_asset_chunks_asset_id_index
ON asset_chunks(asset_id, chunk_index);

-- ── Templates ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  schema TEXT NOT NULL,
  is_system INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- ── Prompts (container only) ───────────────────────

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT REFERENCES templates(id) ON DELETE SET NULL,
  collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
  current_version_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ── Versions (THIS is the real data) ───────────────

CREATE TABLE IF NOT EXISTS prompt_versions (
  id TEXT PRIMARY KEY,
  prompt_id TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  label TEXT,

  builder_content TEXT,   -- JSON { key: value }

  scratchpad_path TEXT,
  output_path TEXT, -- JSON {text : "", lets  json : "" ,  xml : ""}
  created_at TEXT NOT NULL
);

-- ── Assets mapping ─────────────────────────────────

CREATE TABLE IF NOT EXISTS prompt_assets (
  prompt_id TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES library_assets(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, asset_id)
);

-- ── Collections (folders with nesting) ─────────────

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at TEXT NOT NULL
);


-- ── Quick runs ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS quick_runs (
  id TEXT PRIMARY KEY,
  raw_input TEXT NOT NULL,
  compiled_output TEXT NOT NULL,
  created_at TEXT NOT NULL
);`
  },
  // migration 2 goes here when needed
];

async function runMigrations(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = await db.select<{ id: number }[]>("SELECT id FROM migrations");
  const done = new Set(applied.map((m) => m.id));

  for (const migration of MIGRATIONS) {
    if (done.has(migration.id)) continue;

    await db.execute("BEGIN");

    try {
      await db.execute(migration.sql);

      await db.execute(
        "INSERT INTO migrations (id, applied_at) VALUES (?, ?)",
        [migration.id, new Date().toISOString()]
      );

      await db.execute("COMMIT");
    } catch (e) {
      await db.execute("ROLLBACK");
      throw e;
    }
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
export async function initDB() {
  if (db) return db;
  db = await Database.load("sqlite:app.db");
  await runMigrations(db);
  return db;
}

export function getDB() {
  if (!db) throw new Error("DB not initialized — call initDB() first");
  return db;
}

export async function runTransaction<T>(
  db: any,
  fn: (db: any) => Promise<T>
): Promise<T> {
  await db.execute("BEGIN")

  try {
    const result = await fn(db)
    await db.execute("COMMIT")
    return result
  } catch (err) {
    await db.execute("ROLLBACK").catch(() => {})
    throw err
  }
}