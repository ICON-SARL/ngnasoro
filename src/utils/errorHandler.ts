
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
    // Fixed property name from 'description' to match the ErrorOptions interface
    variant: 'destructive'
  });
}

/**
 * Handle API responses and throw standardized errors for non-OK responses
 * @param response The fetch Response object
 * @returns The original response if OK
 */
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorDetail = "Erreur serveur inconnue";
    
    try {
      const errorData = await response.json();
      errorDetail = errorData.message || errorData.error || errorDetail;
    } catch (e) {
      // Couldn't parse JSON error response
    }
    
    const error = new Error(
      response.status === 401 || response.status === 403
        ? "Accès non autorisé"
        : errorDetail || "Erreur serveur"
    );

    // Add additional properties to the error
    Object.assign(error, {
      statusCode: response.status,
      technical: errorDetail
    });
    
    throw error;
  }
  
  return response;
}

export default {
  handleError,
  handleNetworkError,
  handleApiResponse
};
