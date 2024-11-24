import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

const SpeechSynthesis = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  // Get the selected voice from localStorage
  const getSelectedVoice = () => {
    return localStorage.getItem('selectedVoice') || 'NEUTRAL';
  };

  const speakText = async () => {
    if (!text.trim() || isPlaying) return;

    try {
      setIsPlaying(true);
      const selectedVoice = getSelectedVoice();
      
      const response = await fetch(`https://deyelog.jasoncameron.dev/api/synthesize-speech?voice=${selectedVoice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) throw new Error('Speech synthesis failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setAudioElement(null);
      };
      
      audio.onerror = () => {
        console.error('Audio playback failed');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setAudioElement(null);
      };

      setAudioElement(audio);
      await audio.play();
      
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
      setAudioElement(null);
    }
  };

  const stopPlayback = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioElement(null);
    }
  };

  return (
    <button
      onClick={isPlaying ? stopPlayback : speakText}
      disabled={!text.trim()}
      className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200
        ${isPlaying ? 
          'bg-white/30 text-white' : 
          text.trim() ? 
            'bg-white/10 hover:bg-white/20 text-white cursor-pointer' : 
            'bg-white/5 text-white/50 cursor-not-allowed'
        }
      `}
      title={isPlaying ? "Stop speaking" : "Speak text"}
    >
      <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
    </button>
  );
};

export default SpeechSynthesis;