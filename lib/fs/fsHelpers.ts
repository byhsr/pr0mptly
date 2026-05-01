
import { join } from "@tauri-apps/api/path"

 
  export const dirs = {
    prompts: "prompts",
    library: "library",
    templates: "templates",
  } as const


type PromptType = "quick" | "entries"

let BASE: string | null = null

export function initBasePath(path: string) {
  BASE = path
}

function getBasePath() {
  if (!BASE) throw new Error("BASE not initialized")
  return BASE
}

export async function buildFilePath(folder: string, file: string) {
  return await join(folder, file)
}


// this reads basepath/prompts || basepath/library etc

export async function getDir(key: keyof typeof dirs) {
  return await join(getBasePath(), dirs[key])
}


// this reads basepath/prompts/entries || basepath/prompts/quick etc
export async function getPromptTypeDir(type: PromptType) {
  const promptsDir = await getDir("prompts")
  return await join(promptsDir, type)
}

// this reads basepath/prompts/entries/promptId || basepath/prompts/quick/promptId etc
export async function getPrompt(type: PromptType, promptId: string) {
  const typeDir = await getPromptTypeDir(type)
  return await join(typeDir, promptId)
}

// export async function getFolderPath(folder: string) {
//   return await join(getBasePath(), folder)
// }
