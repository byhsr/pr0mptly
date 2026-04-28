import {
  mkdir,
  writeTextFile,
  readTextFile,
  remove,
  exists,
  readDir,
  BaseDirectory
} from "@tauri-apps/plugin-fs"

const BASE = BaseDirectory.AppData

// Create folder
export async function createFolder(folderName: string) {
  await mkdir(folderName, {
    baseDir: BASE,
    recursive: true
  })
}

// Create file
export async function createFile(folderName: string, fileName: string, content = "") {
  await writeTextFile(
    `${folderName}/${fileName}`,
    content,
    { baseDir: BASE }
  )
}

// Read file
export async function readFile(folderName: string, fileName: string) {
  return await readTextFile(
    `${folderName}/${fileName}`,
    { baseDir: BASE }
  )
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