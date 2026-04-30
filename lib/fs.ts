import {
  mkdir,
  writeTextFile,
  readTextFile,
  remove,
  exists,
  readDir,
  BaseDirectory
} from "@tauri-apps/plugin-fs"
import { join } from "@tauri-apps/api/path"

const BASE = BaseDirectory.AppData

// Create folder
export async function createBaseFolder(fullPath: string) {
  await mkdir(fullPath, {
    recursive: true,})
  }

  const WORKSPACE_DIRS = [
  "prompts",
  "library",
  "templates",
]

 export async function setupWorkspace(basePath: string) {
  for (const dir of WORKSPACE_DIRS) {
    await createBaseFolder(`${basePath}/${dir}`)
  }
}
  
function isSafePath(path: string, basePath: string) {
  return path.startsWith(basePath)
}

//before write and read
// if (!isSafePath(targetPath, basePath)) {
//   throw new Error("Unsafe path")
// }
// this is per file like entries/{promptId}/scratchpad.md
export async function createFolder(folderName: string) {
  await mkdir(folderName, {
    baseDir: BASE,
    recursive: true
  })
}
export async function initFS() {
  await createFolder("entries")
}

// Create file
export async function createFile(folderName: string, fileName: string, content = "") {
  const path = await join(folderName, fileName)

  await writeTextFile(path, content, {
    baseDir: BASE
  })
}

// Read file
export async function readFile(folderName: string, fileName: string) {
  const path = await join(folderName, fileName)

  return await readTextFile(path, {
    baseDir: BASE
  })
}

// Delete folder
export async function deleteFolder(folderName: string) {
  await remove(folderName, {
    baseDir: BASE,
    recursive: true
  })
}

// Check exists
export async function folderExists(folderName: string) {
  return await exists(folderName, {
    baseDir: BASE
  })
}

// List everything
export async function listAll() {
  return await readDir(".", {
    baseDir: BASE
  })
}