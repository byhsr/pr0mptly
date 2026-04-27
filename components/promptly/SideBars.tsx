import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, FileText, Layout, BookOpen, Plus } from "lucide-react"
import { Tab } from "./Tabbar"

// ── Mock data (replace with real data later) ──────────────────────────────────
const mockPrompts = [
  { id: "p-1", name: "Cold email" },
  { id: "p-2", name: "Code review" },
  { id: "p-3", name: "Meeting summary" },
]

const mockTemplates = [
  { id: "t-1", name: "Blog post" },
  { id: "t-2", name: "Product brief" },
  { id: "t-3", name: "Weekly report" },
]

const mockLibrary = [
  { id: "l-1", name: "GPT-4 system prompts" },
  { id: "l-2", name: "Claude starters" },
]

// ── Types ─────────────────────────────────────────────────────────────────────
type SectionId = "prompts" | "templates" | "library"

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