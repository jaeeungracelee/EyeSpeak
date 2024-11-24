import React, { useState } from "react";

const SpeechToTextComponent = (props) => {
  const [transcribedText, setTranscribedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

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
      setIsRecording(true);
    };

    recognition.onspeechend = () => {
      console.log("Voice recognition stopped.");
      recognition.stop();
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
      props.setter(transcript);
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
          <span
            className="material-icons"
            style={{ color: isRecording ? "red" : "white" }}
            >mic
          </span> {/* Microphone icon changes color when recording */}
        </button>
        <p className="text-custom-white/90 text-xl min-h-[3rem]">
          {transcribedText || "Press the mic to start speaking..."}
        </p>
      </div>
    </div>
  );
};

export default SpeechToTextComponent;
