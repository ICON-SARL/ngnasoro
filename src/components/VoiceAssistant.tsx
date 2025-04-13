import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/contexts/LocalizationContext';
import VoiceAssistantService from '@/utils/VoiceAssistantService';

interface VoiceAssistantProps {
  message: string;
  autoPlay?: boolean;
  language?: 'bambara' | 'french';
}

const VoiceAssistant = ({ message, autoPlay = false, language: propLanguage }: VoiceAssistantProps) => {
  const { voiceOverEnabled, toggleVoiceOver, language: contextLanguage } = useLocalization();
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const voiceService = VoiceAssistantService.getInstance();
  const language = propLanguage || contextLanguage;
  
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (autoPlay && voiceOverEnabled && message) {
      playMessage();
    }
    
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      voiceService.stopSpeaking();
    };
  }, [message, autoPlay, voiceOverEnabled, language]);

  const playMessage = () => {
    if (!message || !voiceOverEnabled) return;
    
    setIsPlaying(true);
    
    voiceService.speakInLanguage(message, language);
    
    const duration = message.length * 80;
    
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }
    
    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
    }, duration);
    
    toast({
      title: `${language === 'bambara' ? 'Kuma Baara' : 'Audio en cours'}`,
      description: message.substring(0, 70) + (message.length > 70 ? '...' : ''),
      duration: 3000,
    });
  };

  if (!message) return null;

  return (
    <div className="relative group">
      <div className={`relative bg-primary p-3 rounded-full shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-primary/90 size-10"
          onClick={voiceOverEnabled ? playMessage : toggleVoiceOver}
        >
          {voiceOverEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
        </Button>
        {isPlaying && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </div>
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-800 text-white px-2 py-1 rounded text-xs">
        {isPlaying ? 'En lecture...' : voiceOverEnabled ? 'Lecture vocale' : 'Activer audio'}
      </div>
    </div>
  );
};

export default VoiceAssistant;
