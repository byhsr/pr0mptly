import { useEffect, useState } from "react";
import Dash from "../components/Dash"
import "./App.css";
import { getAppBasePath, initDB } from "@/lib/db";
import { setupWorkspace } from "@/lib/fs/fs";
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
        await initDB()
        const { basePath } = await getAppBasePath()
        if (basePath) {
          initBasePath(basePath)
          await setupWorkspace(basePath)
          console.log("APP initialized with basePath:", basePath)
          setBasePath(basePath)

        }
        setDbReady(true)


      } catch (e) {
        console.error("APP init failed", e)
      }
    })()
  }, [basePath])


  if (!dbReady || !basePath) return "wait"
  if (!basePath) return <Onboarding onDone={() => setBasePath("ok")} />

  return (<Dash dbReady={dbReady} />)

}


