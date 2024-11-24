import { createContext, useContext, useState, useEffect } from "react";

const WebGazerContext = createContext(null);

// Kalman Filter implementation for smoother predictions
class KalmanFilter {
  constructor() {
    this.Q = 0.005; // Process noise (lower = smoother but more latency)
    this.R = 0.5;   // Measurement noise (higher = less sensitive to small movements)
    this.P = 1;     // Error covariance
    this.X = null;  // State estimate
    this.K = 0;     // Kalman gain
  }

  filter(measurement) {
    // Initialize state with first measurement
    if (this.X === null) {
      this.X = measurement;
      return measurement;
    }

    // Prediction
    const prior = this.X;
    const priorP = this.P + this.Q;

    // Update
    this.K = priorP / (priorP + this.R);
    this.X = prior + this.K * (measurement - prior);
    this.P = (1 - this.K) * priorP;

    return this.X;
  }
}

export const WebGazerProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [xFilter] = useState(new KalmanFilter());
  const [yFilter] = useState(new KalmanFilter());

  // Moving average buffer for additional smoothing
  const bufferSize = 15;  // Increased buffer size for more smoothing
  const [xBuffer, setXBuffer] = useState([]);
  const [yBuffer, setYBuffer] = useState([]);

  const calculateMovingAverage = (buffer) => {
    if (buffer.length === 0) return 0;
    return buffer.reduce((a, b) => a + b, 0) / buffer.length;
  };

  const updateBuffer = (buffer, newValue, setter) => {
    const newBuffer = [...buffer, newValue];
    if (newBuffer.length > bufferSize) {
      newBuffer.shift();
    }
    setter(newBuffer);
    return calculateMovingAverage(newBuffer);
  };

  const optimizeCanvasForReadback = () => {
    const canvasElements = document.getElementsByTagName('canvas');
    for (let canvas of canvasElements) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        canvas.getContext('2d', { willReadFrequently: true }).putImageData(imageData, 0, 0);
      }
    }
  };

  const initializeWebGazer = async () => {
    if (!isInitialized) {
      try {
        // Optimize WebGazer parameters for stability
        window.webgazer.params.showVideo = false;
        window.webgazer.params.showFaceOverlay = true;
        window.webgazer.params.showPredictionPoints = true;
        
        // Reduce camera resolution for better performance
        window.webgazer.params.camConstraints = { 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 24 }  // Reduced frame rate for stability
          }
        };

        // Adjust core WebGazer parameters for stability
        window.webgazer.params.sizeConstants.FACEBOX_PERCENTAGE = 80;  // Increased face detection box
        window.webgazer.params.dataWindow = 700;  // Increased data window for more stable predictions
        window.webgazer.params.trailingBufferLength = 25;  // Increased buffer length
        window.webgazer.params.showFaceFeedbackBox = true;
        
        // Initialize with optimized settings
        await window.webgazer
          .setRegression("weightedRidge")  // Changed to weightedRidge for better accuracy
          .setTracker("TFFacemesh")
          .applyKalmanFilter(true)  // Enable built-in Kalman filter
          .begin();

        // Apply canvas optimizations
        optimizeCanvasForReadback();

        // Custom gaze processing
        const gazeProcessor = (data, elapsedTime) => {
          if (!data) return null;

          // Apply Kalman filtering
          const filteredX = xFilter.filter(data.x);
          const filteredY = yFilter.filter(data.y);

          // Apply moving average
          const smoothX = updateBuffer(xBuffer, filteredX, setXBuffer);
          const smoothY = updateBuffer(yBuffer, filteredY, setYBuffer);

          // Add deadzone to prevent tiny movements
          const deadzone = 5;  // pixels
          const lastX = xBuffer[xBuffer.length - 2] || smoothX;
          const lastY = yBuffer[yBuffer.length - 2] || smoothY;
          
          const finalX = Math.abs(smoothX - lastX) < deadzone ? lastX : smoothX;
          const finalY = Math.abs(smoothY - lastY) < deadzone ? lastY : smoothY;

          // Update WebGazer's prediction point
          if (window.webgazer.params.showPredictionPoints) {
            const point = document.querySelector('.webgazerPredictionPoint');
            if (point) {
              point.style.transition = 'all 0.1s ease-out';  // Smooth transition
              point.style.left = `${finalX}px`;
              point.style.top = `${finalY}px`;
            }
          }

          return { x: finalX, y: finalY, elapsedTime };
        };

        // Register the custom gaze processor
        window.webgazer.setGazeListener(gazeProcessor);

        // Setup cleanup
        const cleanup = () => {
          window.webgazer.end();
          const videoElement = document.getElementById("webgazerVideoContainer");
          if (videoElement) {
            videoElement.remove();
          }
        };

        window.addEventListener('beforeunload', cleanup);

        setIsInitialized(true);
        return true;
      } catch (error) {
        console.error("Failed to initialize webgazer:", error);
        return false;
      }
    }
    return true;
  };

  const positionVideo = (top = "35%") => {
    const videoElement = document.getElementById("webgazerVideoContainer");
    if (videoElement) {
      videoElement.style.position = "absolute";
      videoElement.style.top = "30%";
      videoElement.style.left = "50%";
      videoElement.style.transform = "translate(-50%, -50%)";
      videoElement.style.zIndex = "1000";
      videoElement.style.backgroundColor = "transparent";
    }
  };

  // Periodic optimization
  useEffect(() => {
    if (isInitialized) {
      const optimizationInterval = setInterval(optimizeCanvasForReadback, 10000);
      
      // Add custom CSS for smoother prediction point
      const style = document.createElement('style');
      style.textContent = `
        .webgazerPredictionPoint {
          transition: all 0.1s ease-out !important;
          width: 16px !important;
          height: 16px !important;
          border-radius: 50% !important;
          background-color: rgba(255, 0, 0, 0.5) !important;
          border: 2px solid rgba(255, 0, 0, 0.8) !important;
          transform: translate(-50%, -50%) !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        clearInterval(optimizationInterval);
        style.remove();
      };
    }
  }, [isInitialized]);

  return (
    <WebGazerContext.Provider
      value={{
        isInitialized,
        initializeWebGazer,
        positionVideo,
      }}
    >
      {children}
    </WebGazerContext.Provider>
  );
};

export const useWebGazer = () => {
  const context = useContext(WebGazerContext);
  if (!context) {
    throw new Error("useWebGazer must be used within a WebGazerProvider");
  }
  return context;
};