import { HashRouter, Routes, Route } from "react-router-dom";
import SlammerLanding from "./components/SlammerLanding";
import MissionPage from "./components/MissionPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SlammerLanding />} />
        <Route path="/mission" element={<MissionPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
