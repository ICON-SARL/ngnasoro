
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  retryFn?: () => void;
  className?: string;
  retryCount?: number;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  retryFn,
  className = '',
  retryCount = 0
}) => {
  // Determine if we should show a different message based on retry count
  const isPersistentError = retryCount > 2;
  
  return (
    <div className={`flex flex-col items-center justify-center p-5 bg-red-50 rounded-xl my-3 ${className}`}>
      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
      
      <h3 className="text-lg font-semibold text-red-700 mb-1">
        {isPersistentError ? "Problème de connexion" : "Erreur de synchronisation"}
      </h3>
      
      <p className="text-sm text-center text-red-600 mb-3">
        {message}
      </p>
      
      {retryFn && (
        <Button 
          onClick={retryFn}
          variant="outline"
          className="border-red-300 hover:bg-red-100 text-red-700 flex items-center gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Réessayer la synchronisation
        </Button>
      )}
      
      {isPersistentError && (
        <p className="text-xs text-red-500 mt-3 text-center">
          Nous rencontrons des difficultés à contacter le serveur. Veuillez réessayer plus tard ou contacter le support.
        </p>
      )}
    </div>
  );
};

export default ErrorState;
