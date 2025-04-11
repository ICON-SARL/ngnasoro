
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface NetworkStatusAlertsProps {
  isOnline: boolean;
  isError: boolean;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}

export function NetworkStatusAlerts({ 
  isOnline, 
  isError, 
  isRetrying, 
  retryCount, 
  maxRetries, 
  onRetry 
}: NetworkStatusAlertsProps) {
  if (!isOnline) {
    return (
      <Alert variant="destructive">
        <WifiOff className="h-4 w-4" />
        <div className="ml-2">
          <AlertTitle>Vous êtes hors ligne</AlertTitle>
          <AlertDescription>
            <p>Vérifiez votre connexion internet et réessayez.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> 
              Vérifier la connexion
            </Button>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <div className="ml-2">
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            <p>Impossible de charger les SFDs: Problème de connexion au serveur. Veuillez vérifier votre réseau.</p>
            <p className="text-sm mt-1">
              {isRetrying ? (
                `Nouvelles tentatives en cours... (${retryCount}/${maxRetries})`
              ) : (
                retryCount >= maxRetries ? "Nombre maximal de tentatives atteint." : ""
              )}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              className="mt-2"
              disabled={isRetrying || !isOnline}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} /> 
              Réessayer manuellement
            </Button>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return null;
}
