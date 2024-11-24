import { useState, useEffect } from 'react';
import { Eye, ArrowRight } from 'lucide-react';
import { H1, H3, P } from '../components/Typography';

const VoiceSelector = () => {
  const [selectedVoice, setSelectedVoice] = useState(localStorage.getItem('selectedVoice') || 'neutral');

  const handleVoiceChange = (voice) => {
    setSelectedVoice(voice);
    localStorage.setItem('selectedVoice', voice);
  };

  return (
    <div className="bg-custom-white/10 backdrop-blur-md rounded-xl p-10 border border-custom-white/40 hover:border-custom-white/60 hover:bg-custom-white/20 transition-colors">
      <H3 className="text-custom-white text-2xl mb-6">Voice Selection</H3>
      <div className="space-y-4">
        {[
          { id: 'MALE', label: 'Male Voice', desc: 'Deep masculine voice' },
          { id: 'FEMALE', label: 'Female Voice', desc: 'Soft feminine voice' },
          { id: 'NEUTRAL', label: 'Neutral Voice', desc: 'Gender-neutral voice' },
          { id: 'UNKNOWN', label: 'Random Voice', desc: 'Random voice selection' }
        ].map(voice => (
          <button
            key={voice.id}
            onClick={() => handleVoiceChange(voice.id)}
            className={`block w-full text-left p-6 rounded-lg border transition-all ${
              selectedVoice === voice.id
                ? 'bg-custom-white/20 border-custom-white/60'
                : 'bg-custom-white/10 border-custom-white/40 hover:bg-custom-white/20'
            }`}
          >
            <P className="text-custom-white font-bold">{voice.label}</P>
            <P className="text-custom-white/70 text-sm">{voice.desc}</P>
          </button>
        ))}
      </div>
    </div>
  );
};

const GazeDirectionTest = ({ currentGaze, loss }) => (
  <div className="bg-custom-white/10 backdrop-blur-md rounded-xl p-10 border border-custom-white/40 hover:border-custom-white/60 hover:bg-custom-white/20 transition-colors">
    <H3 className="text-custom-white text-2xl mb-6">Current Gaze Detection</H3>
    <div className="grid grid-cols-2 gap-6">
      <div className="flex items-center gap-4">
        <div className="w-4 h-4 rounded-full bg-spring" />
        <P className="text-custom-white">Gaze Type: {currentGaze}</P>
      </div>
      <div className="flex items-center gap-4">
        <div className={`w-4 h-4 rounded-full ${loss < 0.02 ? 'bg-spring' : 'bg-yellow-400'}`} />
        <P className="text-custom-white">Loss: {loss.toFixed(3)}</P>
      </div>
    </div>
  </div>
);

const GazeLog = ({ logs }) => (
  <div className="bg-custom-white/10 backdrop-blur-md rounded-xl p-10 border border-custom-white/40 hover:border-custom-white/60 hover:bg-custom-white/20 transition-colors h-64 overflow-auto">
    <H3 className="text-custom-white text-2xl mb-6">Gaze Input Log</H3>
    <div className="space-y-4">
      {logs.map((log, i) => (
        <div key={i} className="text-custom-white/80 flex items-center gap-4">
          <span className="text-sm opacity-50">{log.time}</span>
          <P>{log.action}</P>
        </div>
      ))}
    </div>
  </div>
);

const SensitivitySlider = ({ value, onChange }) => (
  <div className="bg-custom-white/10 backdrop-blur-md rounded-xl p-10 border border-custom-white/40 hover:border-custom-white/60 hover:bg-custom-white/20 transition-colors">
    <H3 className="text-custom-white text-2xl mb-6">Gaze Sensitivity</H3>
    <input
      type="range"
      min="0.1"
      max="0.4"
      step="0.05"
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-custom-white/20 rounded-lg appearance-none cursor-pointer"
    />
    <div className="flex justify-between mt-4 text-custom-white/70">
      <span>More Accurate</span>
      <span>More Sensitive</span>
    </div>
  </div>
);

const ModeSelector = ({ currentMode, onModeChange }) => (
  <div className="bg-custom-white/10 backdrop-blur-md rounded-xl p-10 border border-custom-white/40 hover:border-custom-white/60 hover:bg-custom-white/20 transition-colors">
    <H3 className="text-custom-white text-2xl mb-6">Text-entry Mode</H3>
    <div className="space-y-4">
      {[
        { id: 1, name: "Letter-by-letter keyboard", desc: "Type letters one by one with no prediction" },
        { id: 2, name: "Ambiguous keyboard only", desc: "Type with ambiguous keyboard without LLM" },
        { id: 3, name: "Ambiguous keyboard + LLM", desc: "Uses LLM for word prediction and sentence retrieval" }
      ].map(mode => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`block w-full text-left p-6 rounded-lg border transition-all ${
            currentMode === mode.id
              ? 'bg-custom-white/20 border-custom-white/60'
              : 'bg-custom-white/10 border-custom-white/40 hover:bg-custom-white/20'
          }`}
        >
          <P className="text-custom-white font-bold">{mode.name}</P>
          <P className="text-custom-white/70 text-sm">{mode.desc}</P>
        </button>
      ))}
    </div>
  </div>
);

const GestureGuide = () => (
  <div className="bg-custom-white/10 backdrop-blur-md rounded-xl p-10 border border-custom-white/40 hover:border-custom-white/60 hover:bg-custom-white/20 transition-colors">
    <H3 className="text-custom-white text-2xl mb-6">Gesture Guide</H3>
    <div className="grid grid-cols-2 gap-6">
      {[
        { direction: "Left-up", letter: "ABCDEF", word: "Word 1" },
        { direction: "Right-up", letter: "GHIJKLM", word: "Word 2" },
        { direction: "Left-down", letter: "NOPQRST", word: "Word 3" },
        { direction: "Right-down", letter: "UVWXYZ", word: "Next page" },
        { direction: "Closed", letter: "→ Word mode", word: "→ Letter mode" },
        { direction: "Up", letter: "Delete", word: "Finish" }
      ].map((gesture, i) => (
        <div key={i} className="text-custom-white/80">
          <P className="font-bold">{gesture.direction}</P>
          <P className="text-sm opacity-70">Letter: {gesture.letter}</P>
          <P className="text-sm opacity-70">Word: {gesture.word}</P>
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
    { time: "10:45:25", action: "Looking Left" }
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-berkeley via-lapis to-spring opacity-90" />

      {/* Floating gradient orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-spring rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-lapis rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-50" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-berkeley rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-50" />

      <nav className="relative bg-custom-white/10 backdrop-blur-md border-b border-custom-white/40">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Eye className="h-8 w-8 text-custom-white" />
            <H1 className="text-custom-white text-3xl">Eye Tracking Settings</H1>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-custom-white/10 text-custom-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-custom-white/20 hover:scale-105 transition-transform border border-custom-white/40 hover:border-custom-white/60"
          >
            Home
          </button>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-16">
          
          <div className="space-y-16">
            <GazeDirectionTest currentGaze={currentGaze} loss={loss} />
            <SensitivitySlider value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} />
            <VoiceSelector />
            <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />
          </div>
          <div className="space-y-16">
            <GestureGuide />
            <GazeLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};
