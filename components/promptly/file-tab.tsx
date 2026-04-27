"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Columns2, Columns3 } from "lucide-react"
import { BuilderPanel } from "./builder-panel"
import { ScratchpadPanel } from "./scratchpad-panel"
import { PromptPanel } from "./prompt-panel"
import { Tab } from "./Tabbar"

type SubTab = "builder" | "scratchpad" | "prompt"
type SplitMode = "none" | "two" | "two-prompt" | "three"

interface FileTabProps {
  filename: string
}

export function FileTab({ tab }: { tab: Tab }) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("builder")
  const [splitMode, setSplitMode] = useState<SplitMode>("none")

  const cycleSplitMode = () => {
    const modes: SplitMode[] = ["none", "two", "two-prompt", "three"]
    const currentIndex = modes.indexOf(splitMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setSplitMode(modes[nextIndex])
  }

  const getSplitIcon = () => {
    switch (splitMode) {
      case "none":
        return <Columns2 className="h-4 w-4" />
      case "two":
      case "two-prompt":
        return <Columns3 className="h-4 w-4" />
      case "three":
        return <Columns2 className="h-4 w-4 text-accent" />
    }
  }

  const renderPanel = (panel: SubTab) => {
    switch (panel) {
      case "builder":
        return <BuilderPanel />
      case "scratchpad":
        return <ScratchpadPanel />
      case "prompt":
        return <PromptPanel />
    }
  }

  const getPanelsToShow = (): SubTab[] => {
    switch (splitMode) {
      case "none":
        return [activeSubTab]
      case "two":
        return ["builder", "scratchpad"]
      case "two-prompt":
        return ["builder", "prompt"]
      case "three":
        return ["builder", "scratchpad", "prompt"]
    }
  }

  const panelsToShow = getPanelsToShow()

  return (
    <div className="flex h-full w-full flex-col">
      {/* Sub-tab Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1">
          {(["builder", "scratchpad", "prompt"] as SubTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeSubTab === tab
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground hover:bg-background"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Split Button */}
        <button
          onClick={cycleSplitMode}
          className={`rounded-lg p-2 transition-colors ${
            splitMode !== "none"
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground hover:bg-background"
          }`}
          title="Toggle split view"
        >
          {getSplitIcon()}
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div 
          className="flex h-full"
          layout
        >
          <AnimatePresence mode="popLayout">
            {panelsToShow.map((panel, index) => (
              <motion.div
                key={panel}
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: 1, 
                  width: `${100 / panelsToShow.length}%` 
                }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={`h-full overflow-hidden ${
                  index > 0 ? "border-l border-border" : ""
                }`}
              >
                <div className="h-full overflow-y-auto">
                  {renderPanel(panel)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
