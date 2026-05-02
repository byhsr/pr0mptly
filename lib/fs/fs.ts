import {
  mkdir,
  writeTextFile,
  readTextFile,
  remove,
  exists,
  readDir,

} from "@tauri-apps/plugin-fs"
import { appDataDir, join } from "@tauri-apps/api/path" 

import { buildFilePath } from "./fsHelpers"

// Create folder
export async function createBaseFolder(fullPath: string) {
  await mkdir(fullPath, {
    recursive: true,})
  }


 export const _DIRS = [
  "prompts",
  "library",
  "templates",
]

 export async function setupWorkspace(basePath: string) {
 await Promise.all(
  _DIRS.map(dir =>
    createBaseFolder(`${basePath}/${dir}`)
  )
)
}

export async function createFolder(folderName: string) {
  await mkdir(folderName, {
    recursive: true
  })
}

// Create file
export async function createFile(filePath : string, content = "") {
  await writeTextFile(filePath , content)
}

// Read file
export async function readFile(folderName: string, fileName: string) {
  const filePath = await buildFilePath(folderName, fileName)
  return await readTextFile(filePath)
}

// Delete folder
export async function deleteFolder(folderName: string) {

  await remove(folderName, {
    recursive: true
  })
}

// Check exists
export async function folderExists(folderName: string) {
  return await exists(folderName)
}

// List everything
export async function listAll(folder: string) {
  return await readDir(folder)

}


export async function readConfig() {
  try {
    const dir = await appDataDir()
    const configPath = await join(dir, "config.json")

    const fileExists = await exists(configPath)
    if (!fileExists) return null

    const content = await readTextFile(configPath)
    return JSON.parse(content)

  } catch (err) {
    console.error("readConfig error:", err)
    return null
  }
}

export async function writeConfig(config : {base_path : string}) {
  const dir = await appDataDir()
  const configPath = await join(dir, "config.json")

  // ensure dir exists (usually already does, but safe)
  await mkdir(dir, { recursive: true })

  await writeTextFile(configPath, JSON.stringify(config, null, 2))
}