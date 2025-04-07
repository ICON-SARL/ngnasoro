
import React, { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VoiceAssistantProps {
  message: string;
  language?: 'french' | 'english' | 'bambara';
  autoPlay?: boolean;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ message, language = 'french', autoPlay = false }) => {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Définir la langue
    switch(language) {
      case 'french':
        utterance.lang = 'fr-FR';
        break;
      case 'english':
        utterance.lang = 'en-US';
        break;
      case 'bambara':
        // Le bambara n'a pas de voix standard, utilisation du français comme solution de repli
        utterance.lang = 'fr-FR';
        break;
      default:
        utterance.lang = 'fr-FR';
    }
    
    // Parler le message
    window.speechSynthesis.speak(utterance);
  };

  // Lecture automatique si activée
  useEffect(() => {
    if (autoPlay) {
      speak();
    }
  }, [autoPlay, message]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={speak}
            className="rounded-full h-9 w-9"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Assistance vocale</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoiceAssistant;
