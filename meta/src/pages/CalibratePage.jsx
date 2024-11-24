// src/pages/SetupPage.jsx
import { useWebGazer } from "../context/WebGazerContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

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
    // Mark setup as complete
    localStorage.setItem('setupComplete', 'true');

    navigate("/speak"); // Use navigate instead of window.location
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-berkeley via-lapis to-spring opacity-90" />

      {/* Floating gradient orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-spring rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-lapis rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-50" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-berkeley rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-50" />

      {currentStep === 0 ? (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-custom-white/10 backdrop-blur-md p-4 rounded-full shadow-xl border border-custom-white/40 mb-6">
            <Eye className="h-16 w-16 text-custom-white" />
          </div>
          <h1 className="font-serif text-6xl mb-8 text-custom-white drop-shadow-lg">
            Eye Tracking Setup
          </h1>
          <p className="text-4xl text-custom-white/80 mb-10 text-center max-w-md leading-relaxed">
            We'll need to calibrate your eye tracking. Follow the pulsing
            circles and click each point when prompted.
          </p>
          <button
            onClick={() => setCurrentStep(1)}
            className="bg-custom-white/10 backdrop-blur-md text-custom-white font-bold px-12 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-custom-white/40 hover:border-custom-white/60 hover:bg-custom-white/20"
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
                  <div className="absolute inset-0 bg-custom-white/30 backdrop-blur-md rounded-full animate-ping" />
                )}
                <div
                  className={`relative backdrop-blur-md w-6 h-6 rounded-full border shadow-lg transition-transform cursor-pointer
                    ${
                      index === currentPoint
                        ? "bg-custom-white/40 border-custom-white/60 hover:scale-110"
                        : "bg-custom-white/10 border-custom-white/20"
                    }`}
                />
              </div>
            </div>
          ))}

          {/* Instructions - Positioned below center point */}
          <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 text-center not-calibration-point">
            <h2 className="font-serif text-3xl mb-4 text-custom-white drop-shadow-lg not-calibration-point">
              {currentPoint < CALIBRATION_SEQUENCE.length
                ? `Look at and click the pulsing dot (${currentPoint + 1}/${
                    CALIBRATION_SEQUENCE.length
                  })`
                : "Calibration Complete!"}
            </h2>
            <p className="text-custom-white/90 mb-6 not-calibration-point">
              {CALIBRATION_SEQUENCE[currentPoint]?.label || ""}
            </p>
            {currentPoint >= CALIBRATION_SEQUENCE.length - 1 && (
              <button
                onClick={handleComplete}
                className="bg-custom-white/10 backdrop-blur-md text-custom-white px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-custom-white/40 hover:border-custom-white/60 hover:bg-custom-white/20 not-calibration-point"
              >
                Complete Setup
              </button>
            )}
          </div>

          {/* Feedback overlay */}
          {showFeedback && (
            <div className="fixed top-4 right-4 bg-custom-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-custom-white/40 not-calibration-point">
              <p className="text-custom-white not-calibration-point">
                Point Calibrated!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
