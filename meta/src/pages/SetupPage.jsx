// src/pages/SetupPage.tsx
import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { FilmGrain } from '../components/FilmGrain';

// Define calibration points
const CALIBRATION_POINTS = [
  { x: '50%', y: '50%', label: 'Center' },
  { x: '10%', y: '10%', label: 'Top Left' },
  { x: '90%', y: '10%', label: 'Top Right' },
  { x: '10%', y: '90%', label: 'Bottom Left' },
  { x: '90%', y: '90%', label: 'Bottom Right' },
  { x: '50%', y: '10%', label: 'Top Center' },
  { x: '50%', y: '90%', label: 'Bottom Center' },
  { x: '10%', y: '50%', label: 'Middle Left' },
  { x: '90%', y: '50%', label: 'Middle Right' }
];

export const SetupPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [webgazerInitialized, setWebgazerInitialized] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Initialize webgazer
    const initWebGazer = async () => {
      try {
        await (window ).webgazer
          .setRegression('ridge')
          .setTracker('TFFacemesh')
          .begin();
        
        // Hide video by default
        (window ).webgazer.showVideo(false);
        // Show face overlay for debugging
        (window ).webgazer.showFaceOverlay(true);
        // Show predictions
        (window ).webgazer.showPredictionPoints(true);

        setWebgazerInitialized(true);
      } catch (error) {
        console.error('Failed to initialize webgazer:', error);
      }
    };

    if (currentStep > 0 && !webgazerInitialized) {
      initWebGazer();
    }

    return () => {
      if (webgazerInitialized) {
        (window).webgazer.end();
      }
    };
  }, [currentStep, webgazerInitialized]);

  const handleCalibrationClick = (e) => {
    // Get click coordinates
    const x = e.clientX;
    const y = e.clientY;

    // Add click data to webgazer
    if (webgazerInitialized) {
      (window ).webgazer.recordScreenPosition(x, y, 'click');
      setCalibrationPoints(prev => prev + 1);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 500);
    }
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
            We&#39ll need to calibrate your eye tracking. You&#39ll need to look at and click several dots on the screen to help us understand your eye movements.
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
          {CALIBRATION_POINTS.map((point, index) => (
            <div
              key={index}
              className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: point.x, top: point.y }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full animate-ping" />
                <div className="relative bg-white/20 backdrop-blur-md w-6 h-6 rounded-full border border-white/40 shadow-lg hover:scale-110 transition-transform cursor-pointer" />
              </div>
            </div>
          ))}

          {/* Feedback overlay */}
          {showFeedback && (
            <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
              <p className="text-white">
                Points calibrated: {calibrationPoints}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="font-serif text-2xl mb-2 text-white drop-shadow-lg">
              Look at each point and click it
            </h2>
            <p className="text-white/80 mb-4">
              This helps calibrate the eye tracking to your screen
            </p>
            {calibrationPoints >= 18 && (
              <button
                onClick={() => window.location.href = '/'}
                className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/20 hover:border-white/30 hover:bg-white/20"
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};