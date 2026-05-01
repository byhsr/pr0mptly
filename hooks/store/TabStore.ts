// stores/useTabsStore.ts
import { create } from "zustand"
import { Tab } from "@/components/promptly/Tabbar"

type TabsState = {
  tabs: Tab[]
  activeTabId: string | null
  isDash : boolean
  sidebarOpen: boolean
  setDash : () => void
  setTabs: (tabs: Tab[]) => void
  setActiveTab: (id: string) => void
  addTab: (tab: Tab) => void
  closeTab: (id: string) => void

  toggleSidebar: () => void
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  sidebarOpen: true,

  
  isDash : false,
  setDash : () => set({ isDash : true }),

  setTabs: (tabs) => set({ tabs }),
  setActiveTab: (id) => set({ activeTabId: id }),

  addTab: (tab) =>
  set((state) => {
    const exists = state.tabs.find(t => t.id === tab.id)

    if (exists) {
      return {
        activeTabId: tab.id
      }
    }

    return {
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    }
  }),

  closeTab: (id) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id)

      return {
        tabs: newTabs,
        activeTabId:
          state.activeTabId === id
            ? newTabs[newTabs.length - 1]?.id ?? null
            : state.activeTabId,
      }
    }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))