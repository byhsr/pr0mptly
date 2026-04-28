import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, FileText, Layout, BookOpen, Plus, FolderPlus , FilePlus } from "lucide-react"
import { Tab } from "./Tabbar"


// ── Types ─────────────────────────────────────────────────────────────────────
type SectionId = "prompts" | "templates" | "library"



// const sectionFromTab: Record<string, SectionId | null> = {
//   home: null,
//   prompt: "prompts",
//   template: "templates",
//   library: "library",
// };

interface SidebarProps {
  isOpen: boolean
  activeTab: Tab
  onOpenTab: (tab: Tab) => void
}

// ── Icon rail button ──────────────────────────────────────────────────────────
function RailButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex flex-col items-center justify-center rounded-xl transition-all"
      style={{
        width: 40,
        height: 40,
        background: isActive ? "var(--color-background, #111)" : "transparent",
        color: isActive ? "#c8f135" : "var(--color-muted, #666)",
        border: isActive ? "0.5px solid rgba(200,241,53,0.25)" : "0.5px solid transparent",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
    </button>
  )
}

// ── Section item (prompt / template / library entry) ─────────────────────────
function SectionItem({
  id,
  name,
  type,
  isActive,
  onOpenTab,
}: {
  id: string
  name: string
  type: Tab["type"]
  isActive: boolean
  onOpenTab: (tab: Tab) => void
}) {
  const dotColor: Record<string, string> = {
    prompt: "#c8f135",
    template: "#6ee7f7",
    library: "#a78bfa",
  }

  return (
    <button
      onClick={() => onOpenTab({ id, label: name, type })}
      className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left transition-all"
      style={{
        fontSize: 12,
        fontFamily: "'Syne', sans-serif",
        background: isActive ? "var(--color-background, #111)" : "transparent",
        color: isActive
          ? "var(--color-foreground, #fff)"
          : "var(--color-muted, #666)",
        border: isActive ? "0.5px solid var(--color-border, #222)" : "0.5px solid transparent",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: dotColor[type] ?? "#666",
          flexShrink: 0,
          opacity: isActive ? 1 : 0.5,
        }}
      />
      <span className="truncate">{name}</span>
    </button>
  )
}

  const sectionFromTab: Record<Tab["type"], SectionId | null> = {
    home: null,
    prompt: "prompts",
    template: "templates",
    library: "library",
  }

// ── Main Sidebar ──────────────────────────────────────────────────────────────


// import type { CollectionTree, CollectionNode, PromptRow } from '@/services/service.collections'; 


interface SidebarProps {
  isOpen: boolean;
  activeTab: Tab;
  onOpenTab: (tab: Tab) => void;

  // New props from Promptly
  collectionsTree: CollectionTree | null;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  expandedCollections: Set<string>;
  setExpandedCollections: React.Dispatch<React.SetStateAction<Set<string>>>;
  onCreatePrompt: (collectionId: string | null) => Promise<void>;
  onCreateCollection: (parentId: string | null) => Promise<void>;
  onRefreshTree?: () => Promise<void>;
}



interface SidebarProps {
  isOpen: boolean;
  activeTab: Tab;
  onOpenTab: (tab: Tab) => void;

  // Tree & State from Promptly
  collectionsTree: CollectionTree | null;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  expandedCollections: Set<string>;
  setExpandedCollections: React.Dispatch<React.SetStateAction<Set<string>>>;
  onCreatePrompt: (collectionId: string | null) => Promise<void>;
  onCreateCollection: (parentId: string | null) => Promise<void>;
}

export function Sidebar({
  isOpen,
  activeTab,
  onOpenTab,
  collectionsTree,
  selectedId,
  setSelectedId,
  expandedCollections,
  setExpandedCollections,
  onCreatePrompt,
  onCreateCollection,
}: SidebarProps) {
  
  const [manualSection, setManualSection] = useState<SectionId | null>("prompts");
  const [manualOverride, setManualOverride] = useState(false);
  const [creatingItem, setCreatingItem] = useState<{ type: 'prompt' | 'collection'; parentId: string | null } | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const derivedSection = sectionFromTab[activeTab?.type] ?? null;
  const activeSection = manualOverride ? manualSection : (derivedSection ?? manualSection);

  const panelOpen = isOpen && activeSection !== null;

  useEffect(() => {
    setManualOverride(false);
  }, [activeTab?.id]);

  const toggleSection = (section: SectionId) => {
    setManualSection((prev) => (prev === section ? null : section));
    setManualOverride(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // VS Code-style creation logic
  const handleNewPrompt = () => {
    let parentId: string | null = null;

    if (selectedId && collectionsTree) {
      // Check if selectedId is a prompt
      const isPromptSelected = 
        collectionsTree.rootPrompts.some(p => p.id === selectedId) ||
        collectionsTree.tree.some(c => hasPrompt(c, selectedId));

      if (isPromptSelected) {
        parentId = findParentCollectionId(selectedId, collectionsTree);
      } else {
        // Selected item is a collection → create inside it
        parentId = selectedId;
      }
    }

    setCreatingItem({ type: 'prompt', parentId });
    setNewItemName('Untitled Prompt');
  };

  const handleNewCollection = () => {
    let parentId: string | null = null;
    if (selectedId && collectionsTree) {
      const isCollectionSelected = collectionsTree.tree.some(c => 
        c.id === selectedId || hasCollection(c, selectedId)
      );
      if (isCollectionSelected) parentId = selectedId;
    }

    setCreatingItem({ type: 'collection', parentId });
    setNewItemName('New Collection');
  };

  const confirmCreation = async () => {
    if (!creatingItem || !newItemName.trim()) return;

    try {
      if (creatingItem.type === 'prompt') {
        await onCreatePrompt(creatingItem.parentId);
      } else {
        await onCreateCollection(creatingItem.parentId);
      }
    } catch (err) {
      console.error('Creation failed:', err);
    } finally {
      setCreatingItem(null);
      setNewItemName('');
    }
  };

  const cancelCreation = () => {
    setCreatingItem(null);
    setNewItemName('');
  };

  return (
    <div className="flex h-full flex-shrink-0" style={{ borderRight: "0.5px solid var(--color-border, #222)" }}>
      
      {/* Icon Rail */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 52, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center py-2 gap-1 overflow-hidden flex-shrink-0"
            style={{ background: "var(--color-surface, #0d0d0d)", borderRight: "0.5px solid var(--color-border, #222)" }}
          >
            <RailButton
              icon={Home}
              label="Home"
              isActive={activeTab.type === "home"}
              onClick={() => onOpenTab({ id: "home", label: "Home", type: "home" })}
            />

            <div style={{ width: 24, height: 0.5, background: "var(--color-border, #222)", margin: "4px 0" }} />

            <RailButton icon={FileText} label="Prompts" isActive={activeSection === "prompts"} onClick={() => toggleSection("prompts")} />
            <RailButton icon={Layout} label="Templates" isActive={activeSection === "templates"} onClick={() => toggleSection("templates")} />
            <RailButton icon={BookOpen} label="Library" isActive={activeSection === "library"} onClick={() => toggleSection("library")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Panel */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key={activeSection}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full overflow-hidden flex-shrink-0"
            style={{ background: "var(--color-surface, #0d0d0d)" }}
          >
            <div className="flex flex-col h-full w-[180px]">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border,#222)]">
                <span className="uppercase text-[10px] tracking-[0.08em] font-bold text-muted">
                  {activeSection}
                </span>

                {activeSection === "prompts" && (
                  <div className="flex gap-1">
                    <button onClick={handleNewCollection} className="p-1 hover:bg-zinc-800 rounded transition-colors" title="New Collection">
                      <FolderPlus size={14} />
                    </button>
                    <button onClick={handleNewPrompt} className="p-1 hover:bg-zinc-800 rounded transition-colors" title="New Prompt">
                      <FilePlus size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
                {activeSection === "prompts" && collectionsTree && (
                  <>
                    {/* Root-level Prompts */}
                    {collectionsTree.rootPrompts.map((prompt) => (
                      <SectionItem
                        key={prompt.id}
                        id={prompt.id}
                        name={prompt.name}
                        type="prompt"
                        isActive={selectedId === prompt.id || activeTab.id === prompt.id}
                        onOpenTab={onOpenTab}
                        onClick={() => setSelectedId(prompt.id)}
                      />
                    ))}

                    {/* Nested Collections */}
                    {collectionsTree.tree.map((collection) => (
                      <CollectionTreeNode
                        key={collection.id}
                        node={collection}
                        expandedCollections={expandedCollections}
                        toggleExpand={toggleExpand}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        onOpenTab={onOpenTab}
                        creatingItem={creatingItem}
                        newItemName={newItemName}
                        setNewItemName={setNewItemName}
                        confirmCreation={confirmCreation}
                        cancelCreation={cancelCreation}
                      />
                    ))}

                    {/* Inline creation at root level */}
                    {creatingItem && creatingItem.parentId === null && (
                      <InlineCreationInput
                        name={newItemName}
                        setName={setNewItemName}
                        type={creatingItem.type}
                        onConfirm={confirmCreation}
                        onCancel={cancelCreation}
                      />
                    )}
                  </>
                )}

                {/* TODO: Replace with real data later */}
                {activeSection === "templates" && <div className="text-muted text-sm p-2">Templates coming soon...</div>}
                {activeSection === "library" && <div className="text-muted text-sm p-2">Library coming soon...</div>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ isOpen, activeTab, onOpenTab }: SidebarProps) {
const [manualSection, setManualSection] = useState<SectionId | null>("prompts")
const [manualOverride, setManualOverride] = useState(false)

const derivedSection = sectionFromTab[activeTab?.type] ?? null

const activeSection = manualOverride ? manualSection : (derivedSection ?? manualSection)

function toggleSection(section: SectionId) {
  setManualSection((prev) => (prev === section ? null : section))
  setManualOverride(true) // user clicked rail, take control
}
  const panelOpen = isOpen && activeSection !== null

  useEffect(() => {
  setManualOverride(false) // tab changed, let it drive again
}, [activeTab?.id])

  return (
    <div className="flex h-full flex-shrink-0" style={{ borderRight: "0.5px solid var(--color-border, #222)" }}>
      
      {/* ── Icon rail ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 52, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col items-center py-2 gap-1 overflow-hidden flex-shrink-0"
            style={{ background: "var(--color-surface, #0d0d0d)", borderRight: "0.5px solid var(--color-border, #222)" }}
          >
            {/* Home — no panel, just opens home tab */}
            <RailButton
              icon={Home}
              label="Home"
              isActive={activeTab.type === "home"}
              onClick={() => onOpenTab({ id: "home", label: "Home", type: "home" })}
            />

            <div style={{ width: 24, height: 0.5, background: "var(--color-border, #222)", margin: "4px 0" }} />

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

      {/* ── Section panel ── */}
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
                <button
                  className="rounded-lg p-1 transition-colors hover:bg-background"
                  style={{ color: "var(--color-muted, #666)" }}
                  title={`New ${activeSection?.slice(0, -1)}`}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Panel items */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
                {activeSection === "prompts" &&
                  mockPrompts.map((p) => (
                    <SectionItem
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      type="prompt"
                      isActive={activeTab.id === p.id}
                      onOpenTab={onOpenTab}
                    />
                  ))}

                {activeSection === "templates" &&
                  mockTemplates.map((t) => (
                    <SectionItem
                      key={t.id}
                      id={t.id}
                      name={t.name}
                      type="template"
                      isActive={activeTab.id === t.id}
                      onOpenTab={onOpenTab}
                    />
                  ))}

                {activeSection === "library" &&
                  mockLibrary.map((l) => (
                    <SectionItem
                      key={l.id}
                      id={l.id}
                      name={l.name}
                      type="library"
                      isActive={activeTab.id === l.id}
                      onOpenTab={onOpenTab}
                    />
                  ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}