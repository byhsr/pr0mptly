import Dash from "../components/Dash"
import Sidebar from '../components/Sidebar'
import "./App.css";

function App() {

  return (
    <main className="flex ">
      <div>
       {/* <Sidebar /> */}
      </div>
      <div className="">
       <Dash />
      </div>
    </main>
  );
}

export default App;
