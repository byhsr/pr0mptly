"use client"

import { useState, useEffect, useCallback } from "react"
import { PanelLeftClose, PanelLeft } from "lucide-react"
import { TabBar } from "./promptly/tab-bar"
import { Sidebar } from "@/components/promptly/sidebar"
import { Workspace } from "@/components/promptly/workspace"

const initialOpenFiles = ["cold-email.md", "code-review.md", "blog-post.md"]

export default function Promptly() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openFiles, setOpenFiles] = useState<string[]>(initialOpenFiles)
  const [activeFile, setActiveFile] = useState<string | null>(initialOpenFiles[0])

  // Keyboard shortcut for sidebar toggle
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault()
      setSidebarOpen((prev) => !prev)
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const handleFileSelect = (filename: string) => {
    if (!openFiles.includes(filename)) {
      setOpenFiles([...openFiles, filename])
    }
    setActiveFile(filename)
  }

  const handleTabClose = (filename: string) => {
    const newOpenFiles = openFiles.filter((f) => f !== filename)
    setOpenFiles(newOpenFiles)
    
    if (activeFile === filename) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        activeFile={activeFile}
        onFileSelect={handleFileSelect}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div>
         
               <TabBar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    openFiles={openFiles}
                    activeFile={activeFile}
                    onTabSelect={setActiveFile}
                    onTabClose={handleTabClose}
                  />
        </div>
        {/* Workspace */}
        <Workspace
          openFiles={openFiles}
          activeFile={activeFile}
          onTabSelect={setActiveFile}
          onTabClose={handleTabClose}
        />
      </div>
    </div>
  )
}

export const ToggleSideBarButton = () => {
   
}