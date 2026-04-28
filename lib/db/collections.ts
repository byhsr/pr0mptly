import { getDB , initDB} from "./index";

export interface Collection {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface CollectionNode extends Collection {
  children: CollectionNode[];
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCollection(
  id: string,
  name: string,
  parent_id: string | null = null
): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO collections (id, name, parent_id, created_at) VALUES ($1, $2, $3, $4)`,
    [id, name, parent_id, now]
  );
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getCollectionsTree(): Promise<CollectionNode[]> {
  const db = getDB();
  const rows = await db.select<Collection[]>(
    `SELECT * FROM collections ORDER BY created_at ASC`
  );

  // Build a map of id → node
  const map = new Map<string, CollectionNode>();
  for (const row of rows) {
    map.set(row.id, { ...row, children: [] });
  }

  // Attach children to parents, collect roots
  const roots: CollectionNode[] = [];
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCollection(id: string): Promise<void> {
  const db = getDB();
  // Prompts inside are NOT deleted — collection_id just becomes NULL (ON DELETE SET NULL)
  await db.execute(`DELETE FROM collections WHERE id = $1`, [id]);
}