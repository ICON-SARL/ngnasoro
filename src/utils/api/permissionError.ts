
import { toast } from '@/hooks/use-toast';

interface ApiError extends Error {
  response?: {
    status: number;
    data?: any;
  };
}

export const handleApiPermissionError = (error: unknown, fallbackMessage: string = "Accès refusé") => {
  const apiError = error as ApiError;
  
  // Check if it's a permission error (403 Forbidden)
  if (apiError.response && apiError.response.status === 403) {
    const errorMessage = apiError.response.data?.error || fallbackMessage;
    
    // Show error toast to the user
    toast({
      title: "Permissions insuffisantes",
      description: errorMessage,
      variant: "destructive",
    });
    
    return true; // Indicates the error was handled
  }
  
  return false; // Not a permission error
};

// Utility to check if user can access a specific API endpoint based on role
export const canAccessEndpoint = (role: string | null, endpoint: string): boolean => {
  if (!role) return false;
  
  // Define the permissions map
  const endpointPermissions: Record<string, string[]> = {
    '/api/subventions': ['admin'],
    '/api/loans': ['admin', 'sfd_admin'],
    '/api/apply-loan': ['admin', 'sfd_admin', 'user'],
  };
  
  // Find the matching endpoint pattern
  const matchingEndpoint = Object.keys(endpointPermissions).find(pattern => 
    endpoint.startsWith(pattern)
  );
  
  if (!matchingEndpoint) return false;
  
  // Check if the user's role has permission for this endpoint
  return endpointPermissions[matchingEndpoint].includes(role);
};
