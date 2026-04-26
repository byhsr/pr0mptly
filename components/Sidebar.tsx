// components/Sidebar.tsx
import { useState, useEffect } from "react";
import { mkdir, writeTextFile, readDir, BaseDirectory } from "@tauri-apps/plugin-fs";

const BASE = BaseDirectory.AppData;

type FSEntry = {
  name: string;
  isDir: boolean;
  children?: FSEntry[];
};

async function loadTree(): Promise<FSEntry[]> {
  try {
    const entries = await readDir(".", { baseDir: BASE });
    return entries.map((e: any) => ({
      name: e.name,
      isDir: e.isDirectory,
    }));
  } catch {
    return [];
  }
}

export default function Sidebar() {
  const [tree, setTree] = useState<FSEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const refresh = async () => setTree(await loadTree());

  useEffect(() => { refresh(); }, []);

  const handleCreateFolder = async () => {
    const name = prompt("Folder name:");
    if (!name) return;
    await mkdir(name, { baseDir: BASE, recursive: true });
    refresh();
  };

  const handleCreateFile = async () => {
    const name = prompt("File name (e.g. prompt.md):");
    if (!name) return;
    await writeTextFile(name, "", { baseDir: BASE });
    refresh();
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.actions}>
        <button style={styles.btn} onClick={handleCreateFolder}>+ Folder</button>
        <button style={styles.btn} onClick={handleCreateFile}>+ File</button>
      </div>

      <div style={styles.tree}>
        {tree.length === 0 && (
          <span style={styles.empty}>No files yet</span>
        )}
        {tree.map((entry) => (
          <div
            key={entry.name}
            style={{
              ...styles.entry,
              ...(selected === entry.name ? styles.entryActive : {}),
            }}
            onClick={() => setSelected(entry.name)}
          >
            <span style={styles.icon}>{entry.isDir ? "📁" : "📄"}</span>
            <span style={styles.entryName}>{entry.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    height: "100vh",
    background: "#111",
    borderRight: "1px solid #222",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  actions: {
    display: "flex",
    gap: 6,
    padding: "12px 10px",
    borderBottom: "1px solid #222",
  },
  btn: {
    flex: 1,
    background: "#1e1e1e",
    border: "1px solid #2a2a2a",
    color: "#c8f135",
    fontSize: 11,
    padding: "6px 0",
    borderRadius: 5,
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  tree: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    cursor: "pointer",
    borderRadius: 4,
    margin: "1px 6px",
  },
  entryActive: {
    background: "#1e1e1e",
  },
  icon: { fontSize: 13 },
  entryName: {
    fontSize: 12,
    color: "#ccc",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  empty: {
    fontSize: 11,
    color: "#444",
    padding: "12px 14px",
  },
};