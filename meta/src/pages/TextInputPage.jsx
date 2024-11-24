// src/pages/TextInputPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Eye } from "lucide-react";
import { FilmGrain } from "../components/FilmGrain";
import { useWebGazer } from "../context/WebGazerContext";
import { useNavigate } from "react-router-dom";
import { X, RefreshCcw } from "lucide-react";

const GAZE_THRESHOLD = 1000; // 1 second
const GAZE_REGIONS = {
  "left-up": { letters: "ABCDEF", label: "A-F" },
  "right-up": { letters: "GHIJKLM", label: "G-M" },
  "left-down": { letters: "NOPQRST", label: "N-T" },
  "right-down": { letters: "UVWXYZ", label: "U-Z" },
};

const TextInputPage = () => {
  const { isInitialized, initializeWebGazer } = useWebGazer();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [llmSuggestion, setLlmSuggestion] = useState("");
  const [currentGaze, setCurrentGaze] = useState("center");
  const [gazeStartTime, setGazeStartTime] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);
  const [isCharacterMode, setIsCharacterMode] = useState(true); // New state for mode

  const getGazeRegion = useCallback((x, y) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (y < screenHeight * 0.2 && x > screenWidth * 0.4 && x < screenWidth * 0.6) {
      return "clear";
    } else if (y > screenHeight * 0.8 && x > screenWidth * 0.4 && x < screenWidth * 0.6) {
      return "delete";
    } else if (y < screenHeight * 0.4) {
      if (x < screenWidth * 0.4) return "left-up";
      if (x > screenWidth * 0.6) return "right-up";
    } else if (y > screenHeight * 0.6) {
      if (x < screenWidth * 0.4) return "left-down";
      if (x > screenWidth * 0.6) return "right-down";
    }

    return "center";
  }, []);
  
  useEffect(() => {
    const isSetupComplete = localStorage.getItem('setupComplete') === 'true';
    if (!isSetupComplete) {
      navigate("/");
      return;
    }

    const init = async () => {
      if (!isInitialized) {
        await initializeWebGazer();
      }
      // Hide the video feed
      if (window.webgazer) {
        window.webgazer.showVideo(false);
      }
      // ...existing code...
    };

    init();

    // Cleanup to ensure the video feed remains hidden
    return () => {
      if (window.webgazer) {
        window.webgazer.showVideo(false);
      }
    };
  }, [isInitialized, initializeWebGazer, navigate]);
  // console.log("Current Gaze" + currentGaze);
  // useEffect(() => {
  //   const mouseMove = (e) => {
  //     // console.log(e.clientX);
  //     // console.log(e.clientY);
  //     const region = getGazeRegion(e.clientX, e.clientY);
  //     // console.log("cur region: " + curRegion);
  //     // console.log("new region: " + region);
  //     // console.log("cur gaze: " + currentGaze);
  //     if (region != null) {
  //       setCurRegion(region);
  //       setCurrentGaze(region);
  //     }
  //     if (curRegion === "center") {
  //       // setGazeStartTime(null);
  //       // setActiveRegion(null);
  //     } else if (!checkRegionGaze(region)) {
  //       if (region != null && gazeStartTime === null) {
  //         setGazeStartTime(Date.now());
  //       }
  //     } else if (gazeStartTime && !activeRegion) {
  //       const gazeTime = Date.now() - gazeStartTime;
  //       console.log("gazeTime: " + gazeTime);
  //       if (gazeTime >= GAZE_THRESHOLD) {
  //         setActiveRegion(curRegion);
  //         const letters = GAZE_REGIONS[activeRegion].letters;
  //         setInputText((prev) => prev + letters[0]);
  //         setActiveRegion(null);
  //         setGazeStartTime(null);
  //       }
  //     }
  //     console.log(gazeStartTime);
  //   };
  //   window.addEventListener("mousemove", mouseMove);

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

  
  // console.log("region: " + activeRegion);
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
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center
            ${
              currentGaze === "left-up" ? "bg-white/30 border-white/40 shadow-lg scale-105" : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
            }
            mt-16`}
        >
          <div className="font-serif text-4xl text-white mb-4">{GAZE_REGIONS["left-up"].label}</div>
        </div>
        <div></div>
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center
            ${
              currentGaze === "right-up" ? "bg-white/30 border-white/40 shadow-lg scale-105" : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
            }
            mt-16`}
        >
          <div className="font-serif text-4xl text-white mb-4">{GAZE_REGIONS["right-up"].label}</div>
        </div>

        {/* Middle row */}
        <div></div>
        <div className="space-y-4">
          {/* Input field */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="font-serif text-xl text-white mb-2">Text:</h3>
            <div className="text-white text-lg min-h-[2rem] font-mono">
              {inputText || "|"}
            </div>
          </div>

          {/* LLM suggestions */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="font-serif text-xl text-white mb-2">LLM:</h3>
            <div className="text-white/80 text-lg min-h-[2rem]">
              {llmSuggestion || "Waiting for input..."}
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setInputText("")}
              className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={() => setInputText((prev) => prev.slice(0, -4))}
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
        <div></div>

        {/* Bottom row */}
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center
            ${
              currentGaze === "left-down" ? "bg-white/30 border-white/40 shadow-lg scale-105" : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
            }
            mb-16`}
        >
          <div className="font-serif text-4xl text-white mb-4">{GAZE_REGIONS["left-down"].label}</div>
        </div>
        <div></div>
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center
            ${
              currentGaze === "right-down" ? "bg-white/30 border-white/40 shadow-lg scale-105" : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
            }
            mb-16`}
        >
          <div className="font-serif text-4xl text-white mb-4">{GAZE_REGIONS["right-down"].label}</div>
        </div>
      </div>
    </div>
  );
};
export default TextInputPage;