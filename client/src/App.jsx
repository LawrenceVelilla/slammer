import { HashRouter, Routes, Route } from "react-router-dom";
import SlammerLanding from "./components/SlammerLanding";
import MissionPage from "./components/MissionPage";
import StudySession from "./components/StudySession";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SlammerLanding />} />
        <Route path="/mission" element={<MissionPage />} />
        <Route path="/study" element={<StudySession />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
