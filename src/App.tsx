import { useEffect, useState } from "react";
import Dash from "../components/Dash"
import "./App.css";
import { initDB } from "@/lib/db";
import { info } from "@tauri-apps/plugin-log";

function App() {
const [dbReady, setDbReady] = useState(false)
 useEffect(() => {
  (async () => {
    try {
      await initDB()
      await info("check the logs")
      setDbReady(true)
    } catch (e) {
      console.error("DB init failed", e)
      
    }
  })()
}, [])


  return (
    <main className="flex ">
      <div>
        
        {/* <Sidebar /> */}
      </div>
      <div className="">
        <Dash dbReady={dbReady}/>
      </div>
    </main>
  );
}

export default App;
