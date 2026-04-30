"use client"

import { useState, useEffect, useCallback } from "react"

// import { TabBar } from "./promptly/tab-bar"
import { TabBar, Tab } from "./promptly/Tabbar"
// import { Sidebar } from "./promptly/sidebar"
import { Sidebar } from "@/components/promptly/sidebar"
// import { Workspace } from "@/components/promptly/workspace"
import { Workspace } from "./promptly/Workspaces"
import { getCollectionsTree , CollectionTree, createCollection} from "@/services/service.collections"
import { createPrompt } from "@/services/service.prompt"
import { useTabsStore } from "@/hooks/store/TabStore"

const initialOpenFiles = ["cold-email.md", "code-review.md", "blog-post.md"]




const HOME_TAB: Tab = { id: "home", label: "Home", type: "home" }

export default function Promptly({ dbReady }: { dbReady: boolean }) {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    addTab,
    closeTab,
    sidebarOpen,
    setDash,
  } = useTabsStore()

  // ── Local UI state (keep these) ──
  const [collectionsTree, setCollectionsTree] = useState<CollectionTree | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())

  // ── Load tree ──
  const refreshTree = useCallback(async () => {
    try {
      const data = await getCollectionsTree()
      setCollectionsTree(data)
    } catch (err) {
      console.error("Failed to load collections tree:", err)
    }
  }, [])

  useEffect(() => {
    if (!dbReady) return
    refreshTree()
    setDash()
  }, [dbReady])

  // ── Tabs ──
  const openTab = useCallback((tab: Tab) => {
    addTab(tab)
  }, [addTab])

  const markDirty = useCallback((id: string, dirty: boolean) => {
    useTabsStore.setState((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, isDirty: dirty } : t
      ),
    }))
  }, [])

  const activeTab =
    tabs.find((t) => t.id === activeTabId) ?? HOME_TAB

  // ── Create handlers ──
  const handleCreatePrompt = useCallback(
    async (name: string, collectionId: string | null) => {
      try {
        const result = await createPrompt({
          name: name || "untitled",
          collection_id: collectionId,
        })

        await refreshTree()
        setSelectedId(result.id)

        openTab({
          id: result.id,
          label: name || "Untitled Prompt",
          type: "prompt",
        })
      } catch (err) {
        console.error("Failed to create prompt:", err)
      }
    },
    [refreshTree, openTab]
  )

  const handleCreateCollection = useCallback(
    async (name: string, parentId: string | null) => {
      try {
        const { id } = await createCollection(name, parentId)
        await refreshTree()
        setSelectedId(id)
      } catch (err) {
        console.error("Failed to create collection:", err)
      }
    },
    [refreshTree]
  )

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      

      <div className="flex w-full h-full overflow-hidden">
        
        <Sidebar
          activeTab={activeTab}
          isOpen={sidebarOpen}
          collectionsTree={collectionsTree}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          expandedCollections={expandedCollections}
          setExpandedCollections={setExpandedCollections}
          onOpenTab={openTab}
          onCreatePrompt={handleCreatePrompt}
          onCreateCollection={handleCreateCollection}
          onRefreshTree={refreshTree}
        />

        <Workspace
          tabs={tabs}
          activeTab={activeTab}
          onTabSelect={setActiveTab}
          onTabClose={closeTab}
          onMarkDirty={markDirty}
        />
      </div>
    </div>
  )
}

// export default function Promptly({dbReady} : {dbReady : boolean}) {
//   const [sidebarOpen, setSidebarOpen] = useState(true)
//   const [tabs, setTabs] = useState<Tab[]>([])
//   const [activeTabId, setActiveTabId] = useState<string>("home")

//   // ← New: Tree + Sidebar State
//   const [collectionsTree, setCollectionsTree] = useState<CollectionTree | null>(null)
//   const [selectedId, setSelectedId] = useState<string | null>(null)
//   const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())

//   // Load tree on mount + refresh function
//   const refreshTree = useCallback(async () => {
//     try {
//       const data = await getCollectionsTree()
//       await log.info("this is data for collection tree", data)
//       setCollectionsTree(data)
//       log.info("tree set", { rootCount: data.rootPrompts.length })
//     } catch (err) {
//       log.info("failed to refresh")
//       console.error("Failed to load collections tree:", err)
//     }
//   }, [])

//   useEffect(() => {
//     if(!dbReady)return
//     refreshTree()
//   }, [dbReady])

//   // Called by Sidebar when user clicks a prompt
//   const openTab = useCallback((tab: Tab) => {
//     setTabs((prev) => {
//       if (prev.find((t) => t.id === tab.id)) return prev
//       return [...prev, tab]
//     })
//     setActiveTabId(tab.id)
//   }, [])

//   const closeTab = useCallback((id: string) => {
//     if (id === "home") return
//     setTabs((prev) => {
//       const idx = prev.findIndex((t) => t.id === id)
//       const next = prev[idx - 1] ?? prev[idx + 1]
//       const updated = prev.filter((t) => t.id !== id)
//       if (next) setActiveTabId(next.id)
//       return updated
//     })
//   }, [])

//   const markDirty = useCallback((id: string, dirty: boolean) => {
//     setTabs((prev) =>
//       prev.map((t) => (t.id === id ? { ...t, isDirty: dirty } : t))
//     )
//   }, [])

//   // New: Create handlers (will be passed to Sidebar)
//   const handleCreatePrompt = useCallback(async (name: string, collectionId: string | null) => {
//     log.info("data created")
//     try {
//       log.info("calling createPrompt")
//       const result = await createPrompt({ 
//         name: name || "untitled", 
//         collection_id: collectionId 
//       })
      
//       await refreshTree()
//       setSelectedId(result.id)
      
//       // Auto open the newly created prompt
//       openTab({
//         id: result.id,
//         label:name || "Untitled Prompt",
//         type: "prompt"
//       })
//     } catch (err) {
//       console.error("Failed to create prompt:", err)
//     }
//   }, [refreshTree, openTab])

//   const handleCreateCollection = useCallback(async (name : string, parentId: string | null) => {
//     try {
//       const {id} = await createCollection( name, parentId)
//       await refreshTree()
//       setSelectedId(id)
//     } catch (err) {
//       console.error("Failed to create collection:", err)
//     }
//   }, [refreshTree])

//   const activeTab = tabs.find((t) => t.id === activeTabId) ?? HOME_TAB

//   return (
//     <div className="flex flex-col w-screen h-screen overflow-hidden">
//       <TabBar
//         tabs={tabs}
//         activeTabId={activeTabId}
//         onTabSelect={setActiveTabId}
//         onTabClose={closeTab}
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//       />

//       <div className="flex w-full h-full overflow-hidden">
//         <Sidebar
//         activeTab={activeTab}
//           isOpen={sidebarOpen}
//           collectionsTree={collectionsTree}
//           selectedId={selectedId}
//           setSelectedId={setSelectedId}
//           expandedCollections={expandedCollections}
//           setExpandedCollections={setExpandedCollections}
//           onOpenTab={openTab}
//           onCreatePrompt={handleCreatePrompt}
//           onCreateCollection={handleCreateCollection}
//           onRefreshTree={refreshTree}
//         />

//         <Workspace
//           tabs={tabs}
//           activeTab={activeTab}
//           onTabSelect={setActiveTabId}
//           onTabClose={closeTab}
//           onMarkDirty={markDirty}
//         />
//       </div>
//     </div>
//   )
// }

// export default function Promptly() {
//   const [sidebarOpen, setSidebarOpen] = useState(true)
//   const [tabs, setTabs] = useState<Tab[]>([])
//   const [activeTabId, setActiveTabId] = useState<string>("home")

//   // Cmd/Ctrl+B toggles sidebar
//   const handleKeyDown = useCallback((e: KeyboardEvent) => {
//     if ((e.ctrlKey || e.metaKey) && e.key === "b") {
//       e.preventDefault()
//       setSidebarOpen((prev) => !prev)
//     }
//   }, [])

//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown)
//     return () => window.removeEventListener("keydown", handleKeyDown)
//   }, [handleKeyDown])

//   // Called by Sidebar when user clicks a prompt/template/library item
//   const openTab = useCallback((tab: Tab) => {
//     setTabs((prev) => {
//       if (prev.find((t) => t.id === tab.id)) return prev
//       return [...prev, tab]
//     })
//     setActiveTabId(tab.id)
//   }, [])

//   const closeTab = useCallback((id: string) => {
//     if (id === "home") return // home is permanent
//     setTabs((prev) => {
//       const idx = prev.findIndex((t) => t.id === id)
//       const next = prev[idx - 1] ?? prev[idx + 1]
//       const updated = prev.filter((t) => t.id !== id)
//       if (next) setActiveTabId(next.id)
//       return updated
//     })
//   }, [])

//   const markDirty = useCallback((id: string, dirty: boolean) => {
//     setTabs((prev) =>
//       prev.map((t) => (t.id === id ? { ...t, isDirty: dirty } : t))
//     )
//   }, [])

//   const activeTab = tabs.find((t) => t.id === activeTabId) ?? HOME_TAB

//   return (
//     <div className="flex flex-col w-screen h-screen overflow-hidden">
//       {/* ── Tab bar ── */}
//       <TabBar
//         tabs={tabs}
//         activeTabId={activeTabId}
//         onTabSelect={setActiveTabId}
//         onTabClose={closeTab}
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//       />

//       {/* ── Body ── */}
//       <div className="flex w-full h-full overflow-hidden">
//         {/* Left icon sidebar — always rendered, width controlled inside */}
//         <Sidebar
//           isOpen={sidebarOpen}
//           activeTab={activeTab}
//           onOpenTab={openTab}
//         />

//         {/* Main workspace — renders the active tab's view */}
//         <Workspace
//           tabs={tabs}
//           activeTab={activeTab}
//           onTabSelect={setActiveTabId}
//           onTabClose={closeTab}
//           onMarkDirty={markDirty}
//         />
//       </div>
//     </div>
//   )
// }

// export default function Promptly() {
//   const [sidebarOpen, setSidebarOpen] = useState(true)
//   const [openFiles, setOpenFiles] = useState<string[]>(initialOpenFiles)
//   const [activeFile, setActiveFile] = useState<string | null>(initialOpenFiles[0])

//   // Keyboard shortcut for sidebar toggle
//   const handleKeyDown = useCallback((e: KeyboardEvent) => {
//     if ((e.ctrlKey || e.metaKey) && e.key === "b") {
//       e.preventDefault()
//       setSidebarOpen((prev) => !prev)
//     }
//   }, [])

//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown)
//     return () => window.removeEventListener("keydown", handleKeyDown)
//   }, [handleKeyDown])

//   const handleFileSelect = (filename: string) => {
//     if (!openFiles.includes(filename)) {
//       setOpenFiles([...openFiles, filename])
//     }
//     setActiveFile(filename)
//   }

//   const handleTabClose = (filename: string) => {
//     const newOpenFiles = openFiles.filter((f) => f !== filename)
//     setOpenFiles(newOpenFiles)
    
//     if (activeFile === filename) {
//       setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null)
//     }
//   }

//   return (
//     <div className=" flex flex-col w-screen h-screen overflow-hidden">
//       {/* topbar */}
//       <div>
//         <TabBar
//                     sidebarOpen={sidebarOpen}
//                     setSidebarOpen={setSidebarOpen}
//                     openFiles={openFiles}
//                     activeFile={activeFile}
//                     onTabSelect={setActiveFile}
//                     onTabClose={handleTabClose}
//                   />
//   </div> 

//       {/* Main Content */}
//       <div className="flex w-full border h-full overflow-hidden">
//         <div>
//              {/* Sidebar */}
//       <Sidebar
//         isOpen={sidebarOpen}
//         activeFile={activeFile}
//         onFileSelect={handleFileSelect}
//       />
             
//         </div>
//         {/* Workspace */}
//         <Workspace
//           openFiles={openFiles}
//           activeFile={activeFile}
//           onTabSelect={setActiveFile}
//           onTabClose={handleTabClose}
//         />
//       </div>
//     </div>
//   )
// }

export const ToggleSideBarButton = () => {
   
}