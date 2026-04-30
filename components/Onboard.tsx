import { useState } from "react"
import { open } from "@tauri-apps/plugin-dialog"
import { setSetting } from "@/lib/db"
import { createBaseFolder, setupWorkspace } from "@/lib/fs"

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSelectFolder() {
    try {
      setLoading(true)
      setError(null)

      const selected = await open({
        directory: true,
        multiple: false,
      })

      if (!selected || Array.isArray(selected)) return


     // save to DB
       await setSetting("base_path", selected)

      // setup folder
      await createBaseFolder(selected)
     
      // mark onboarding done
      await setSetting("onboarding_done", "true")

      
      onDone()
    } catch (err) {
        console.log("Folder selection/setup failed", err)
      setError("Failed to set folder")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 border rounded-xl w-[400px] space-y-4">
        <h2 className="text-lg font-semibold">Choose Workspace</h2>

        <p className="text-sm text-muted-foreground">
          Select a folder where your prompts and files will be stored.
        </p>

        <button
          onClick={handleSelectFolder}
          disabled={loading}
          className="w-full border rounded-lg p-2"
        >
          {loading ? "Opening..." : "Select Folder"}
        </button>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}