// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SetupPage } from "./pages/CalibratePage";
import { WebGazerProvider } from "./context/WebGazerContext";
import TestPage from "./pages/TestPage";
import SpeakPage from "./pages/SpeakPage";
import { EyeSettingsPage } from "./pages/EyeSettingsPage";

const App = () => {
  return (
    <WebGazerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/settings" element={<EyeSettingsPage />} />
          <Route path="/calibrate" element={<SetupPage />} />
          <Route path="/speak" element={<SpeakPage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </Router>
    </WebGazerProvider>
  );
};

export default App;
