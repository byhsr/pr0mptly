import { X, PanelLeftClose, PanelLeft, Home, FileText, Layout } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

// Tab type — each open document knows what kind it is
export type TabType = "home" | "prompt" | "template" | "library";

export interface Tab {
  id: string;
  label: string;
  type: TabType;
  isDirty?: boolean; // unsaved changes indicator
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const appWindow = getCurrentWindow();
// Tiny dot to indicate tab type — keeps it minimal, no text overload
function TabTypeDot({ type }: { type: TabType }) {
  const colors: Record<TabType, string> = {
    home: "transparent",
    prompt: "#c8f135",
    template: "#6ee7f7",
    library: "#a78bfa",
  };
//   if (type === "home") return null;
  return (
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        backgroundColor: colors[type],
        display: "inline-block",
        flexShrink: 0,
        opacity: 0.85,
      }}
    />
  );
}

export function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  sidebarOpen,
  setSidebarOpen,
}: TabBarProps) {
  return (
    <div
      className="flex items-center border-b border-border bg-surface"
      style={{
        minHeight: 42,
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* ── Drag region + logo ── */}
      <div
        data-tauri-drag-region
        className="flex items-center shrink-0 h-full select-none"
        style={{ minWidth: 140, paddingLeft: 8, paddingRight: 12, gap: 8 }}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-background transition-colors"
          style={{ flexShrink: 0 }}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-3.5 w-3.5" />
          ) : (
            <PanelLeft className="h-3.5 w-3.5" />
          )}
        </button>

        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            color: "#c8f135",
            letterSpacing: "-0.5px",
            userSelect: "none",
          }}
        >
          pr0mptly
        </span>
      </div>

      {/* ── Thin separator ── */}
      <div
        style={{
          width: 1,
          height: 18,
          backgroundColor: "var(--color-border, #2a2a2a)",
          flexShrink: 0,
          opacity: 0.5,
        }}
      />

      {/* ── Global tabs ── */}
      <div
        className="flex items-center gap-0.5 px-2 overflow-x-auto flex-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {tabs.map((tab) => {
        if (tab.type === "home") return null;
        const isActive = activeTabId === tab.id;
       

          return (
            <div
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className={`
                group flex items-center gap-1.5 rounded-lg px-3 cursor-pointer shrink-0 transition-all
                ${isActive
                  ? "bg-background text-foreground"
                  : "text-muted hover:text-foreground hover:bg-background/40"
                }
              `}
              style={{
                height: 28,
                fontSize: 12,
                fontFamily: "'Syne', sans-serif",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "-0.2px",
                userSelect: "none",
              }}
            >
              <TabTypeDot type={tab.type} />

              <span>{tab.label}</span>

              {/* Unsaved dot */}
              {tab.isDirty && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: "#c8f135",
                    display: "inline-block",
                    opacity: 0.7,
                  }}
                />
              )}

              {/* Close — hidden for home tab */}
              {(
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  className={`
                    rounded p-0.5 transition-all ml-0.5
                    ${isActive
                      ? "text-muted hover:text-foreground"
                      : "opacity-0 group-hover:opacity-100 text-muted hover:text-foreground"
                    }
                  `}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Window controls ── */}
      <div
        className="flex items-center shrink-0"
        style={{ paddingRight: 6, gap: 2 }}
      >
        <button
          onClick={() => appWindow.minimize()}
          className="flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors"
          style={{ width: 30, height: 26, fontSize: 15 }}
        >
          &#8211;
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors"
          style={{ width: 30, height: 26, fontSize: 10 }}
        >
          &#9633;
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-red-500 transition-colors"
          style={{ width: 30, height: 26, fontSize: 14 }}
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// Usage example (in your App.tsx or layout):
// ─────────────────────────────────────────────
//
// const [tabs, setTabs] = useState<Tab[]>([
//   { id: "home", label: "Home", type: "home" },
// ]);
// const [activeTabId, setActiveTabId] = useState("home");
//
// function openTab(tab: Tab) {
//   if (!tabs.find(t => t.id === tab.id)) {
//     setTabs(prev => [...prev, tab]);
//   }
//   setActiveTabId(tab.id);
// }
//
// function closeTab(id: string) {
//   const idx = tabs.findIndex(t => t.id === id);
//   const next = tabs[idx - 1] ?? tabs[idx + 1];
//   setTabs(prev => prev.filter(t => t.id !== id));
//   if (next) setActiveTabId(next.id);
// }
//
// <TabBar
//   tabs={tabs}
//   activeTabId={activeTabId}
//   onTabSelect={setActiveTabId}
//   onTabClose={closeTab}
//   sidebarOpen={sidebarOpen}
//   setSidebarOpen={setSidebarOpen}
// />