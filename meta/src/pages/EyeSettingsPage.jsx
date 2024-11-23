// src/pages/EyeSettingsPage.jsx
import { useState, useEffect } from 'react';
import { Eye, Settings, Volume2, AlertCircle, ArrowRight, BarChart2 } from 'lucide-react';
import { FilmGrain } from '../components/FilmGrain';

const GazeDirectionTest = ({ currentGaze, loss }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
    <h3 className="text-white font-serif text-xl mb-4">Current Gaze Detection</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="text-white">Gaze Type: {currentGaze}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${loss < 0.02 ? 'bg-green-400' : 'bg-yellow-400'}`} />
        <span className="text-white">Loss: {loss.toFixed(3)}</span>
      </div>
    </div>
  </div>
);

const GazeLog = ({ logs }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 h-64 overflow-auto">
    <h3 className="text-white font-serif text-xl mb-4">Gaze Input Log</h3>
    <div className="space-y-2">
      {logs.map((log, i) => (
        <div key={i} className="text-white/80 flex items-center gap-2">
          <span className="text-xs opacity-50">{log.time}</span>
          <span>{log.action}</span>
        </div>
      ))}
    </div>
  </div>
);

const SensitivitySlider = ({ value, onChange }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
    <h3 className="text-white font-serif text-xl mb-4">Gaze Sensitivity</h3>
    <input 
      type="range" 
      min="0.1" 
      max="0.4" 
      step="0.05"
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
    />
    <div className="flex justify-between mt-2">
      <span className="text-white/60">More Accurate</span>
      <span className="text-white/60">More Sensitive</span>
    </div>
  </div>
);

const ModeSelector = ({ currentMode, onModeChange }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
    <h3 className="text-white font-serif text-xl mb-4">Text-entry Mode</h3>
    <div className="space-y-2">
      {[
        { id: 1, name: "Letter-by-letter keyboard", desc: "Type letters one by one with no prediction" },
        { id: 2, name: "Ambiguous keyboard only", desc: "Type with ambiguous keyboard without LLM" },
        { id: 3, name: "Ambiguous keyboard + LLM", desc: "Uses LLM for word prediction and sentence retrieval" }
      ].map(mode => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`w-full text-left p-4 rounded-lg border transition-all ${
            currentMode === mode.id
              ? 'bg-white/20 border-white/40'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="text-white font-medium">{mode.name}</div>
          <div className="text-white/60 text-sm">{mode.desc}</div>
        </button>
      ))}
    </div>
  </div>
);

const GestureGuide = () => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
    <h3 className="text-white font-serif text-xl mb-4">Gesture Guide</h3>
    <div className="grid grid-cols-2 gap-4">
      {[
        { direction: "Left-up", letter: "ABCDEF", word: "Word 1" },
        { direction: "Right-up", letter: "GHIJKLM", word: "Word 2" },
        { direction: "Left-down", letter: "NOPQRST", word: "Word 3" },
        { direction: "Right-down", letter: "UVWXYZ", word: "Next page" },
        { direction: "Closed", letter: "→ Word mode", word: "→ Letter mode" },
        { direction: "Up", letter: "Delete", word: "Finish" },
      ].map((gesture, i) => (
        <div key={i} className="text-white/80 space-y-1">
          <div className="font-medium">{gesture.direction}</div>
          <div className="text-sm opacity-60">Letter: {gesture.letter}</div>
          <div className="text-sm opacity-60">Word: {gesture.word}</div>
        </div>
      ))}
    </div>
  </div>
);

export const EyeSettingsPage = () => {
  const [sensitivity, setSensitivity] = useState(0.2);
  const [currentMode, setCurrentMode] = useState(1);
  const [currentGaze, setCurrentGaze] = useState("Center");
  const [loss, setLoss] = useState(0.015);
  const [logs, setLogs] = useState([
    { time: "10:45:23", action: "Looking Up" },
    { time: "10:45:25", action: "Looking Left" },
    // Add more sample logs
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200">
      <FilmGrain />
      
      {/* Top Navigation */}
      <nav className="relative bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Eye className="h-6 w-6 text-white" />
            <h1 className="text-white font-serif text-xl">Eye Tracking Settings</h1>
          </div>
          <button 
            onClick={() => window.location.href = '/text-entry'}
            className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            <span className="text-white">Start Text Entry</span>
            <ArrowRight className="h-4 w-4 text-white" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <GazeDirectionTest currentGaze={currentGaze} loss={loss} />
            <SensitivitySlider value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} />
            <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            <GestureGuide />
            <GazeLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};
