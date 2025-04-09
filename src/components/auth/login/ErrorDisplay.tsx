
import React from 'react';
import { AlertCircle } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';

interface ErrorDisplayProps {
  message: string | null;
}

const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  if (!message) return null;

  // Simplifier les messages d'erreur pour les rendre plus compréhensibles
  let simplifiedMessage = message;
  
  if (message.includes('invalid email')) {
    simplifiedMessage = "L'email n'est pas valide.";
  } else if (message.includes('rate limit')) {
    simplifiedMessage = "Veuillez attendre avant de réessayer.";
  } else if (message.includes('not found')) {
    simplifiedMessage = "Email non trouvé. Vérifiez votre saisie.";
  }

  return (
    <div className="bg-red-50 p-4 rounded-xl flex items-start shadow-sm">
      <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-red-800">{simplifiedMessage}</p>
        <div className="mt-2">
          <VoiceAssistant message={simplifiedMessage} autoPlay={true} />
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
