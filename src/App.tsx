import { useEffect, useState } from "react";
import Dash from "../components/Dash"
import "./App.css";
import { getAppState, initDB } from "@/lib/db";
import { initFS, setupWorkspace } from "@/lib/fs";
import Onboarding from "@/components/Onboard";
import { TabBar } from "@/components/promptly/Tabbar";

function App() {

console.log("saved layout on load:", localStorage.getItem("panel-layout"))
  return (
    <main className="w-full ">
      <nav className="overflow-clip">
      <TabBar />
      </nav>
      <section className="w-full ">
        <AppFlow />
      </section>
    </main>
  );
}

export default App;


export const AppFlow = () => {

  const [dbReady, setDbReady] = useState(false)
  const [basePath, setBasePath] = useState("")

  useEffect(() => {
    (async () => {
      try {
        console.log("Initializing DB...")
        await initDB()
        await initFS()
        await initFS()
        setDbReady(true)
        const { basePath } = await getAppState()
        if (basePath) { await setupWorkspace(basePath) }
        console.log("APP initialized with basePath:", basePath)
        setBasePath(basePath)
      } catch (e) {
        console.error("APP init failed", e)
      }
    })()
  }, [])
  if (!dbReady) return "wait"
  if (!basePath) return <Onboarding onDone={() => setBasePath("done")} />

  return (<Dash dbReady={dbReady} />)
  
}