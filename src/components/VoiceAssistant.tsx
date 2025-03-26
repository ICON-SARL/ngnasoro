
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

interface VoiceAssistantProps {
  message: string;
  autoPlay?: boolean;
  language?: 'bambara' | 'french';
}

const VoiceAssistant = ({ message, autoPlay = false, language = 'bambara' }: VoiceAssistantProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (autoPlay && !isMuted && message) {
      playMessage();
    }
  }, [message, autoPlay, isMuted]);

  const playMessage = () => {
    // In a real implementation, this would use AWS Polly API
    // For now, we're just simulating with console.log
    console.log(`Playing message in ${language}: ${message}`);
    setIsPlaying(true);
    
    // Simulate audio duration based on message length
    const duration = message.length * 100;
    setTimeout(() => {
      setIsPlaying(false);
    }, duration);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <div className={`relative bg-primary text-white p-3 rounded-full shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-primary-foreground/10"
          onClick={isMuted ? toggleMute : playMessage}
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
        {isPlaying && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </div>
      <div className="text-xs mt-1 text-center text-muted-foreground">
        {isMuted ? 'Activer' : 'Assistant vocal'}
      </div>
    </div>
  );
};

export default VoiceAssistant;
