// src/pages/TextInputPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Eye, X, RefreshCcw } from 'lucide-react';
import { FilmGrain } from '../components/FilmGrain';

const GAZE_THRESHOLD = 3000; // 3 seconds
const GAZE_REGIONS = {
  'left-up': { letters: 'ABCDEF', label: 'A-F' },
  'right-up': { letters: 'GHIJKLM', label: 'G-M' },
  'left-down': { letters: 'NOPQRST', label: 'N-T' },
  'right-down': { letters: 'UVWXYZ', label: 'U-Z' }
};

export const TextInputPage = () => {
  const [inputText, setInputText] = useState('');
  const [llmSuggestion, setLlmSuggestion] = useState('');
  const [currentGaze, setCurrentGaze] = useState('center');
  const [gazeStartTime, setGazeStartTime] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);

  const getGazeRegion = useCallback((x, y) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    if (y < screenHeight * 0.4) {
      if (x < screenWidth * 0.4) return 'left-up';
      if (x > screenWidth * 0.6) return 'right-up';
    } else if (y > screenHeight * 0.6) {
      if (x < screenWidth * 0.4) return 'left-down';
      if (x > screenWidth * 0.6) return 'right-down';
    }
    
    return 'center';
  }, []);

  useEffect(() => {
    if (!webgazer) return;

    const gazeListener = (data) => {
      if (!data) return;
      
      const region = getGazeRegion(data.x, data.y);
      setCurrentGaze(region);
      
      if (region === 'center') {
        setGazeStartTime(null);
        setActiveRegion(null);
      } else if (region !== currentGaze) {
        setGazeStartTime(Date.now());
      } else if (gazeStartTime && !activeRegion) {
        const gazeTime = Date.now() - gazeStartTime;
        if (gazeTime >= GAZE_THRESHOLD) {
          setActiveRegion(region);
        }
      }
    };

    webgazer.setGazeListener(gazeListener);
    return () => webgazer.clearGazeListener();
  }, [currentGaze, gazeStartTime, getGazeRegion]);

  useEffect(() => {
    if (!activeRegion || !GAZE_REGIONS[activeRegion]) return;
    
    const letters = GAZE_REGIONS[activeRegion].letters;
    setInputText(prev => prev + letters[0]);
    
    setTimeout(() => {
      setActiveRegion(null);
      setGazeStartTime(null);
    }, 500);
  }, [activeRegion]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 opacity-70" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-30" />
      <FilmGrain />

      {/* Letter regions */}
      <div className="relative w-full h-screen grid grid-cols-2 grid-rows-2 gap-8 p-8">
        {Object.entries(GAZE_REGIONS).map(([region, { letters, label }]) => (
          <div
            key={region}
            className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center
              ${region === activeRegion ? 
                'bg-white/30 border-white/40 shadow-lg' : 
                'bg-white/10 border-white/20 hover:bg-white/20'}
              ${currentGaze === region ? 'scale-105' : 'scale-100'}
              ${region.includes('up') ? 'mt-16' : 'mb-16'}
            `}
          >
            <div className="font-serif text-4xl text-white mb-4">{letters}</div>
            <div className="text-white/80">
              {currentGaze === region && gazeStartTime ? (
                <div className="h-1 bg-white/20 rounded-full w-32 overflow-hidden">
                  <div
                    className="h-full bg-white/60 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        ((Date.now() - gazeStartTime) / GAZE_THRESHOLD) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              ) : (
                <span className="text-sm">{label}</span>
              )}
            </div>
          </div>
        ))}

        {/* Center text area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 space-y-4">
          {/* Input field */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="font-serif text-xl text-white mb-2">Text:</h3>
            <div className="text-white text-lg min-h-[2rem] font-mono">
              {inputText || '|'}
            </div>
          </div>

          {/* LLM suggestions */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="font-serif text-xl text-white mb-2">LLM:</h3>
            <div className="text-white/80 text-lg min-h-[2rem]">
              {llmSuggestion || 'Waiting for input...'}
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setInputText('')}
              className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={() => setInputText(prev => prev.slice(0, -1))}
              className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Delete
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-white/60 text-sm">
            Look at the center to reset selection
          </div>
        </div>
      </div>
    </div>
  );
};