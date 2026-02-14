import { HashRouter, Routes, Route } from "react-router-dom";
import SlammerLanding from "./components/SlammerLanding";
import MissionPage from "./components/MissionPage";
import UploadPage from "./components/UploadPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SlammerLanding />} />
        <Route path="/mission" element={<MissionPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
