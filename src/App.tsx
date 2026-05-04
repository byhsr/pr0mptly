import { useEffect, useState } from "react";
import Dash from "../components/Dash"
import "./App.css";
import {  initDB } from "@/lib/db";
import { readConfig, setupWorkspace } from "@/lib/fs/fs";
import { initBasePath } from "@/lib/fs/fsHelpers";
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
        const config = await readConfig()
        console.log(" config:", config)
        if (!config?.base_path) {
          setDbReady(true) // allow onboarding
          return
        }

        const basePath = config.base_path
        console.log(" basePath:", basePath)

        initBasePath(basePath)
        await initDB(basePath)
        await setupWorkspace(basePath)


        console.log("APP initialized with basePath:", basePath)

        setBasePath(basePath)
        setDbReady(true)

      } catch (e) {
        console.error("APP init failed", e)
      }
    })()
  }, [basePath])


  if (!dbReady) return "wait"
  if (!basePath) return <Onboarding onDone={() => setBasePath("ok")} />

  return (<Dash dbReady={dbReady} />)

}


