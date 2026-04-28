import { getDB } from "./index";

export interface Prompt {
  id: string;
  name: string;
  template_id: string | null;
  collection_id: string | null;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  label: string | null;
  builder_content: string | null; // JSON string
  scratchpad_path: string | null;
  output_path: string | null;
  output_type: string | null;
  created_at: string;
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export async function createPromptRow(
  id: string,
  name: string,
  template_id: string | null = null,
  collection_id: string | null = null
): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO prompts (id, name, template_id, collection_id, current_version_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NULL, $5, $6)`,
    [id, name, template_id, collection_id, now, now]
  );
}

export async function updateCurrentVersion(
  prompt_id: string,
  version_id: string
): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE prompts SET current_version_id = $1, updated_at = $2 WHERE id = $3`,
    [version_id, now, prompt_id]
  );
}

export async function getPromptById(id: string): Promise<Prompt> {
  const db = getDB();
  const rows = await db.select<Prompt[]>(
    `SELECT * FROM prompts WHERE id = $1`,
    [id]
  );
  if (!rows.length) throw new Error(`Prompt not found: ${id}`);
  return rows[0];
}

// ─── Versions ─────────────────────────────────────────────────────────────────

export async function createPromptVersion(
  id: string,
  prompt_id: string,
  scratchpad_path: string,
  output_path: string
): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO prompt_versions (id, prompt_id, version_number, label, builder_content, scratchpad_path, output_path, output_type, created_at)
     VALUES ($1, $2, 1, 'v1', NULL, $3, $4, 'text', $5)`,
    [id, prompt_id, scratchpad_path, output_path, now]
  );
}

export async function updateVersionPaths(
  version_id: string,
  scratchpad_path: string,
  output_path: string
): Promise<void> {
  const db = getDB();

  await db.execute(
    `UPDATE prompt_versions SET scratchpad_path = $1, output_path = $2 WHERE id = $3`,
    [scratchpad_path, output_path, version_id]
  );
}