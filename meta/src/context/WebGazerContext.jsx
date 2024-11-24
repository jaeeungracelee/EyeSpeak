// src/context/WebGazerContext.jsx
import { createContext, useContext, useState } from "react";

const WebGazerContext = createContext(null);

export const WebGazerProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeWebGazer = async () => {
    if (!isInitialized) {
      try {
        await window.webgazer
          .setRegression("ridge")
          .setTracker("TFFacemesh")
          .begin();

        // Remove the line that shows the video
        // window.webgazer.showVideo(true);

        // Keep other configurations
        window.webgazer.showFaceOverlay(true);
        window.webgazer.showPredictionPoints(true);

        
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
