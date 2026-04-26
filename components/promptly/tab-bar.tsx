"use client"

import { X } from "lucide-react"
import { getCurrentWindow } from "@tauri-apps/api/window";

interface TabBarProps {
  openFiles: string[]
  activeFile: string | null
  onTabSelect: (filename: string) => void
  onTabClose: (filename: string) => void
}

// export function TabBar({ openFiles, activeFile, onTabSelect, onTabClose }: TabBarProps) {
//   return (
//     <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-1.5 overflow-x-auto">
//       {openFiles.map((file) => {
//         const isActive = activeFile === file
//         return (
//           <div
//             key={file}
//             className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer ${
//               isActive
//                 ? "bg-background text-foreground"
//                 : "text-muted hover:bg-background/50 hover:text-foreground"
//             }`}
//             onClick={() => onTabSelect(file)}
//           >
//             <span>{file}</span>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation()
//                 onTabClose(file)
//               }}
//               className={`rounded p-0.5 transition-colors ${
//                 isActive
//                   ? "text-muted hover:text-foreground hover:bg-surface"
//                   : "opacity-0 group-hover:opacity-100 text-muted hover:text-foreground"
//               }`}
//             >
//               <X className="h-3.5 w-3.5" />
//             </button>
//           </div>
//         )
//       })}
//     </div>
//   )
// }




const appWindow = getCurrentWindow();

// type TabBarProps = {
//   openFiles: string[];
//   activeFile: string;
//   onTabSelect: (file: string) => void;
//   onTabClose: (file: string) => void;
// };

export function TabBar({ openFiles, activeFile, onTabSelect, onTabClose }: TabBarProps) {
  return (
    <div
      className="flex items-center border-b border-border bg-surface"
      style={{ minHeight: 40 }}
    >
      {/* Logo — drag region starts here */}
      <div
        data-tauri-drag-region
        className="flex items-center px-4 shrink-0 h-full select-none"
        style={{ minWidth: 120 }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: "#c8f135",
            letterSpacing: "-0.3px",
          }}
        >
          pr0mptly
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto flex-1">
        {openFiles.map((file) => {
          const isActive = activeFile === file;
          return (
            <div
              key={file}
              className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? "bg-background text-foreground"
                  : "text-muted hover:bg-background/50 hover:text-foreground"
              }`}
              onClick={() => onTabSelect(file)}
            >
              <span>{file}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(file);
                }}
                className={`rounded p-0.5 transition-colors ${
                  isActive
                    ? "text-muted hover:text-foreground hover:bg-surface"
                    : "opacity-0 group-hover:opacity-100 text-muted hover:text-foreground"
                }`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Window controls */}
      <div className="flex items-center gap-1 px-2 shrink-0">
        <button
          onClick={() => appWindow.minimize()}
          className="w-8 h-7 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-background transition-colors"
          style={{ fontSize: 16 }}
        >
          &#8211;
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="w-8 h-7 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-background transition-colors"
          style={{ fontSize: 11 }}
        >
          &#9633;
        </button>
        <button
          onClick={() => appWindow.close()}
          className="w-8 h-7 flex items-center justify-center rounded-md text-muted hover:text-white hover:bg-red-500 transition-colors"
          style={{ fontSize: 16 }}
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
}
