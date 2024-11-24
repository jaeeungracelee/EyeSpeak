  // src/pages/SpeakPage.jsx
  import { useState, useEffect, useCallback } from "react";
  import { Eye, RefreshCcw } from "lucide-react";
  import { useWebGazer } from "../context/WebGazerContext";
  import { useNavigate } from "react-router-dom";
  import { H3, P } from '../components/Typography';
  import SpeechToTextComponent from '../components/SpeechToText';

  const GAZE_THRESHOLD = 1000; // 1 second
  const GAZE_REGIONS = {
    "left-up": { letters: "A-F", label: "A-F" },
    "right-up": { letters: "G-M", label: "G-M" },
    "left-down": { letters: "N-T", label: "N-T" },
    "right-down": { letters: "U-Z", label: "U-Z" },
  };

  const SpeakPage = () => {
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
    const [contextText, setContextText] = useState("");
    const modes = ["character", "word", "sentence"];

    const getGazeRegion = useCallback((x, y) => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (y < screenHeight * 0.4) {
        if (x < screenWidth * 0.4) return "left-up";
        if (x > screenWidth * 0.6) return "right-up";
        if (x >= screenWidth * 0.4 && x <= screenWidth * 0.6) return "mode-switch";
      } else if (y > screenHeight * 0.6) {
        if (x < screenWidth * 0.4) return "left-down";
        if (x > screenWidth * 0.6) return "right-down";
      }

      return "center";
    }, []);
    
    const getPredictionForRegion = (region) => {
      if (region === "mode-switch") {
        return ["Switch Mode", `Next: ${modes[(modeIndex + 1) % modes.length].toUpperCase()}`, ""];
      }

      const letterRange = GAZE_REGIONS[region]?.label || "Unknown";
      const index = Object.keys(GAZE_REGIONS).indexOf(region);
      const word =
        wordOptions[index]?.prompt || "No prediction available";
      const sentence =
        sentenceOptions[index] || "No prediction available";

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
              context: contextText,
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
        if (window.webgazer) {
          window.webgazer.showVideo(false);
        }
      };

      init();

      return () => {
        if (window.webgazer) {
          window.webgazer.showVideo(false);
        }
      };
    }, [isInitialized, initializeWebGazer, navigate]);

    useEffect(() => {
      const gazeListener = async (data, elapsedTime) => {
        if (!data) return;
        const region = getGazeRegion(data.x, data.y);

        if (region !== currentGaze) {
          setCurrentGaze(region);
          setGazeStartTime(region === "center" ? null : Date.now());
          setActiveRegion(null);
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
      modes.length,
    ]);

    useEffect(() => {
      if (!activeRegion) return;

      if (activeRegion === "mode-switch") {
        setModeIndex((prev) => (prev + 1) % modes.length);
      } else {
        const currentMode = modes[modeIndex % modes.length];

        if (currentMode === "character") {
          const label = GAZE_REGIONS[activeRegion]?.label || "";
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
      }

      setActiveRegion(null);
      setGazeStartTime(null);
    }, [activeRegion, modeIndex, inputText, modes]);

    useEffect(() => {
      const initialRanges = Object.values(GAZE_REGIONS).map(
        (region) => region.label
      );
      fetchPredictions(initialRanges);
    }, []);

    const convertHyphenFormat = (text) => {
      if(text.length !== 3 || text.charAt(1) !== "-") {
        return text;
      }
      const start = text.charAt(0);
      const end = text.charAt(2);
      const startCode = start.charCodeAt(0);
      const endCode = end.charCodeAt(0);
      let result = "";

      for (let i = startCode; i <= endCode; i++) {
        result += String.fromCharCode(i);
      }

      return result;
    };
    
    return (
      <div className="relative min-h-screen overflow-hidden font-poppins">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-berkeley via-lapis to-spring opacity-90" />

        {/* Letter regions */}
        <div className="relative w-full h-screen grid grid-cols-3 gap-8 p-8">
          {/* Left col */}
          <div className="relative w-full h-full grid grid-rows-2 gap-4">
            <div
              className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-full
                  ${
                    currentGaze === "left-up"
                      ? "bg-custom-white/30 border-custom-white/40 shadow-lg scale-105"
                      : "bg-custom-white/10 border-custom-white/20 hover:bg-custom-white/20"
                  }`}
            >
              {(() => {
                const predictions = getPredictionForRegion("left-up");
                return (
                  <>
                    <div className="font-poppins text-5xl text-custom-white mb-2">
                      {convertHyphenFormat(predictions[0])}
                    </div>
                    <div className="font-poppins text-3xl text-gray-200">
                      {predictions[1]}
                    </div>
                    <div className="font-poppins text-2xl text-gray-400">
                      {predictions[2]}
                    </div>
                  </>
                );
              })()}
            </div>
            <div
              className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-full
                  ${
                    currentGaze === "left-down"
                      ? "bg-custom-white/30 border-custom-white/40 shadow-lg scale-105"
                      : "bg-custom-white/10 border-custom-white/20 hover:bg-custom-white/20"
                  }`}
            >
              {(() => {
                const predictions = getPredictionForRegion("left-down");
                return (
                  <>
                    <div className="font-poppins text-5xl text-custom-white mb-2">
                      {convertHyphenFormat(predictions[0])}
                    </div>
                    <div className="font-poppins text-3xl text-gray-200">
                      {predictions[1]}
                    </div>
                    <div className="font-poppins text-2xl text-gray-400">
                      {predictions[2]}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          {/* Mid col */}
          <div >
          <div className="text-center font-poppins text-custom-white/60 text-lg">
                Gaze at "Switch Mode" to cycle modes
              </div>
            <div
              className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-56 gap-100
                  ${
                    currentGaze === "mode-switch"
                      ? "bg-custom-white/30 border-custom-white/40 shadow-lg scale-105"
                      : "bg-custom-white/10 border-custom-white/20 hover:bg-custom-white/20"
                  }`}
            >
              <div className="font-poppins text-5xl text-custom-white">
                Switch Mode
              </div>
              <div className="font-poppins text-3xl text-gray-200">
                Next Mode: {modes[(modeIndex + 1) % modes.length].toUpperCase()}
              </div>
            </div>
            <div className="col-span-3 flex flex-col items-center justify-center space-y-8">
              {/* Input field */}
              <div className="bg-custom-white/10 backdrop-blur-md rounded-xl p-8 border border-custom-white/20 w-full max-w-3xl">
                <H3 className="font-poppins text-custom-white mb-4">Text:</H3>
                <P className="font-poppins text-custom-white text-xl min-h-[3rem]">
                  {inputText || "|"}
                </P>
              </div>

              <SpeechToTextComponent setter={setContextText} />
        
              {/* Control buttons */}
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => setInputText("")}
                  className="bg-custom-white/10 backdrop-blur-md font-poppins text-custom-white px-8 py-4 rounded-lg border border-custom-white/20 hover:bg-custom-white/20 transition-all duration-200 flex items-center gap-4"
                >
                  <RefreshCcw className="w-6 h-6" />
                  Clear
                </button>
              </div>

              {/* Instructions */}
              <div className="text-center font-poppins text-custom-white/80 text-lg">
                Current Mode: {modes[modeIndex % modes.length].toUpperCase()}
              </div>
            </div>
          </div>
          {/* Right col */}
          <div className="relative w-full h-full grid grid-rows-2 gap-4">
            <div
              className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-full gap-4
                  ${
                    currentGaze === "right-up"
                      ? "bg-custom-white/30 border-custom-white/40 shadow-lg scale-105"
                      : "bg-custom-white/10 border-custom-white/20 hover:bg-custom-white/20"
                  }`}
            >
              {(() => {
                const predictions = getPredictionForRegion("right-up");
                return (
                  <>
                    <div className="font-poppins text-5xl text-custom-white mb-2">
                      {convertHyphenFormat(predictions[0])}
                    </div>
                    <div className="font-poppins text-3xl text-gray-200">
                      {predictions[1]}
                    </div>
                    <div className="font-poppins text-2xl text-gray-400">
                      {predictions[2]}
                    </div>
                  </>
                );
              })()}
            </div>
            <div
            className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center w-full h-full
                ${
                  currentGaze === "right-down"
                    ? "bg-custom-white/30 border-custom-white/40 shadow-lg scale-105"
                    : "bg-custom-white/10 border-custom-white/20 hover:bg-custom-white/20"
                }`}
          >
            {(() => {
              const predictions = getPredictionForRegion("right-down");
              return (
                <>
                  <div className="font-poppins text-5xl text-custom-white mb-2">
                    {convertHyphenFormat(predictions[0])}
                  </div>
                  <div className="font-poppins text-3xl text-gray-200">
                    {predictions[1]}
                  </div>
                  <div className="font-poppins text-2xl text-gray-400">
                    {predictions[2]}
                  </div>
                </>
              );
            })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default SpeakPage;
