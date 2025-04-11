
import { toast } from '@/hooks/use-toast';

interface ErrorOptions {
  title?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

/**
 * Generic error handler for API errors
 * @param error The error object
 * @param options Custom options for error handling
 */
export function handleError(error: any, options: ErrorOptions = {}) {
  console.error('Error occurred:', error);
  
  const {
    title = 'Erreur',
    variant = 'destructive',
    duration = 5000
  } = options;
  
  // Extract a user-friendly message from the error
  let message = "Une erreur inattendue s'est produite";
  
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.error_description) {
    message = error.error_description;
  }
  
  // Show the error as a toast
  toast({
    title,
    description: message,
    variant,
    duration
  });
}

/**
 * Network-specific error handler
 * @param error The network error
 */
export function handleNetworkError(error: any) {
  let message = "Problème de connexion réseau";
  
  // Handle specific network error types
  if (error?.message?.includes('timeout')) {
    message = "La requête a pris trop de temps. Vérifiez votre connexion internet.";
  } else if (error?.message?.includes('Network request failed')) {
    message = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
  }
  
  handleError(error, {
    title: 'Erreur de connexion',
    description: message
  });
}

export default {
  handleError,
  handleNetworkError
};
