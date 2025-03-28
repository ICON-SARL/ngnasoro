import { toast } from "@/components/ui/use-toast";
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { CacheService } from './cacheService';

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

export const handleError = (error: unknown, userId?: string): AppError => {
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

  // For errors with HTTP status codes
  const errorWithStatus = error as any;
  if (errorWithStatus?.statusCode) {
    appError.statusCode = errorWithStatus.statusCode;
    
    if (errorWithStatus.statusCode === 403) {
      appError.type = ErrorType.AUTHENTICATION;
      appError.message = "Accès refusé";
    } else if (errorWithStatus.statusCode >= 500) {
      appError.type = ErrorType.SERVER;
      appError.message = "Erreur serveur";
    }
  }
  
  // Log the error to our centralized audit system
  const isServerError = appError.statusCode === 500;
  const isPermissionError = appError.statusCode === 403;
  
  if (userId && (isServerError || isPermissionError || appError.type === ErrorType.AUTHENTICATION)) {
    logAuditEvent({
      user_id: userId,
      action: 'error_caught',
      category: AuditLogCategory.SYSTEM,
      severity: isServerError ? AuditLogSeverity.ERROR : AuditLogSeverity.WARNING,
      details: {
        error_type: appError.type,
        status_code: appError.statusCode,
        technical_message: appError.technical
      },
      status: 'failure',
      error_message: appError.message,
      target_resource: errorWithStatus?.url || 'unknown'
    });
    
    // Send alert for critical errors (500)
    if (isServerError) {
      sendErrorAlert(appError);
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

export const handleApiResponse = async (response: Response, userId?: string, options?: {
  cacheKey?: string,
  cacheNamespace?: string,
  cacheTtl?: number,
  invalidateOnError?: boolean
}) => {
  if (!response.ok) {
    let errorDetail = "Erreur serveur inconnue";
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorDetail = errorData.message || errorData.error || errorDetail;
      } else {
        errorDetail = await response.text();
      }
    } catch (e) {
      // Couldn't parse response
      errorDetail = `Erreur (${response.status}): ${response.statusText}`;
    }
    
    const appError: AppError = {
      type: response.status === 401 || response.status === 403 
        ? ErrorType.AUTHENTICATION 
        : response.status === 400
          ? ErrorType.VALIDATION
          : ErrorType.SERVER,
      message: response.status === 401 || response.status === 403
        ? "Accès non autorisé"
        : response.status === 400
          ? "Données invalides"
          : "Erreur serveur",
      technical: errorDetail,
      statusCode: response.status
    };
    
    // Si l'option est activée, invalider le cache associé
    if (options?.invalidateOnError && options.cacheKey) {
      await CacheService.delete(options.cacheKey, options.cacheNamespace);
    }
    
    // Log server and permission errors
    if (userId && (response.status === 500 || response.status === 403)) {
      logAuditEvent({
        user_id: userId,
        action: 'api_error',
        category: AuditLogCategory.SYSTEM,
        severity: response.status === 500 ? AuditLogSeverity.ERROR : AuditLogSeverity.WARNING,
        details: {
          error_type: appError.type,
          status_code: response.status,
          technical_message: errorDetail,
          url: response.url
        },
        status: 'failure',
        error_message: appError.message,
        target_resource: response.url
      });
      
      // Send alert for critical errors (500)
      if (response.status === 500) {
        await sendErrorAlert(appError);
      }
    }
    
    throw appError;
  }
  
  // Si la réponse est une réussite et que nous avons une clé de cache, mettre en cache
  if (options?.cacheKey) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Cloner la réponse pour ne pas la consommer
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        // Mettre en cache la réponse
        await CacheService.set(
          options.cacheKey, 
          data,
          { 
            namespace: options.cacheNamespace || 'api',
            ttl: options.cacheTtl || 5 * 60 * 1000 // 5 minutes par défaut
          }
        );
      }
    } catch (cacheError) {
      console.warn('Erreur lors de la mise en cache:', cacheError);
      // Ne pas échouer si le cache échoue
    }
  }
  
  return response;
};

export const sendErrorAlert = async (error: AppError) => {
  try {
    // Call the edge function to send Slack/Email alerts
    const response = await fetch('/api/alert-critical-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error_type: error.type,
        message: error.message,
        technical_details: error.technical,
        status_code: error.statusCode,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.error("Failed to send error alert:", await response.text());
    }
  } catch (err) {
    console.error("Error sending alert:", err);
    // Don't throw here - this is a background task that shouldn't impact the app
  }
};
