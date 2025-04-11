
import { toast } from '@/hooks/use-toast';

interface ErrorWithMessage {
  message: string;
  status?: number;
  code?: string;
  details?: string;
}

export function handleError(error: unknown): void {
  let displayMessage = "Une erreur s'est produite";
  
  if (typeof error === 'string') {
    displayMessage = error;
  } else if (error instanceof Error) {
    displayMessage = error.message;
  } else if (
    error && 
    typeof error === 'object' && 
    'message' in error && 
    typeof (error as ErrorWithMessage).message === 'string'
  ) {
    const errorObj = error as ErrorWithMessage;
    displayMessage = errorObj.message;
    
    // Add additional error details if available
    if (errorObj.details) {
      displayMessage += `: ${errorObj.details}`;
    }
    
    // Add status code or error code if available
    if (errorObj.status || errorObj.code) {
      displayMessage += ` (${errorObj.status || errorObj.code})`;
    }
  }

  toast({
    title: "Erreur",
    description: displayMessage,
    variant: "destructive",
  });
  
  console.error("Error handled:", error);
}

// Utility function to create an error object with a specific message
export function createError(message: string, code?: string): Error {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
}
