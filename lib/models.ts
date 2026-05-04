import { join } from "@tauri-apps/api/path"
import { mkdir, writeFile } from "@tauri-apps/plugin-fs"


export async function setupModel(basePath: string, onProgress?: (p: number) => void) {
  const modelDir = await join(basePath, "models", "fastembed")
  const modelPath = await join(modelDir, "model.bin")

  await mkdir(modelDir, { recursive: true })

  // download
  const response = await fetch("MODEL_URL_HERE")

  const total = Number(response.headers.get("content-length") || 0)
  let loaded = 0

  const reader = response.body?.getReader()
  const chunks: Uint8Array[] = []

  if (!reader) throw new Error("No reader")

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    chunks.push(value)
    loaded += value.length

    if (onProgress && total) {
      onProgress(Math.round((loaded / total) * 100))
    }
  }

  // merge chunks
  const blob = new Uint8Array(loaded)
  let offset = 0
  for (const chunk of chunks) {
    blob.set(chunk, offset)
    offset += chunk.length
  }

  await writeFile(modelPath, blob)

  return modelPath
}