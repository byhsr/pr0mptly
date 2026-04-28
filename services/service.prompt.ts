import { appDataDir, join } from "@tauri-apps/api/path"
import { createFile, readFile, createFolder, deleteFolder, folderExists, listAll } from "../lib/fs.ts"
import { DB, getDB, runTransaction } from "../lib/db/index.ts"
import { log } from "@/lib/utils.ts"

type CreatePromptInput = {
    name: string
    template_id?: string | null
    collection_id?: string | null

}
type PromptResult = {
    id: string
    name: string
    template_id: string | null
    collection_id: string | null

    version: {
        id: string
        version_number: number
        label: string | null

        builder_content: Record<string, any>

        scratchpad: string
        output: {
            json: any
            text: string
            xml: string
        }
    }
}
type PromptRow = {
    id: string
    name: string
    template_id: string | null
    collection_id: string | null
    current_version_id: string
    created_at: string
    updated_at: string
}
type PromptVersionRow = {
    id: string
    prompt_id: string
    version_number: number
    label: string | null

    builder_content: string | null

    scratchpad_path: string | null
    output_path: string | null
    output_type: string | null

    created_at: string
}
type UpdatePromptInput = {
    promptId: string
    scratchpad?: string
    output?: {
        json?: any
        text?: string
        xml?: string
    }
    builder_content?: Record<string, any>
}

export async function createPrompt({
    name,
    template_id = null,
    collection_id = null
}: CreatePromptInput) {
    const db = await getDB()

    const promptId = crypto.randomUUID()
    const versionId = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    const folder = `entries/${promptId}`
    log.info("inside createPrompt")
    try {
        // FS
        log.info("before folderExists")
        try {
            const fe = await folderExists(folder)
            log.info("folderExists result", { fe })
        } catch (err) {
            log.error("folderExists error", { err: String(err), json: JSON.stringify(err) })
            throw err
        }
        // if (fe) {
        //     await deleteFolder(folder)
        // }

        await createFolder(folder)
        log.info("folder created")
        await createFile(folder, "scratchpad.md", "")
        log.info("scratchpad created")
        await createFile(folder, "output.json", "{}")
        log.info("FS done, starting transaction")
        // DB
        await runTransaction(db, async (tx) => {
            log.info("inside transaction")
            await tx.execute(
                `INSERT INTO prompts (id, name, template_id, collection_id, current_version_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [promptId, name, template_id, collection_id, versionId, createdAt, createdAt]
            )

            await tx.execute(
                `INSERT INTO prompt_versions (
      id, prompt_id, version_number, label,
      builder_content,
      scratchpad_path, output_path, output_type,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    versionId,
                    promptId,
                    1,
                    "v1",
                    "{}",
                    `${folder}/scratchpad.md`,
                    `${folder}/output.json`,
                    "json",
                    createdAt
                ]
            )
        })
        return { id: promptId, version_id: versionId }

    } catch (err) {
        await deleteFolder(folder).catch(() => { })
        throw err
    }
}

export async function getPrompt(promptId: string): Promise<PromptResult | null> {
    const db = await getDB()

    // ---- DB ----
    const promptRows: PromptRow[] = await db.select(
        `SELECT * FROM prompts WHERE id = ? LIMIT 1`,
        [promptId]
    )

    if (!promptRows.length) return null
    const prompt = promptRows[0]

    const versionRows: PromptVersionRow[] = await db.select(
        `SELECT * FROM prompt_versions WHERE id = ? LIMIT 1`,
        [prompt.current_version_id]
    )

    if (!versionRows.length) return null
    const version = versionRows[0]

    // ---- Parse builder ----
    let builderContent = {}
    try {
        builderContent = JSON.parse(version.builder_content || "{}")
    } catch {
        builderContent = {}
    }

    // ---- FS ----
    const folder = `entries/${promptId}`

    let scratchpad = ""
    let output = { text: "", json: {}, xml: "" }

    try {
        scratchpad = await readFile(folder, "scratchpad.md")
    } catch { }

    try {
        const rawOutput = await readFile(folder, "output.json")
        try {
            output = JSON.parse(rawOutput)
        } catch {
            output = { json: {}, text: "", xml: "" }
        }
    } catch { }

    // ---- Return merged ----
    return {
        id: prompt.id,
        name: prompt.name,
        template_id: prompt.template_id,
        collection_id: prompt.collection_id,

        version: {
            id: version.id,
            version_number: version.version_number,
            label: version.label,

            builder_content: builderContent,

            scratchpad,
            output
        }
    }
}


export async function updatePromptContent({
    promptId,
    scratchpad,
    output,
    builder_content
}: UpdatePromptInput) {
    const db = await getDB()

    // ---- get current version ----
    const promptRows = await db.select(
        `SELECT current_version_id FROM prompts WHERE id = ? LIMIT 1`,
        [promptId]
    ) as { current_version_id: string }[]

    if (!promptRows.length) throw new Error("Prompt not found")

    const versionId = promptRows[0].current_version_id

    const versionRows = await db.select(
        `SELECT builder_content, updated_at 
     FROM prompt_versions 
     WHERE id = ? LIMIT 1`,
        [versionId]
    ) as { builder_content: string | null; updated_at: string }[]

    if (!versionRows.length) throw new Error("Version not found")

    const oldUpdatedAt = versionRows[0].updated_at
    const newUpdatedAt = new Date().toISOString()

    const folder = `entries/${promptId}`

    // ---- DB check FIRST (gatekeeper) ----
    if (builder_content) {
        const res = await db.execute(
            `UPDATE prompt_versions 
       SET builder_content = ?, updated_at = ?
       WHERE id = ? AND updated_at = ?`,
            [
                JSON.stringify(builder_content),
                newUpdatedAt,
                versionId,
                oldUpdatedAt
            ]
        )

        if (res.rowsAffected === 0) {
            throw new Error("Conflict: data changed before update")
        }
    }

    // ---- FS updates (only after DB passes) ----

    // scratchpad
    if (typeof scratchpad === "string") {
        await createFile(folder, "scratchpad.md", scratchpad)
    }

    // output (merge-safe)
    if (output) {
        let existing = { json: {}, text: "", xml: "" }

        try {
            const raw = await readFile(folder, "output.json")
            existing = JSON.parse(raw)
        } catch { }

        const merged = {
            json: output.json ?? existing.json,
            text: output.text ?? existing.text,
            xml: output.xml ?? existing.xml
        }

        await createFile(folder, "output.json", JSON.stringify(merged))
    }

    return { ok: true }
}