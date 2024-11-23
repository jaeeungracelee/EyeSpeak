import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SetupPage } from './pages/SetupPage';
import { EyeSettingsPage } from './pages/EyeSettingsPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/eyes" element={<EyeSettingsPage />} />
      </Routes>
    </Router>
  );
};

export default App;