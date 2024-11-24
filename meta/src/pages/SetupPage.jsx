// src/pages/SetupPage.jsx
import { useWebGazer } from "../context/WebGazerContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { FilmGrain } from "../components/FilmGrain";

// Define calibration sequence
const CALIBRATION_SEQUENCE = [
  { x: "10%", y: "10%", label: "Top Left" },
  { x: "90%", y: "90%", label: "Bottom Right" },
  { x: "90%", y: "10%", label: "Top Right" },
  { x: "10%", y: "90%", label: "Bottom Left" },
  { x: "50%", y: "10%", label: "Top Center" },
  { x: "50%", y: "90%", label: "Bottom Center" },
  { x: "10%", y: "50%", label: "Middle Left" },
  { x: "90%", y: "50%", label: "Middle Right" },
  { x: "50%", y: "50%", label: "Center" },
];

export const SetupPage = () => {
  const { initializeWebGazer, positionVideo } = useWebGazer();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [webgazerInitialized, setWebgazerInitialized] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (currentStep > 0) {
        const success = await initializeWebGazer();
        if (success) {
          setWebgazerInitialized(true);
          window.webgazer.showVideo(true); // Show the video feed
          positionVideo();
        }
      }
    };

    init();

    // Hide the video feed when the component unmounts
    return () => {
      if (window.webgazer) {
        window.webgazer.showVideo(false);
      }
    };
  }, [currentStep, initializeWebGazer, positionVideo]);
  const handleCalibrationClick = (e) => {
    if (
      !webgazerInitialized ||
      e.target.className.includes("not-calibration-point")
    )
      return;

    const clickedPoint = {
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    };

    const targetPoint = CALIBRATION_SEQUENCE[currentPoint];
    const targetX = parseInt(targetPoint.x);
    const targetY = parseInt(targetPoint.y);

    // Check if click is close to the current target point
    if (
      Math.abs(clickedPoint.x - targetX) < 5 &&
      Math.abs(clickedPoint.y - targetY) < 5
    ) {
      window.webgazer.recordScreenPosition(e.clientX, e.clientY, "click");
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 500);

      if (currentPoint < CALIBRATION_SEQUENCE.length - 1) {
        setCurrentPoint((prev) => prev + 1);
      }
    }
  };

  const handleComplete = () => {
    // webgazer.saveData(); // Save calibration data
    // Mark setup as complete
    localStorage.setItem('setupComplete', 'true');

    navigate("/text"); // Use navigate instead of window.location
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 opacity-70" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-30" />
      <FilmGrain />

      {currentStep === 0 ? (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-full shadow-xl border border-white/20 mb-6">
            <Eye className="h-16 w-16 text-white" />
          </div>
          <h1 className="font-serif text-4xl mb-4 text-white drop-shadow-lg">
            Eye Tracking Setup
          </h1>
          <p className="text-lg text-white/80 mb-8 text-center max-w-md">
            We'll need to calibrate your eye tracking. Follow the pulsing
            circles and click each point when prompted.
          </p>
          <button
            onClick={() => setCurrentStep(1)}
            className="bg-white/10 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-white/20 hover:border-white/30 hover:bg-white/20"
          >
            Begin Calibration
          </button>
        </div>
      ) : (
        <div className="relative min-h-screen" onClick={handleCalibrationClick}>
          {/* Calibration points */}
          {CALIBRATION_SEQUENCE.map((point, index) => (
            <div
              key={index}
              className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: point.x, top: point.y }}
            >
              <div className="relative">
                {index === currentPoint && (
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full animate-ping" />
                )}
                <div
                  className={`relative backdrop-blur-md w-6 h-6 rounded-full border shadow-lg transition-transform cursor-pointer
                    ${
                      index === currentPoint
                        ? "bg-white/40 border-white/60 hover:scale-110"
                        : "bg-white/10 border-white/20"
                    }`}
                />
              </div>
            </div>
          ))}

          {/* Instructions - Positioned below center point */}
          <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 text-center not-calibration-point">
            <h2 className="font-serif text-2xl mb-2 text-white drop-shadow-lg not-calibration-point">
              {currentPoint < CALIBRATION_SEQUENCE.length
                ? `Look at and click the pulsing dot (${currentPoint + 1}/${
                    CALIBRATION_SEQUENCE.length
                  })`
                : "Calibration Complete!"}
            </h2>
            <p className="text-white/80 mb-4 not-calibration-point">
              {CALIBRATION_SEQUENCE[currentPoint]?.label || ""}
            </p>
            {currentPoint >= CALIBRATION_SEQUENCE.length - 1 && (
              <button
                onClick={handleComplete}
                className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/20 hover:border-white/30 hover:bg-white/20 not-calibration-point"
              >
                Complete Setup
              </button>
            )}
          </div>

          {/* Feedback overlay */}
          {showFeedback && (
            <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 not-calibration-point">
              <p className="text-white not-calibration-point">
                Point Calibrated!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
