
import React, { useEffect, useState } from 'react';
import { Mic, MicOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceUIProps {
  message: string;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

const VoiceUI: React.FC<VoiceUIProps> = ({ message, onNextStep, onPreviousStep }) => {
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const { toast } = useToast();

  // Check if browser supports speech recognition
  useEffect(() => {
    const checkSpeechRecognition = () => {
      return 'webkitSpeechRecognition' in window || 
             'SpeechRecognition' in window;
    };
    
    setHasSpeechRecognition(checkSpeechRecognition());
    
    // Auto-speak the message if available
    if (message) {
      speakMessage(message);
    }
    
    return () => {
      // Clean up any active speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [message]);

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!hasSpeechRecognition) {
      toast({
        title: "Non supporté",
        description: "Votre navigateur ne supporte pas la reconnaissance vocale.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);

    // For demo purposes, we'll just simulate voice commands
    toast({
      title: "Écoute en cours...",
      description: "Dites 'suivant' ou 'précédent' pour naviguer",
    });

    // Simulate listening for 3 seconds then recognize a command
    setTimeout(() => {
      handleVoiceCommand();
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleVoiceCommand = () => {
    // Simulate random voice command (for demo)
    const commands = ['suivant', 'précédent', 'aucun'];
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    
    if (randomCommand === 'suivant' && onNextStep) {
      toast({
        title: "Commande vocale",
        description: "Commande reconnue: 'Suivant'",
      });
      onNextStep();
    } else if (randomCommand === 'précédent' && onPreviousStep) {
      toast({
        title: "Commande vocale",
        description: "Commande reconnue: 'Précédent'",
      });
      onPreviousStep();
    } else {
      toast({
        title: "Écoute terminée",
        description: "Aucune commande reconnue",
      });
    }
    
    setIsListening(false);
  };

  return (
    <div className="fixed bottom-28 right-4 z-40 flex flex-col items-end">
      <div className="bg-white shadow-md rounded-lg p-3 mb-3 max-w-xs">
        <p className="text-sm text-gray-700">{message}</p>
        
        <div className="flex mt-2 justify-between">
          {onPreviousStep && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPreviousStep}
              className="mr-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          )}
          
          {onNextStep && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNextStep}
              className="ml-auto"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
      
      <Button 
        size="icon" 
        onClick={toggleListening}
        className={`rounded-full size-12 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0D6A51] hover:bg-[#0D6A51]/90'}`}
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default VoiceUI;
