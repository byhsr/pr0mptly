import {
  mkdir,
  writeTextFile,
  readTextFile,
  readDir,
  remove,
  exists,
  BaseDirectory
} from "@tauri-apps/plugin-fs"

import { join } from "@tauri-apps/api/path"

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