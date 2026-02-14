import { HashRouter, Routes, Route } from "react-router-dom";
import SlammerLanding from "./components/SlammerLanding";
import MissionPage from "./components/MissionPage";
import UploadPage from "./components/UploadPage";
import ReadyPage from "./components/ReadyPage";
import WaitingPage from "./components/WaitingPage";
import QuestionPage from "./components/QuestionPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SlammerLanding />} />
        <Route path="/mission" element={<MissionPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/ready" element={<ReadyPage />} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/question" element={<QuestionPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
