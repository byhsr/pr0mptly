// lib/fs.ts
import { writeTextFile, readTextFile, mkdir, readDir, BaseDirectory } from "@tauri-apps/plugin-fs";

const BASE = BaseDirectory.AppData;

// Create a folder
export async function createFolder(folderName: string) {
  await mkdir(folderName, { baseDir: BASE, recursive: true });
}

// Create a file inside a folder
export async function createFile(folderName: string, fileName: string, content = "") {
  await writeTextFile(`${folderName}/${fileName}`, content, { baseDir: BASE });
}

// Read a file
export async function readFile(folderName: string, fileName: string) {
  return await readTextFile(`${folderName}/${fileName}`, { baseDir: BASE });
}

// List all folders + files
export async function listAll() {
  return await readDir(".", { baseDir: BASE});
}