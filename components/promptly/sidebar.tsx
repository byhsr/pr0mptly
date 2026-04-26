"use client"

import { motion, AnimatePresence } from "motion/react"
import { ChevronRight, ChevronDown, File, Folder, Plus, FolderPlus } from "lucide-react"
import { useState } from "react"

interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
}

const mockFileTree: FileNode[] = [
  {
    name: "work",
    type: "folder",
    children: [
      { name: "cold-email.md", type: "file" },
      { name: "code-review.md", type: "file" },
    ],
  },
  {
    name: "personal",
    type: "folder",
    children: [
      { name: "blog-post.md", type: "file" },
      { name: "youtube-script.md", type: "file" },
    ],
  },
  {
    name: "templates",
    type: "folder",
    children: [
      { name: "cot-base.md", type: "file" },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  activeFile: string | null
  onFileSelect: (filename: string) => void
}

interface TreeNodeProps {
  node: FileNode
  depth: number
  activeFile: string | null
  onFileSelect: (filename: string) => void
}

function TreeNode({ node, depth, activeFile, onFileSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/80 hover:bg-surface transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted" />
          )}
          <Folder className="h-4 w-4 text-muted" />
          <span>{node.name}</span>
        </button>
        <AnimatePresence>
          {isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {node.children.map((child) => (
                <TreeNode
                  key={child.name}
                  node={child}
                  depth={depth + 1}
                  activeFile={activeFile}
                  onFileSelect={onFileSelect}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const isActive = activeFile === node.name

  return (
    <button
      onClick={() => onFileSelect(node.name)}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-foreground/80 hover:bg-surface"
      }`}
      style={{ paddingLeft: `${depth * 12 + 28}px` }}
    >
      <File className="h-4 w-4" />
      <span>{node.name}</span>
    </button>
  )
}

export function Sidebar({ isOpen, activeFile, onFileSelect }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 220 : 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full overflow-hidden border-r border-border bg-surface flex-shrink-0"
    >
      <div className="flex h-full w-[220px] flex-col">
        {/* Actions */}
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <button className="flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-border transition-colors">
            <Plus className="h-3.5 w-3.5" />
            File
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-border transition-colors">
            <FolderPlus className="h-3.5 w-3.5" />
            Folder
          </button>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {mockFileTree.map((node) => (
            <TreeNode
              key={node.name}
              node={node}
              depth={0}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      </div>
    </motion.aside>
  )
}
