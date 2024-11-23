import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { FilmGrain } from '../components/FilmGrain';

export const SetupPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [calibrationPoint, setCalibrationPoint] = useState({ x: 0, y: 0 });
  
  const steps = [
    {
      title: "Welcome to Setup",
      description: "Let's calibrate your eye tracking for the best experience"
    },
    {
      title: "Top Left Corner",
      position: { x: 0, y: 0 }
    },
    {
      title: "Top Right Corner",
      position: { x: "100%", y: 0 }
    },
    {
      title: "Bottom Right Corner",
      position: { x: "100%", y: "100%" }
    },
    {
      title: "Bottom Left Corner",
      position: { x: 0, y: "100%" }
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    if (currentStep > 0 && currentStep < steps.length) {
      setCalibrationPoint(steps[currentStep].position);
    }
  }, [currentStep]);

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
            {steps[currentStep].title}
          </h1>
          <p className="text-lg text-white/80 mb-8 text-center max-w-md">
            {steps[currentStep].description}
          </p>
          <button
            onClick={handleNext}
            className="bg-white/10 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-white/20 hover:border-white/30 hover:bg-white/20"
          >
            Begin Calibration
          </button>
        </div>
      ) : (
        <div className="relative min-h-screen">
          <div 
            className="absolute transition-all duration-500 bg-white/10 backdrop-blur-md p-4 rounded-full shadow-xl border border-white/20"
            style={{
              left: calibrationPoint.x,
              top: calibrationPoint.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Eye className="h-8 w-8 text-white animate-pulse" />
          </div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="font-serif text-2xl mb-2 text-white drop-shadow-lg">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/80 mb-4">
              Look at the pulsing eye icon
            </p>
            <button
              onClick={handleNext}
              className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/20 hover:border-white/30 hover:bg-white/20"
            >
              {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};