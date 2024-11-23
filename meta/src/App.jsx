import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SetupPage } from './pages/SetupPage';
import { EyeSettingsPage } from './pages/EyeSettingsPage';
import { TextInputPage } from './pages/TextInputPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/eyes" element={<EyeSettingsPage />} />
        <Route path="/text" element={<TextInputPage />} />
      </Routes>
    </Router>
  );
};

export default App;