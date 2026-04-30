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


        <div className="h-screen flex items-center bg justify-center">

            {/* Card */}
            <div className="p-8 border border-border/40  rounded-2xl w-[400px] space-y-6 bg-surface backdrop-blur-sm">

                {/* Header */}
                <div className="space-y-1">
                    <p className="text-[8px] font-mono tracking-[0.2em] uppercase text-muted-foreground/60">
                        System / Init
                    </p>
                    <h2 className="text-base font-medium tracking-tight">Get Started</h2>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Select a folder to save all your data
                </p>

                {/* Button */}
                <button
                    onClick={handleSelectFolder}
                    disabled={loading}
                    className="w-full border border-border  bg-accent/80 text-black rounded-lg p-2.5 text-sm font-mono tracking-wide
                 hover:bg-accent  transition-all duration-150
                 disabled:opacity-40 disabled:cursor-not-allowed
                 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                            Opening...
                        </>
                    ) : (
                        <>
                            <span className="text-muted-foreground text-[10px]"></span>
                            Select Folder
                        </>
                    )}
                </button>

                {/* Error */}
                {error && (
                    <p className="text-[11px] font-mono text-red-400/80 border-l border-red-400/40 pl-3">
                        {error}
                    </p>
                )}
            </div>
        </div>)


}

// <div className="h-screen flex items-center justify-center">
//   <div className="p-6 border rounded-xl w-[400px] space-y-4">
//     <h2 className="text-lg font-semibold">Choose Workspace</h2>

//     <p className="text-sm text-muted-foreground">
//       Select a folder where your prompts and files will be stored.
//     </p>

//     <button
//       onClick={handleSelectFolder}
//       disabled={loading}
//       className="w-full border rounded-lg p-2"
//     >
//       {loading ? "Opening..." : "Select Folder"}
//     </button>

//     {error && (
//       <p className="text-sm text-red-500">{error}</p>
//     )}
//   </div>
// </div>