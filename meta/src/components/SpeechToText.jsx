import React, { useState } from "react";

const SpeechToTextComponent = () => {
  const [transcribedText, setTranscribedText] = useState("");

  const handleRecordButtonClick = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => {
      console.log("Voice recognition started. Speak into the microphone.");
    };

    recognition.onspeechend = () => {
      console.log("Voice recognition stopped.");
      recognition.stop();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
    };

    recognition.start();
  };

  return (
    <div className="bg-custom-white/10 backdrop-blur-md rounded-xl p-8 border border-custom-white/20">
      <h3 className="text-custom-white mb-4">Speech to Text Input:</h3>
      <div className="flex items-center space-x-4">
        <button
          className="bg-transparent border-none cursor-pointer text-custom-white text-3xl"
          onClick={handleRecordButtonClick}
        >
           <span className="material-icons">mic</span>
        </button>
        <p className="text-custom-white/90 text-xl min-h-[3rem]">
          {transcribedText || "Press the mic to start speaking..."}
        </p>
      </div>
    </div>
  );
};

export default SpeechToTextComponent;
