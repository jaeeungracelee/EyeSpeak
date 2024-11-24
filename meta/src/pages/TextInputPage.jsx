// src/pages/TextInputPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Eye, X, RefreshCcw } from "lucide-react";
import { FilmGrain } from "../components/FilmGrain";
import { useWebGazer } from "../context/WebGazerContext";
import { useNavigate } from "react-router-dom";

const GAZE_THRESHOLD = 1000; // 1 second
const GAZE_REGIONS = {
  "left-up": { letters: "ABCDEF", label: "A-F" },
  "right-up": { letters: "GHIJKLM", label: "G-M" },
  "left-down": { letters: "NOPQRST", label: "N-T" },
  "right-down": { letters: "UVWXYZ", label: "U-Z" },
};

export const TextInputPage = () => {
  const { isInitialized } = useWebGazer();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [llmSuggestion, setLlmSuggestion] = useState("");
  const [currentGaze, setCurrentGaze] = useState("center");
  const [gazeStartTime, setGazeStartTime] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);

  const getGazeRegion = useCallback((x, y) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (y < screenHeight * 0.4) {
      if (x < screenWidth * 0.4) return "left-up";
      if (x > screenWidth * 0.6) return "right-up";
    } else if (y > screenHeight * 0.6) {
      if (x < screenWidth * 0.4) return "left-down";
      if (x > screenWidth * 0.6) return "right-down";
    }

    return "center";
  }, []);

  useEffect(() => {

    const gazeListener = (data) => {
      if (!data) return;
      const region = getGazeRegion(data.x, data.y);

      if (region !== currentGaze) {
        setCurrentGaze(region);
        setGazeStartTime(region === "center" ? null : Date.now());
        setActiveRegion(null); // Reset active region when gaze changes
      } else if (region !== "center" && gazeStartTime) {
        const gazeTime = Date.now() - gazeStartTime;
        if (gazeTime >= GAZE_THRESHOLD && !activeRegion) {
          setActiveRegion(region);
        }
      }
    };

    webgazer.setGazeListener(gazeListener);

    return () => {
      webgazer.clearGazeListener();
    };
  }, [isInitialized, navigate, getGazeRegion, currentGaze, gazeStartTime, activeRegion]);

  useEffect(() => {
    if (!activeRegion || !GAZE_REGIONS[activeRegion]) return;

    const label = GAZE_REGIONS[activeRegion].label;
    setInputText((prev) => prev + label + " ");
    setActiveRegion(null);
    setGazeStartTime(null);
  }, [activeRegion]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 opacity-70" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-30" />
      <FilmGrain />

      {/* Letter regions */}
      <div className="relative w-full h-screen grid grid-cols-3 grid-rows-3 gap-8 p-8">
        {/* Top row */}
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-64
            ${
              currentGaze === "left-up" ? "bg-white/30 border-white/40 shadow-lg scale-105" : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
            }
            mt-16`}
        >
          <div className="font-serif text-5xl text-white mb-4">{GAZE_REGIONS["left-up"].label}</div>
        </div>
        <div></div>
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-64
            ${
              currentGaze === "right-up" ? "bg-white/30 border-white/40 shadow-lg scale-105" : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
            }
            mt-16`}
        >
          <div className="font-serif text-5xl text-white mb-4">{GAZE_REGIONS["right-up"].label}</div>
        </div>

        {/* Middle row */}
        <div></div>
        <div className="space-y-8">
          {/* Input field */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <h3 className="font-serif text-2xl text-white mb-4">Text:</h3>
            <div className="text-white text-xl min-h-[3rem] font-mono">
              {inputText || "|"}
            </div>
          </div>

          {/* LLM suggestions */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <h3 className="font-serif text-2xl text-white mb-4">LLM:</h3>
            <div className="text-white/80 text-xl min-h-[3rem]">
              {llmSuggestion || "Waiting for input..."}
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex justify-center gap-8">
            <button
              onClick={() => setInputText("")}
              className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-4"
            >
              <RefreshCcw className="w-6 h-6" />
              Clear
            </button>
            <button
              onClick={() => setInputText((prev) => prev.slice(0, -4))}
              className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-4"
            >
              <X className="w-6 h-6" />
              Delete
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-white/60 text-lg">
            Look at the center to reset selection
          </div>
        </div>
        <div></div>

        {/* Bottom row */}
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-64
            ${
              currentGaze === "left-down" ? "bg-white/30 border-white/40 shadow-lg scale-105" : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
            }
            mb-16`}
        >
          <div className="font-serif text-5xl text-white mb-4">{GAZE_REGIONS["left-down"].label}</div>
        </div>
        <div></div>
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-64
            ${
              currentGaze === "right-down" ? "bg-white/30 border-white/40 shadow-lg scale-105" : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
            }
            mb-16`}
        >
          <div className="font-serif text-5xl text-white mb-4">{GAZE_REGIONS["right-down"].label}</div>
        </div>
      </div>
    </div>
  );
};
