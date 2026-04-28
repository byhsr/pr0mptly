import { getDB } from "../lib/db"

export type CollectionRow = {
  id: string
  name: string
  parent_id: string | null
}

export type PromptRow = {
  id: string
  name: string
  collection_id: string | null
}

export type CollectionNode = {
  id: string
  name: string
  children: CollectionNode[]
  prompts: PromptRow[]
}

export type CollectionTree = {
  tree: CollectionNode[]
  rootPrompts: PromptRow[]
}

export async function createCollection(
  name: string,
  parent_id: string | null = null
): Promise<{ id: string }> {
  const db = await getDB()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  if (!name.trim()) {
    throw new Error("Collection name required")
  }

  await db.execute(
    `INSERT INTO collections (id, name, parent_id, created_at)
     VALUES (?, ?, ?, ?)`,
    [id, name, parent_id, now]
  )

  return { id }
}

export async function getCollectionsTree(): Promise<CollectionTree> {
  const db = await getDB()

  // ---- fetch all ----
  const collections = await db.select(
    `SELECT id, name, parent_id FROM collections`
  ) as CollectionRow[]

  const prompts = await db.select(
    `SELECT id, name, collection_id FROM prompts`
  ) as PromptRow[]

  // ---- maps ----

  // parent_id -> collections[]
  const collectionMap = new Map<string | null, CollectionRow[]>()

  for (const col of collections) {
    const key = col.parent_id ?? null
    if (!collectionMap.has(key)) {
      collectionMap.set(key, [])
    }
    collectionMap.get(key)!.push(col)
  }

  // collection_id -> prompts[]
  const promptMap = new Map<string | null, PromptRow[]>()

  for (const p of prompts) {
    const key = p.collection_id ?? null
    if (!promptMap.has(key)) {
      promptMap.set(key, [])
    }
    promptMap.get(key)!.push(p)
  }

  // ---- recursive builder ----
  function build(parentId: string | null): CollectionNode[] {
    const cols = collectionMap.get(parentId) || []

    return cols.map((col) => ({
      id: col.id,
      name: col.name,
      children: build(col.id),
      prompts: promptMap.get(col.id) || []
    }))
  }

  // ---- root ----
  const tree = build(null)

  // optional: root-level prompts (no collection)
  const rootPrompts = promptMap.get(null) || []

  // if you want them as a pseudo-root node:
  if (rootPrompts.length) {
    tree.unshift({
      id: "root",
      name: "Uncategorized",
      children: [],
      prompts: rootPrompts
    })
  }

 return {
  tree: build(null),
  rootPrompts: promptMap.get(null) || []
}
}