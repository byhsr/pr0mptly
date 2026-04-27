import { motion, AnimatePresence } from "framer-motion"
import { Tab } from "./Tabbar"
import { FileTab } from "./file-tab"

// ── Placeholder views — replace each with the real component later ─────────────
// These are intentionally minimal shells. Build each view one by one.

function HomeView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="text-center">
        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--color-foreground, #fff)",
            letterSpacing: "-0.5px",
          }}
        >
          What are you building today?
        </p>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: "var(--color-muted, #666)",
            marginTop: 6,
          }}
        >
          @p: prompts &nbsp;·&nbsp; /t: templates &nbsp;·&nbsp; /f: files
        </p>
      </div>

      {/* Smart bar shell — wire up later */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--color-surface, #111)",
          border: "0.5px solid var(--color-border, #2a2a2a)",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <textarea
          rows={1}
          placeholder="Try: @p:cold-email or /f:brief.pdf..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: "var(--color-foreground, #fff)",
          }}
        />
        <button
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "#c8f135",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#0a0a0a",
            flexShrink: 0,
          }}
        >
          ↗
        </button>
      </div>
    </div>
  )
}

function PromptView({ tab }: { tab: Tab }) {
  return (
    <div className="flex h-full  flex-col">
     
      <div className="flex-1 flex items-center justify-center">
        <FileTab tab={tab} />
        {/* <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "var(--color-muted, #666)" }}>
          PromptView — coming next
        </p> */}
      </div>
    </div>
  )
}

function TemplateView({ tab }: { tab: Tab }) {
  // TODO: build TemplateView
  return (
    <div className="flex h-full flex-col">
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "0.5px solid var(--color-border, #222)",
          fontFamily: "'Syne', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-foreground, #fff)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#6ee7f7",
            display: "inline-block",
          }}
        />
        {tab.label}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "var(--color-muted, #666)" }}>
          TemplateView — coming next
        </p>
      </div>
    </div>
  )
}

function LibraryView() {
  // TODO: build LibraryView
  return (
    <div className="flex h-full items-center justify-center">
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "var(--color-muted, #666)" }}>
        LibraryView — coming next
      </p>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface WorkspaceProps {
  tabs: Tab[]
  activeTab: Tab
  onTabSelect: (id: string) => void
  onTabClose: (id: string) => void
  onMarkDirty: (id: string, dirty: boolean) => void
}

// ── Workspace — pure view router ──────────────────────────────────────────────
export function Workspace({ activeTab, onMarkDirty }: WorkspaceProps) {
  function renderView(tab: Tab) {
    switch (tab.type) {
      case "home":     return <HomeView />
      case "prompt":   return <PromptView tab={tab} />
      case "template": return <TemplateView tab={tab} />
      case "library":  return <LibraryView />
      default:         return null
    }
  }

  return (
    <div className="flex h-full flex-1 overflow-hidden" style={{ background: "var(--color-background, #0a0a0a)" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="h-full w-full"
        >
          {renderView(activeTab ?? { id: "home", label: "Home", type: "home" })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}