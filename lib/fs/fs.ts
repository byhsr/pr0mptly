import {
  mkdir,
  writeTextFile,
  readTextFile,
  remove,
  exists,
  readDir,

} from "@tauri-apps/plugin-fs"
 

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