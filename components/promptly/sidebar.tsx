import { useState, useRef, useEffect } from "react"
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
import { Tab, TabType } from "./Tabbar"
import { log } from "@/lib/utils"
import { CollectionTree, CollectionNode, PromptRow } from "@/services/service.collections"
// import type { CollectionTree, CollectionNode, PromptRow } from "@/db/queries" // adjust to your path

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId = "prompts" | "templates" | "library"

const sectionFromTab: Record<TabType, SectionId | null> = {
  home: null,
  prompt: "prompts",
  template: "templates",
  library: "library",
}

interface SidebarProps {
  isOpen: boolean
  activeTab: Tab
  collectionsTree: CollectionTree | null
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  expandedCollections: Set<string>
  setExpandedCollections: (s: Set<string>) => void
  onOpenTab: (tab: Tab) => void
  onCreatePrompt: (name: string, collectionId: string | null) => Promise<void>
  onCreateCollection: (name: string, parentId: string | null) => Promise<void>
  onRefreshTree: () => Promise<void>
}

// ─── Inline Input ─────────────────────────────────────────────────────────────

interface InlineInputProps {
  depth?: number
  onConfirm: (name: string) => void
  onCancel: () => void
}

function InlineInput({ depth = 0, onConfirm, onCancel }: InlineInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div style={{ paddingLeft: 8 + depth * 12 }}>
      <input
        ref={ref}
        placeholder="Name..."
        onKeyDown={(e) => {
          console.log("key pressed", e.key)  // ← see if this fires
          if (e.key === "Enter") {
            const val = ref.current?.value.trim()
            console.log("Enter pressed, val:", val)
            if (val) onConfirm(val)
            else onCancel()
          }
          if (e.key === "Escape") onCancel()
        }}
        style={{
          background: "transparent",
          border: "none",
          outline: "1px solid var(--color-accent, #444)",
          borderRadius: 4,
          color: "var(--color-text, #eee)",
          fontSize: 12,
          fontFamily: "inherit",
          padding: "1px 4px",
          width: "100%",
        }}
      />
    </div>
  )
}

// ─── Prompt Item ──────────────────────────────────────────────────────────────

interface PromptItemProps {
  prompt: PromptRow
  depth?: number
  isActive: boolean
  isSelected: boolean
  onSelect: () => void
  onOpenTab: (tab: Tab) => void
}

function PromptItem({ prompt, depth = 0, isActive, isSelected, onSelect, onOpenTab }: PromptItemProps) {
  return (
    <div
      onClick={() => {
        onSelect()
        onOpenTab({ id: prompt.id, label: prompt.name, type: "prompt" })
      }}
      className="flex items-center gap-1.5 rounded cursor-pointer select-none"
      style={{
        paddingLeft: 8 + depth * 12,
        paddingTop: 3,
        paddingBottom: 3,
        paddingRight: 6,
        fontSize: 12,
        color: isActive
          ? "var(--color-text, #eee)"
          : "var(--color-muted, #888)",
        background: isSelected
          ? "var(--color-selection, #1e1e1e)"
          : isActive
          ? "var(--color-active, #1a1a1a)"
          : "transparent",
        borderRadius: 4,
        transition: "background 0.1s",
      }}
    >
      <File size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: isActive ? 500 : 400,
        }}
      >
        {prompt.name}
      </span>
    </div>
  )
}

// ─── Collection Node ──────────────────────────────────────────────────────────

interface CollectionItemProps {
  node: CollectionNode
  depth?: number
  activeTabId: string
  selectedId: string | null
  expandedCollections: Set<string>
  onToggleExpand: (id: string) => void
  onSelect: (id: string) => void
  onOpenTab: (tab: Tab) => void
  // inline creation state passed down
  pendingCreate: PendingCreate | null
  onInlineConfirm: (name: string) => void
  onInlineCancel: () => void
}

function CollectionItem({
  node,
  depth = 0,
  activeTabId,
  selectedId,
  expandedCollections,
  onToggleExpand,
  onSelect,
  onOpenTab,
  pendingCreate,
  onInlineConfirm,
  onInlineCancel,
}: CollectionItemProps) {
  const isExpanded = expandedCollections.has(node.id)
  const isSelected = selectedId === node.id

  return (
    <div>
      {/* Collection row */}
      <div
        onClick={() => {
          onSelect(node.id)
          onToggleExpand(node.id)
        }}
        className="flex items-center gap-1.5 rounded cursor-pointer select-none"
        style={{
          paddingLeft: 8 + depth * 12,
          paddingTop: 3,
          paddingBottom: 3,
          paddingRight: 6,
          fontSize: 12,
          color: isSelected ? "var(--color-text, #eee)" : "var(--color-muted, #777)",
          background: isSelected ? "var(--color-selection, #1e1e1e)" : "transparent",
          borderRadius: 4,
          transition: "background 0.1s",
        }}
      >
        <ChevronRight
          size={10}
          style={{
            flexShrink: 0,
            transition: "transform 0.15s",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            opacity: 0.5,
          }}
        />
        {isExpanded ? (
          <FolderOpen size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
        ) : (
          <Folder size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
        )}
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        >
          {node.name}
        </span>
      </div>

      {/* Children (only when expanded) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {/* Nested collections */}
            {node.children.map((child) => (
              <CollectionItem
                key={child.id}
                node={child}
                depth={depth + 1}
                activeTabId={activeTabId}
                selectedId={selectedId}
                expandedCollections={expandedCollections}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
                onOpenTab={onOpenTab}
                pendingCreate={pendingCreate}
                onInlineConfirm={onInlineConfirm}
                onInlineCancel={onInlineCancel}
              />
            ))}

            {/* Prompts in this collection */}
            {node.prompts.map((p) => (
              <PromptItem
                key={p.id}
                prompt={p}
                depth={depth + 1}
                isActive={activeTabId === p.id}
                isSelected={selectedId === p.id}
                onSelect={() => onSelect(p.id)}
                onOpenTab={onOpenTab}
              />
            ))}

            {/* Inline input inside this collection */}
            {pendingCreate && pendingCreate.parentCollectionId === node.id && (
              <InlineInput
                depth={depth + 1}
                onConfirm={onInlineConfirm}
                onCancel={onInlineCancel}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Rail Button ──────────────────────────────────────────────────────────────

interface RailButtonProps {
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick: () => void
}

function RailButton({ icon: Icon, label, isActive, onClick }: RailButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center justify-center rounded-lg transition-colors"
      style={{
        width: 32,
        height: 32,
        color: isActive ? "var(--color-text, #eee)" : "var(--color-muted, #555)",
        background: isActive ? "var(--color-active, #1a1a1a)" : "transparent",
      }}
    >
      <Icon size={15} />
    </button>
  )
}

// ─── Pending Create State ─────────────────────────────────────────────────────

type PendingCreate =
  | { type: "prompt"; parentCollectionId: string | null }
  | { type: "collection"; parentCollectionId: string | null }

// ─── Sidebar ──────────────────────────────────────────────────────────────────

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
}: SidebarProps) {
  const [manualSection, setManualSection] = useState<SectionId | null>("prompts")
  const [manualOverride, setManualOverride] = useState(false)
  const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null)

  const derivedSection = sectionFromTab[activeTab?.type] ?? null
  const activeSection = manualOverride ? manualSection : (derivedSection ?? manualSection)
  const panelOpen = isOpen && activeSection !== null

  useEffect(() => {
    setManualOverride(false)
  }, [activeTab?.id])

  // ── Helpers ──────────────────────────────────────────────────────────────

  function toggleSection(section: SectionId) {
    setManualSection((prev) => (prev === section ? null : section))
    setManualOverride(true)
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

  async function confirmCreate(name: string) {

  log.info("start confirm create key pressed", {name, pendingCreate})
    if (!pendingCreate) return
    const { type, parentCollectionId } = pendingCreate
    setPendingCreate(null)
    
  log.info("mid", {name, pendingCreate})
 
    try {
      if (type === "prompt") {
        log.info("callimng create prompt")
        await onCreatePrompt(name, parentCollectionId)
      } else {
        await onCreateCollection(name, parentCollectionId)
      }
      log.info("Creating prompt", { name,parentCollectionId })
      await onRefreshTree()
    } catch (err) {
      log.info("creation failed", err)
    }
  }

  function cancelCreate() {
    setPendingCreate(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex h-full flex-shrink-0"
      style={{ borderRight: "0.5px solid var(--color-border, #222)" }}
    >
      {/* Icon rail left view selector  */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 52, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col items-center py-2 gap-1 overflow-hidden flex-shrink-0"
            style={{
              background: "var(--color-surface, #0d0d0d)",
              borderRight: "0.5px solid var(--color-border, #222)",
            }}
          >
            <RailButton
              icon={Home}
              label="Home"
              isActive={activeTab.type === "home"}
              onClick={() => onOpenTab({ id: "home", label: "Home", type: "home" })}
            />

            <div
              style={{
                width: 24,
                height: 0.5,
                background: "var(--color-border, #222)",
                margin: "4px 0",
              }}
            />

            <RailButton
              icon={FileText}
              label="Prompts"
              isActive={activeSection === "prompts"}
              onClick={() => toggleSection("prompts")}
            />
            <RailButton
              icon={Layout}
              label="Templates"
              isActive={activeSection === "templates"}
              onClick={() => toggleSection("templates")}
            />
            <RailButton
              icon={BookOpen}
              label="Library"
              isActive={activeSection === "library"}
              onClick={() => toggleSection("library")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section panel */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key={activeSection}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col h-full overflow-hidden flex-shrink-0"
            style={{ background: "var(--color-surface, #0d0d0d)" }}
          >
            <div className="flex flex-col h-full w-[180px]">

              {/* Panel header */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: "0.5px solid var(--color-border, #222)" }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-muted, #666)",
                  }}
                >
                  {activeSection}
                </span>

                {/* Only show create buttons for prompts section */}
                {activeSection === "prompts" && (
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

                {activeSection === "prompts" && collectionsTree && (
                  <>
                    {/* Root prompts */}
                    {collectionsTree.rootPrompts.map((p) => (
                      <PromptItem
                        key={p.id}
                        prompt={p}
                        depth={0}
                        isActive={activeTab.id === p.id}
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
                        activeTabId={activeTab.id}
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

                {activeSection === "prompts" && !collectionsTree && (
                  <span style={{ fontSize: 11, color: "var(--color-muted, #555)", padding: "4px 8px" }}>
                    Loading...
                  </span>
                )}

                {/* Templates + Library — wire up when ready */}
                {activeSection === "templates" && (
                  <span style={{ fontSize: 11, color: "var(--color-muted, #555)", padding: "4px 8px" }}>
                    Templates coming soon
                  </span>
                )}
                {activeSection === "library" && (
                  <span style={{ fontSize: 11, color: "var(--color-muted, #555)", padding: "4px 8px" }}>
                    Library coming soon
                  </span>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}