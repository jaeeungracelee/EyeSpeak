// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SetupPage } from "./pages/SetupPage";
import { WebGazerProvider } from "./context/WebGazerContext";
import TestPage from "./pages/TestPage";
import { TextInputPage } from "./pages/TextInputPage";

const App = () => {
  return (
    <WebGazerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/text" element={<TextInputPage />} />
        </Routes>
      </Router>
    </WebGazerProvider>
  );
};

export default App;
