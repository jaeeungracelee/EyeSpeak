// src/pages/TextInputPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Eye, RefreshCcw } from "lucide-react";
import { useWebGazer } from "../context/WebGazerContext";
import { useNavigate } from "react-router-dom";
import { H3, P } from '../components/Typography';

const GAZE_THRESHOLD = 1000; // 1 second
const EYE_CLOSED_THRESHOLD = 1500; // 1.5 seconds
const GAZE_REGIONS = {
  "left-up": { letters: "A-F", label: "A-F" },
  "right-up": { letters: "G-M", label: "G-M" },
  "left-down": { letters: "N-T", label: "N-T" },
  "right-down": { letters: "U-Z", label: "U-Z" },
};

const TextInputPage = () => {
  const { isInitialized, initializeWebGazer } = useWebGazer();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [llmSuggestion, setLlmSuggestion] = useState("");
  const [currentGaze, setCurrentGaze] = useState("center");
  const [gazeStartTime, setGazeStartTime] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);
  const [modeIndex, setModeIndex] = useState(0); // 0: Character, 1: Word, 2: Sentence
  const [wordOptions, setWordOptions] = useState([]);
  const [sentenceOptions, setSentenceOptions] = useState([]);
  const [eyeClosedStartTime, setEyeClosedStartTime] = useState(null);
  const [eyesClosed, setEyesClosed] = useState(false);

  const modes = ["character", "word", "sentence"];

  const getGazeRegion = useCallback((x, y) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (
      y < screenHeight * 0.2 &&
      x > screenWidth * 0.4 &&
      x < screenWidth * 0.6
    ) {
      return "clear";
    } else if (
      y > screenHeight * 0.8 &&
      x > screenWidth * 0.4 &&
      x < screenWidth * 0.6
    ) {
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

  const getPredictionForRegion = (region) => {
    const letterRange = GAZE_REGIONS[region].label;
    const word =
      wordOptions[Object.keys(GAZE_REGIONS).indexOf(region)]?.prompt ||
      "No prediction available";
    const sentence =
      sentenceOptions[Object.keys(GAZE_REGIONS).indexOf(region)] ||
      "No prediction available";

    const modeOrder = [
      modes[modeIndex % modes.length],
      modes[(modeIndex + 1) % modes.length],
      modes[(modeIndex + 2) % modes.length],
    ];

    if (modeOrder[0] === "character") {
      return [letterRange, word, sentence];
    } else if (modeOrder[0] === "word") {
      return [word, sentence, letterRange];
    } else if (modeOrder[0] === "sentence") {
      return [sentence, letterRange, word];
    }
  };

  const fetchPredictions = async (letterRanges) => {
    try {
      const response = await fetch(
        "https://deyelog.jasoncameron.dev/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            letter_ranges: letterRanges.join(" "),
            context: "What do you want to eat?",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch predictions");
      }

      const data = await response.json();
      setWordOptions(data.prompt_options || []);
      setSentenceOptions(data.sentences || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  useEffect(() => {
    const isSetupComplete = localStorage.getItem("setupComplete") === "true";
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
    };

    init();

    // Cleanup to ensure the video feed remains hidden
    return () => {
      if (window.webgazer) {
        window.webgazer.showVideo(false);
      }
    };
  }, [isInitialized, initializeWebGazer, navigate]);

  useEffect(() => {
    const gazeListener = async (data, elapsedTime) => {
      if (!data) return;

      // Eye closure detection
      const prediction = await window.webgazer.getCurrentPrediction();
      const isEyesClosed = prediction === null;

      if (isEyesClosed) {
        if (!eyeClosedStartTime) {
          setEyeClosedStartTime(Date.now());
        } else {
          const eyeClosedDuration = Date.now() - eyeClosedStartTime;
          if (eyeClosedDuration >= EYE_CLOSED_THRESHOLD && !eyesClosed) {
            // Eyes have been closed long enough to trigger mode switch
            setEyesClosed(true);
            setModeIndex((prev) => (prev + 1) % modes.length);
          }
        }
      } else {
        setEyeClosedStartTime(null);
        setEyesClosed(false);
      }

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

    window.webgazer.setGazeListener(gazeListener);

    return () => {
      window.webgazer.clearGazeListener();
    };
  }, [
    isInitialized,
    navigate,
    getGazeRegion,
    currentGaze,
    gazeStartTime,
    activeRegion,
    eyeClosedStartTime,
    eyesClosed,
    modes.length,
  ]);

  useEffect(() => {
    if (!activeRegion) return;

    const currentMode = modes[modeIndex % modes.length];

    if (currentMode === "character") {
      const label = GAZE_REGIONS[activeRegion].label;
      setInputText((prev) => prev + label + " ");
      const selectedRanges = inputText
        .trim()
        .split(" ")
        .concat(label.trim());
      fetchPredictions(selectedRanges);
    } else if (currentMode === "word") {
      const index = Object.keys(GAZE_REGIONS).indexOf(activeRegion);
      const word = wordOptions[index]?.prompt || "";
      setInputText((prev) => prev + word + " ");
    } else if (currentMode === "sentence") {
      const index = Object.keys(GAZE_REGIONS).indexOf(activeRegion);
      const sentence = sentenceOptions[index] || "";
      setInputText((prev) => prev + sentence + " ");
    }

    setActiveRegion(null);
    setGazeStartTime(null);
  }, [activeRegion, modeIndex, inputText, modes]);

  // Initialize predictions when the component mounts
  useEffect(() => {
    const initialRanges = Object.values(GAZE_REGIONS).map(
      (region) => region.label
    );
    fetchPredictions(initialRanges);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 opacity-70" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-30" />


      {/* Letter regions */}
      <div className="relative w-full h-screen grid grid-cols-3 grid-rows-3 gap-8 p-8">
        {/* Top row */}
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-64
              ${
                currentGaze === "left-up"
                  ? "bg-white/30 border-white/40 shadow-lg scale-105"
                  : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
              }
              mt-16`}
        >
          {(() => {
            const predictions = getPredictionForRegion("left-up");
            return (
              <>
                <div className="font-serif text-5xl text-white mb-2">
                  {predictions[0]}
                </div>
                <div className="font-serif text-3xl text-gray-400">
                  {predictions[1]}
                </div>
                <div className="font-serif text-2xl text-gray-600">
                  {predictions[2]}
                </div>
              </>
            );
          })()}
        </div>
        <div></div>
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-64
              ${
                currentGaze === "right-up"
                  ? "bg-white/30 border-white/40 shadow-lg scale-105"
                  : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
              }
              mt-16`}
        >
          {(() => {
            const predictions = getPredictionForRegion("right-up");
            return (
              <>
                <div className="font-serif text-5xl text-white mb-2">
                  {predictions[0]}
                </div>
                <div className="font-serif text-3xl text-gray-400">
                  {predictions[1]}
                </div>
                <div className="font-serif text-2xl text-gray-600">
                  {predictions[2]}
                </div>
              </>
            );
          })()}
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
          </div>

          {/* Instructions */}
          <div className="text-center text-white/60 text-lg">
            Close your eyes for 1.5 seconds to switch modes
          </div>
          <div className="text-center text-white/80 text-lg">
            Current Mode: {modes[modeIndex % modes.length].toUpperCase()}
          </div>
        </div>
        <div></div>

        {/* Bottom row */}
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-64
              ${
                currentGaze === "left-down"
                  ? "bg-white/30 border-white/40 shadow-lg scale-105"
                  : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
              }
              mb-16`}
        >
          {(() => {
            const predictions = getPredictionForRegion("left-down");
            return (
              <>
                <div className="font-serif text-5xl text-white mb-2">
                  {predictions[0]}
                </div>
                <div className="font-serif text-3xl text-gray-400">
                  {predictions[1]}
                </div>
                <div className="font-serif text-2xl text-gray-600">
                  {predictions[2]}
                </div>
              </>
            );
          })()}
        </div>
        <div></div>
        <div
          className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-64
              ${
                currentGaze === "right-down"
                  ? "bg-white/30 border-white/40 shadow-lg scale-105"
                  : "bg-white/10 border-white/20 hover:bg-white/20 scale-100"
              }
              mb-16`}
        >
          {(() => {
            const predictions = getPredictionForRegion("right-down");
            return (
              <>
                <div className="font-serif text-5xl text-white mb-2">
                  {predictions[0]}
                </div>
                <div className="font-serif text-3xl text-gray-400">
                  {predictions[1]}
                </div>
                <div className="font-serif text-2xl text-gray-600">
                  {predictions[2]}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TextInputPage;