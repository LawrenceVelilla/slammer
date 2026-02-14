import { HashRouter, Routes, Route } from "react-router-dom";
import SlammerLanding from "./components/SlammerLanding";
import MissionPage from "./components/MissionPage";
import UploadPage from "./components/UploadPage";
import ReadyPage from "./components/ReadyPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SlammerLanding />} />
        <Route path="/mission" element={<MissionPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/ready" element={<ReadyPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
