// src/context/WebGazerContext.jsx
import { createContext, useContext, useState } from 'react';

const WebGazerContext = createContext(null);

export const WebGazerProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeWebGazer = async () => {
    if (!isInitialized) {
      try {
        await webgazer
          .setRegression('ridge')
          .setTracker('TFFacemesh')
          .begin();
        
        // Set default configurations
        webgazer.showVideo(false);
        webgazer.showFaceOverlay(true);
        webgazer.showPredictionPoints(true);

        setIsInitialized(true);
        return true;
      } catch (error) {
        console.error('Failed to initialize webgazer:', error);
        return false;
      }
    }
    return true;
  };

  const positionVideo = (top = '35%') => {
    const videoElement = document.getElementById('webgazerVideoContainer');
    if (videoElement) {
      videoElement.style.position = 'absolute';
      videoElement.style.top = top;
      videoElement.style.left = '50%';
      videoElement.style.transform = 'translate(-50%, -50%) scale(0.85)';
      videoElement.style.zIndex = '1000';
      videoElement.style.backgroundColor = 'transparent';
      videoElement.style.display = 'none';
    }
  };

  return (
    <WebGazerContext.Provider value={{ 
      isInitialized, 
      initializeWebGazer,
      positionVideo
    }}>
      {children}
    </WebGazerContext.Provider>
  );
};

export const useWebGazer = () => {
  const context = useContext(WebGazerContext);
  if (!context) {
    throw new Error('useWebGazer must be used within a WebGazerProvider');
  }
  return context;
};
