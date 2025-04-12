
import React from 'react';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface ErrorStateProps {
  message: string;
  retryFn?: () => void;
  className?: string;
  retryCount?: number;
  canNavigate?: boolean;
  navigateFn?: () => void;
  navigateText?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  retryFn,
  className = '',
  retryCount = 0,
  canNavigate = false,
  navigateFn,
  navigateText = "Voir plus de détails"
}) => {
  // Determine if we should show a different message based on retry count
  const isPersistentError = retryCount > 2;
  
  return (
    <Card className={`border-red-200 ${className}`}>
      <CardHeader className="pb-0">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-red-700">
            {isPersistentError ? "Problème de connexion" : "Erreur de synchronisation"}
          </h3>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-red-600 mb-3">
          {message}
        </p>
        
        {isPersistentError && (
          <div className="bg-red-50 p-3 rounded-md text-xs text-red-600 mb-3">
            <p>Nous rencontrons des difficultés à contacter le serveur. Veuillez essayer les solutions suivantes :</p>
            <ul className="list-disc ml-4 mt-2">
              <li>Vérifiez votre connexion internet</li>
              <li>Actualisez la page et réessayez</li>
              <li>Déconnectez-vous et reconnectez-vous</li>
              <li>Si le problème persiste, contactez le support</li>
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {retryFn && (
          <Button 
            onClick={retryFn}
            variant="outline"
            className="border-red-300 hover:bg-red-100 text-red-700 flex items-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Réessayer
          </Button>
        )}
        
        {canNavigate && navigateFn && (
          <Button 
            onClick={navigateFn}
            variant="ghost"
            className="text-red-600 flex items-center gap-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {navigateText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ErrorState;
