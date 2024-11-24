// src/pages/TestPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Eye, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Camera, Loader } from 'lucide-react';

const CALIBRATION_SEQUENCE = [
  { direction: 'center', label: 'Center' },
  { direction: 'left', label: 'Left' },
  { direction: 'right', label: 'Right' },
  { direction: 'up', label: 'Up' },
  { direction: 'up-left', label: 'Up-Left' },
  { direction: 'up-right', label: 'Up-Right' },
];

const DirectionIndicator = ({ direction }) => {
    const indicators = [
      { position: 'up-left', deg: -45 },
      { position: 'up', deg: 0 },
      { position: 'up-right', deg: 45 },
      { position: 'left', deg: -90 },
      { position: 'center', deg: 0 },
      { position: 'right', deg: 90 }
    ];
  
    return (
      <div className="relative w-52 h-52">
        {/* Direction grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2">
          {indicators.map(({ position }) => (
            <div
              key={position}
              className={`rounded-lg border-2 ${
                direction?.direction === position
                  ? 'border-white bg-white/20 shadow-lg'
                  : 'border-white/20'
              } ${position === 'center' ? 'col-start-2 row-start-2' : ''}
              ${position === 'up' ? 'col-start-2 row-start-1' : ''}
              ${position === 'up-left' ? 'col-start-1 row-start-1' : ''}
              ${position === 'up-right' ? 'col-start-3 row-start-1' : ''}
              ${position === 'left' ? 'col-start-1 row-start-2' : ''}
              ${position === 'right' ? 'col-start-3 row-start-2' : ''}`}
            >
              {direction?.direction === position && (
                <div className="h-full flex items-center justify-center">
                  <Eye className="text-white h-6 w-6 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
  
        {/* Direction label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-lg font-medium">
          {direction ? direction.direction : 'Not detected'}
        </div>
      </div>
    );
  };

 const TestPage = () => {
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [currentCalibrationStep, setCurrentCalibrationStep] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState({});
  const [direction, setDirection] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const [sensitivity, setSensitivity] = useState(0.015); // Default sensitivity

  // Add sensitivity adjustment to the fetch calls
  const detectDirection = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('sensitivity', sensitivity.toString());

    const response = await fetch('http://localhost:8000/detect', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  };
  
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsActive(true);
    } catch (err) {
      setError("Error accessing camera: " + err.message);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg');
    });
  };

  const startTracking = () => {
    // Clear any existing interval
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
  
    // Start new tracking interval
    trackingIntervalRef.current = setInterval(async () => {
      try {
        const blob = await captureFrame();
        if (!blob) return;
  
        const data = await detectDirection(blob);  // Use the detectDirection function
        if (data.error) {
          setError(data.error);
        } else {
          setDirection(data);
          setError(null);
        }
      } catch (err) {
        setError("Detection error: " + err.message);
      }
    }, 100);
  };

  const calibrateDirection = async () => {
    const currentDirection = CALIBRATION_SEQUENCE[currentCalibrationStep].direction;
    
    try {
      // Capture left eye
      const leftBlob = await captureFrame();
      if (!leftBlob) {
        setError("Failed to capture frame");
        return;
      }
  
      const leftFormData = new FormData();
      leftFormData.append('file', leftBlob);
      leftFormData.append('direction', currentDirection);
      leftFormData.append('is_left', 'true');
      
      // Capture right eye
      const rightBlob = await captureFrame();
      if (!rightBlob) {
        setError("Failed to capture frame");
        return;
      }
  
      const rightFormData = new FormData();
      rightFormData.append('file', rightBlob);
      rightFormData.append('direction', currentDirection);
      rightFormData.append('is_left', 'false');
      
      // Add loading state
      setError("Calibrating...");
      
      const responses = await Promise.all([
        fetch('http://localhost:8000/calibrate', { 
          method: 'POST', 
          body: leftFormData 
        }).then(res => res.json()),
        fetch('http://localhost:8000/calibrate', { 
          method: 'POST', 
          body: rightFormData 
        }).then(res => res.json())
      ]);
  
      // Check if both calibrations were successful
      if (responses[0].status === 'success' && responses[1].status === 'success') {
        setCalibrationProgress(prev => ({
          ...prev,
          [currentDirection]: true
        }));
  
        if (currentCalibrationStep < CALIBRATION_SEQUENCE.length - 1) {
          setCurrentCalibrationStep(prev => prev + 1);
        } else {
          setIsCalibrating(false);
          startTracking();
        }
        setError(null);
      } else {
        setError("Calibration failed. Please try again.");
      }
    } catch (err) {
      setError("Calibration error: " + err.message);
    }
  };
  

  const handleRecalibrate = () => {
    // Stop tracking
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
    // Reset calibration state
    setIsCalibrating(true);
    setCurrentCalibrationStep(0);
    setCalibrationProgress({});
    setDirection(null);
  };

  const getDirectionIcon = () => {
    if (!direction) return <Eye className="h-12 w-12 text-white" />;
    
    switch (direction.direction) {
      case 'up': return <ArrowUp className="h-12 w-12 text-white" />;
      case 'up-left': return (
        <div className="relative">
          <ArrowUp className="h-12 w-12 text-white" />
          <ArrowLeft className="h-12 w-12 text-white absolute top-0 left-0 opacity-50" />
        </div>
      );
      case 'up-right': return (
        <div className="relative">
          <ArrowUp className="h-12 w-12 text-white" />
          <ArrowRight className="h-12 w-12 text-white absolute top-0 left-0 opacity-50" />
        </div>
      );
      case 'left': return <ArrowLeft className="h-12 w-12 text-white" />;
      case 'right': return <ArrowRight className="h-12 w-12 text-white" />;
      default: return <Eye className="h-12 w-12 text-white" />;
    }
  };

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 opacity-70" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-30" />

      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        {/* Video preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-64 h-48 bg-black/20 backdrop-blur-md rounded-lg mb-8"
          style={{ transform: 'scaleX(-1)' }}
        />

        {isCalibrating ? (
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20 mb-8">
            <h2 className="text-white text-xl mb-4">Calibration</h2>
            <p className="text-white/80 mb-4">
              Look {CALIBRATION_SEQUENCE[currentCalibrationStep].label} and click the button
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {CALIBRATION_SEQUENCE.map((step, index) => (
                <div
                  key={step.direction}
                  className={`w-3 h-3 rounded-full ${
                    calibrationProgress[step.direction]
                      ? 'bg-white'
                      : index === currentCalibrationStep
                      ? 'bg-white/50 animate-pulse'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={calibrateDirection}
              className="bg-white/10 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-white/20 hover:border-white/30 hover:bg-white/20"
            >
              Capture {CALIBRATION_SEQUENCE[currentCalibrationStep].label}
            </button>
          </div>
        ) : (
            <>
            {/* Enhanced direction indicator */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20 mb-8">
              <div className="flex flex-col items-center gap-6">
                <DirectionIndicator direction={direction} />
                
                {direction && (
                  <div className="w-full space-y-4">
                    {/* Confidence bar */}
                    <div>
                      <div className="flex justify-between text-white/80 text-sm mb-1">
                        <span>Confidence</span>
                        <span>{Math.round(direction.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-white/30 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${direction.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Sensitivity slider */}
                    <div>
                      <div className="flex justify-between text-white/80 text-sm mb-1">
                        <span>Sensitivity</span>
                        <span>{(sensitivity * 1000).toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.005"
                        max="0.025"
                        step="0.001"
                        value={sensitivity}
                        onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={handleRecalibrate}
                className="bg-white/10 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-white/20 hover:border-white/30 hover:bg-white/20"
              >
                Recalibrate
              </button>
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500/10 backdrop-blur-md px-4 py-2 rounded-lg border border-red-500/20">
            <p className="text-white/80 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
