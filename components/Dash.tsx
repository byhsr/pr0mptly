"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Tab } from "./promptly/Tabbar"
import { Sidebar } from "@/components/promptly/sidebar"
import { Workspace } from "./promptly/Workspaces"
import { getCollectionsTree, CollectionTree, createCollection } from "@/services/service.collections"
import { createPrompt } from "@/services/service.prompt"
import { useTabsStore } from "@/hooks/store/TabStore"
import { Group, Panel, Separator, useDefaultLayout, } from "react-resizable-panels"




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

    const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    groupId: "main-layout",
    storage: localStorage
  })

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
        <Group
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
          orientation="horizontal">
          <Panel id="sidebar" className="cursor-resize" minSize="220px" maxSize="500px">
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
          </Panel>
          <Separator style={{ cursor: "col-resize" }} />
          <Panel id="workspace">
            <Workspace
              tabs={tabs}
              activeTab={activeTab}
              onTabSelect={setActiveTab}
              onTabClose={closeTab}
              onMarkDirty={markDirty}
            />
          </Panel>
        </Group>

      </div>
    </div>
  )
}

