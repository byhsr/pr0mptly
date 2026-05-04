import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  FileText,
  Layout,
  BookOpen,
  FolderPlus,
  FilePlus,
  ChevronRight,
  Folder,
  FolderOpen,
  File,
} from "lucide-react"
import { Tab } from "./Tabbar"

import { CollectionTree, CollectionNode } from "@/services/service.collections"
import {InlineInput} from "@/components/Sidebar/SidebarElements"
import { CollectionItem } from "@/components/Sidebar/SidebarElements"
import { PromptFile } from "../Prompt/PromptElements"
import { ViewType } from "@/lib/types/DashTypes"

// const sectionFromTab: Record<ViewType, ViewType | null> = {
//   home: null,
//   prompt: "prompt",
//   template: "template",
//   library: "library",
// }

interface SidebarProps {
  isOpen: boolean
  activeTab: Tab | undefined
  collectionsTree: CollectionTree | null
  selectedId: string | null
  activeView : ViewType
  setSelectedId: (id: string | null) => void
  expandedCollections: Set<string>
  setExpandedCollections: (s: Set<string>) => void
  onOpenTab: (tab: Tab) => void
  onCreatePrompt: (name: string, collectionId: string | null) => Promise<void>
  onCreateCollection: (name: string, parentId: string | null) => Promise<void>
  onRefreshTree: () => Promise<void>
  setActiveView : (view : ViewType ) => void
}

interface RailButtonProps {
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick: () => void
}

export type PendingCreate =
  | { type: "prompt"; parentCollectionId: string | null }
  | { type: "collection"; parentCollectionId: string | null }


function RailButton({ icon: Icon, label, isActive, onClick }: RailButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={"flex items-center justify-center rounded-lg rounded-b-none transition-colors"}
      style={{
        width: 32,
        height: 32,
        // border : isActive ? "1px solid var(--color-accent, #444)" : "1px solid transparent",
        color: isActive ? "var(--color-text, #eee)" : "var(--color-muted, #555)",
        background: isActive ? "var(--color-active, #1a1a1a)" : "transparent",
      }}
    >
      <Icon size={15} />
    </button>
  )
}

export function Sidebar({
  isOpen,
  activeTab,
  collectionsTree,
  selectedId,
  setSelectedId,
  expandedCollections,
  setExpandedCollections,
  onOpenTab,
  onCreatePrompt,
  onCreateCollection,
  onRefreshTree,
  setActiveView,
  activeView
}: SidebarProps) {
  
const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null)

// const activeSection = activeView === "home" ? null : activeView

const panelOpen = isOpen && activeView !== null


// this toggles Section in sidebar 
 function toggleSection(section: ViewType) {
  const newSection = activeView === section ? activeView : section
  setActiveView(newSection)
}
  function toggleExpand(id: string) {
    const next = new Set(expandedCollections)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpandedCollections(next)
  }

  // Given the currently selectedId, figure out which collection to create inside
  function resolveParentCollectionId(): string | null {
    if (!selectedId || !collectionsTree) return null

    // Is the selected a collection?
    const isCollection = (nodes: CollectionNode[]): boolean =>
      nodes.some((n) => n.id === selectedId || isCollection(n.children))

    const findCollection = (nodes: CollectionNode[]): boolean =>
      nodes.some((n) => n.id === selectedId)

    // Walk the tree to find if selectedId is a collection id
    const allCollectionIds = new Set<string>()
    const collectIds = (nodes: CollectionNode[]) => {
      nodes.forEach((n) => {
        allCollectionIds.add(n.id)
        collectIds(n.children)
      })
    }
    collectIds(collectionsTree.tree)

    if (allCollectionIds.has(selectedId)) {
      // selected is a collection → create inside it
      return selectedId
    }

    // selected is a prompt → find its parent collection
    const findPromptParent = (nodes: CollectionNode[]): string | null => {
      for (const node of nodes) {
        if (node.prompts.some((p) => p.id === selectedId)) return node.id
        const found = findPromptParent(node.children)
        if (found) return found
      }
      return null
    }

    return findPromptParent(collectionsTree.tree)
  }

  function startCreate(type: "prompt" | "collection") {
    const parentCollectionId = resolveParentCollectionId()

    // If creating inside a collection, expand it
    if (parentCollectionId) {
      setExpandedCollections(new Set([...expandedCollections, parentCollectionId]))
    }

    setPendingCreate({ type, parentCollectionId })
  }
  let creatingRef = { current: false }

  async function confirmCreate(name: string) {

    if (creatingRef.current) return
    creatingRef.current = true
    try {
      if (!pendingCreate) return
      const { type, parentCollectionId } = pendingCreate
      setPendingCreate(null)

      if (type === "prompt") {
        await onCreatePrompt(name, parentCollectionId)
      } else {
        await onCreateCollection(name, parentCollectionId)
      }
    } catch (err) {

    } finally {
      creatingRef.current = false
    }
  }

  function cancelCreate() {
    setPendingCreate(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-full w-full "
      style={{ borderRight: "1.5px solid var(--color-border, #222)" }}
    >
      {/* Icon rail left view selector  */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 52, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex min-w-full  items-center p-2 gap-2 overflow-hidden "
            style={{
              background: "var(--color-surface, #0d0d0d)",
              // borderRight: "0.5px solid var(--color-border, #222)",
            }}
          >
            {/* panel view bar */}
           <motion.div className="flex gap-2 rounded-lg px-4 items-center pt-2 bg-background w-full">
              <RailButton
              icon={Home}
              label="Home"
              isActive={activeView  === "home"}
              onClick={() => toggleSection("home")}
            />

            <RailButton
              icon={FileText}
              label="Prompts"
              isActive={activeView === "prompt"}
              onClick={() => toggleSection("prompt")}
            />
            <RailButton
              icon={Layout}
              label="Templates"
              isActive={activeView === "template"}
              onClick={() => toggleSection("template")}
            />
            <RailButton
              icon={BookOpen}
              label="Library"
              isActive={activeView === "library"}
              onClick={() => toggleSection("library")}
            />
           </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section panel */}
      
        {panelOpen && (
          <div
            key={activeView}
            className="flex flex-col w-full h-full min-h-0 overflow-y-auto"
            style={{ background: "var(--color-surface, #0d0d0d)" }}
          >
            <div className="flex flex-col h-full w-full ">

              {/* Panel header */}
              <div
             
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: "0.5px solid var(--color-border, #222)" }}
              >
                <div
                 onClick={() => {
                cancelCreate()
                setSelectedId(null)}} 
                  style={{
                    fontSize: 10,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-muted, #666)",
                  }}
                >
                  {activeView}
                </div>

                {/* Only show create buttons for prompts section */}
                {activeView === "prompt" && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startCreate("collection")}
                      className="rounded p-0.5 transition-colors hover:bg-background"
                      style={{ color: "var(--color-muted, #666)" }}
                      title="New Collection"
                    >
                      <FolderPlus size={12} />
                    </button>
                    <button
                      onClick={() => startCreate("prompt")}
                      className="rounded p-0.5 transition-colors hover:bg-background"
                      style={{ color: "var(--color-muted, #666)" }}
                      title="New Prompt"
                    >
                      <FilePlus size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">

                {activeView === "prompt" && collectionsTree && (
                  <>
                    {/* Root prompts */}
                    {collectionsTree.rootPrompts.map((p) => (
                      <PromptFile
                        key={p.id}
                        prompt={p}
                        depth={0}
                        isActive={activeTab ? activeTab.id === p.id : false}
                        isSelected={selectedId === p.id}
                        onSelect={() => setSelectedId(p.id)}
                        onOpenTab={onOpenTab}
                      />
                    ))}

                    {/* Inline input at root */}
                    {pendingCreate && pendingCreate.parentCollectionId === null && (
                      <InlineInput
                        depth={0}
                        onConfirm={confirmCreate}
                        onCancel={cancelCreate}
                      />
                    )}

                    {/* Collection tree */}
                    {collectionsTree.tree.map((node) => (
                      <CollectionItem
                        key={node.id}
                        node={node}
                        depth={0}
                        activeTabId={activeTab ? activeTab.id : null}
                        selectedId={selectedId}
                        expandedCollections={expandedCollections}
                        onToggleExpand={toggleExpand}
                        onSelect={setSelectedId}
                        onOpenTab={onOpenTab}
                        pendingCreate={pendingCreate}
                        onInlineConfirm={confirmCreate}
                        onInlineCancel={cancelCreate}
                      />
                    ))}
                  </>
                )}

                {activeView === "prompt" && !collectionsTree && (
                  <span style={{ fontSize: 11, color: "var(--color-muted, #555)", padding: "4px 8px" }}>
                    Loading...
                  </span>
                )}

                {/* Templates + Library — wire up when ready */}
                {activeView === "template" && (
                  <span style={{ fontSize: 11, color: "var(--color-muted, #555)", padding: "4px 8px" }}>
                    Templates coming soon
                  </span>
                )}
                {activeView === "library" && (
                  <span style={{ fontSize: 11, color: "var(--color-muted, #555)", padding: "4px 8px" }}>
                    Library coming soon
                  </span>
                )}

              </div>
            </div>
          </div>
        )}
 
    </div>
  )
}