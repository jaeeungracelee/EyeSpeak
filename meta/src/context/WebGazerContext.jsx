import { createContext, useContext, useState, useEffect } from "react";

const WebGazerContext = createContext(null);

export const WebGazerProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const optimizeCanvasForReadback = () => {
    // Find all canvas elements created by WebGazer
    const canvasElements = document.getElementsByTagName('canvas');
    for (let canvas of canvasElements) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      // Force recreation of context with optimized settings
      if (context) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        canvas.getContext('2d', { willReadFrequently: true }).putImageData(imageData, 0, 0);
      }
    }
  };

  const initializeWebGazer = async () => {
    if (!isInitialized) {
      try {
        // Configure WebGazer with optimized settings
        window.webgazer.params.showVideo = true;
        window.webgazer.params.showFaceOverlay = true;
        window.webgazer.params.showPredictionPoints = true;
        window.webgazer.params.camConstraints = { 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          }
        };

        // Initialize WebGazer
        await window.webgazer
          .setRegression("ridge")
          .setTracker("TFFacemesh")
          .begin();

        // Optimize canvas operations
        optimizeCanvasForReadback();

        // Set up performance monitoring
        let lastProcessingTime = 0;
        const performanceMonitor = (data, elapsedTime) => {
          if (data) {
            const currentTime = performance.now();
            const processingTime = currentTime - lastProcessingTime;
            
            // If processing is taking too long, reduce video quality
            if (processingTime > 50) { // More than 50ms per frame
              const currentConstraints = window.webgazer.params.camConstraints.video;
              if (currentConstraints.frameRate.ideal > 15) {
                window.webgazer.params.camConstraints.video.frameRate.ideal -= 5;
                console.debug('Reducing frame rate to:', window.webgazer.params.camConstraints.video.frameRate.ideal);
              }
            }
            
            lastProcessingTime = currentTime;
          }
        };

        window.webgazer.setGazeListener(performanceMonitor);

        // Set up cleanup for when component unmounts
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

  // Periodically check and optimize canvas operations
  useEffect(() => {
    if (isInitialized) {
      const optimizationInterval = setInterval(optimizeCanvasForReadback, 10000);
      return () => clearInterval(optimizationInterval);
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