'use client'
// File: app/setup/page.tsx
import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

const SetupPage = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
      {currentStep === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Eye className="h-16 w-16 text-purple-600 mb-6" />
          <h1 className="font-serif text-4xl mb-4 text-gray-800">
            {steps[currentStep].title}
          </h1>
          <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
            {steps[currentStep].description}
          </p>
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Begin Calibration
          </button>
        </div>
      ) : (
        <>
          <div 
            className="absolute transition-all duration-500 p-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
            style={{
              left: calibrationPoint.x,
              top: calibrationPoint.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Eye className="h-8 w-8 text-purple-600 animate-pulse" />
          </div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="font-serif text-2xl mb-2 text-gray-800">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 mb-4">
              Look at the pulsing eye icon
            </p>
            <button
              onClick={handleNext}
              className="bg-white/80 backdrop-blur-sm text-gray-800 px-6 py-2 rounded-lg shadow hover:shadow-md transition-all duration-200"
            >
              {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SetupPage;