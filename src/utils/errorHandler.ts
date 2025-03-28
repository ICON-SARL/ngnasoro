
import { toast } from "@/components/ui/use-toast";

export enum ErrorType {
  AUTHENTICATION = "AUTHENTICATION",
  NETWORK = "NETWORK",
  SERVER = "SERVER",
  VALIDATION = "VALIDATION",
  DATABASE = "DATABASE",
  UNKNOWN = "UNKNOWN"
}

export interface AppError {
  type: ErrorType;
  message: string;
  technical?: string;
  statusCode?: number;
}

export const handleError = (error: unknown): AppError => {
  console.error("Error caught:", error);
  
  // Default error
  let appError: AppError = {
    type: ErrorType.UNKNOWN,
    message: "Une erreur inattendue s'est produite"
  };
  
  // Handle Supabase errors
  if (error instanceof Error) {
    if (error.message.includes("PGRST")) {
      appError = {
        type: ErrorType.DATABASE,
        message: "Erreur d'accès aux données",
        technical: error.message
      };
    } else if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
      appError = {
        type: ErrorType.NETWORK,
        message: "Problème de connexion au serveur. Vérifiez votre connexion internet.",
        technical: error.message
      };
    } else if (error.message.includes("Email")) {
      appError = {
        type: ErrorType.AUTHENTICATION,
        message: "Informations d'identification invalides",
        technical: error.message
      };
    } else {
      appError = {
        type: ErrorType.UNKNOWN,
        message: "Une erreur s'est produite",
        technical: error.message
      };
    }
  }
  
  // Show toast for user feedback
  toast({
    title: "Erreur",
    description: appError.message,
    variant: "destructive",
  });
  
  return appError;
};

export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorDetail = "Erreur serveur inconnue";
    
    try {
      const errorData = await response.json();
      errorDetail = errorData.message || errorData.error || errorDetail;
    } catch (e) {
      // Couldn't parse JSON error response
    }
    
    const appError: AppError = {
      type: response.status === 401 || response.status === 403 
        ? ErrorType.AUTHENTICATION 
        : ErrorType.SERVER,
      message: response.status === 401 || response.status === 403
        ? "Accès non autorisé"
        : "Erreur serveur",
      technical: errorDetail,
      statusCode: response.status
    };
    
    throw appError;
  }
  
  return response;
};
